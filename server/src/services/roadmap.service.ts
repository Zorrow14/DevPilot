import type { Roadmap } from "@prisma/client";

import { GEMINI_MODEL, getGeminiClient } from "../config/gemini";
import { prisma } from "../lib/prisma";
import { NotFoundError, ServiceUnavailableError, ValidationError } from "../utils/errors";
import {
  MAX_PLAN_WEEKS,
  type RoadmapContent,
  roadmapContentSchema,
  roadmapResponseJsonSchema,
} from "./roadmap.content";

export type GenerateRoadmapPayload = {
  goal: string;
  targetRole: string;
  duration: string;
  currentSkills?: string[];
};

/**
 * A single week of the plan, as the client renders it. Derived rather than
 * stored: `status` is a function of which weeks the user has ticked off, so
 * persisting it would create a second copy that can disagree with
 * `completedWeeks`.
 */
export type RoadmapStepView = {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: "planned" | "active" | "completed";
  week: number;
};

function buildPrompt(payload: GenerateRoadmapPayload) {
  const skills = payload.currentSkills?.length
    ? payload.currentSkills.join(", ")
    : "none stated";

  // Stated as constraints rather than prose: the response shape is already
  // pinned by the JSON schema, so the prompt only needs to supply context and
  // the judgement calls a schema cannot express.
  return [
    "You are a senior engineering mentor building a learning roadmap for a student aiming at their first developer internship.",
    "",
    `Career goal: ${payload.goal}`,
    `Target role: ${payload.targetRole}`,
    `Preferred duration: ${payload.duration}`,
    `Skills they already have: ${skills}`,
    "",
    "Requirements:",
    `- Fit the weekly plan to the stated duration, never exceeding ${MAX_PLAN_WEEKS} weeks. Number weeks consecutively from 1.`,
    "- Build on the skills they already have instead of repeating them from scratch.",
    "- Recommend concrete, specific technologies and practices, not generic advice.",
    "- Mini projects must be small enough to finish inside the plan and worth showing an interviewer.",
    "- Milestones must reference a week number that exists in the weekly plan.",
    "- Mistakes to avoid should be specific to this target role.",
  ].join("\n");
}

/**
 * Translates a failed generation into something a user can act on.
 *
 * Free-tier quota exhaustion is the expected failure here, and it is neither
 * the caller's fault nor a bug — reporting it as a 500 would send them looking
 * for a problem with their input.
 */
function toGenerationError(error: unknown): Error {
  if (error instanceof ServiceUnavailableError || error instanceof ValidationError) {
    return error;
  }

  const status = (error as { status?: unknown })?.status;
  const message = error instanceof Error ? error.message : String(error);

  if (status === 429 || /quota|rate limit|RESOURCE_EXHAUSTED/i.test(message)) {
    return new ServiceUnavailableError(
      "The AI roadmap service has reached its request limit. Please try again later.",
    );
  }

  if (status === 401 || status === 403 || /API key|PERMISSION_DENIED/i.test(message)) {
    return new ServiceUnavailableError(
      "AI roadmap generation is not configured correctly on this server.",
    );
  }

  console.error("Gemini roadmap generation failed:", error);

  return new ServiceUnavailableError(
    "The AI roadmap service is temporarily unavailable. Please try again.",
  );
}

async function generateContent(payload: GenerateRoadmapPayload): Promise<RoadmapContent> {
  const client = await getGeminiClient();

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildPrompt(payload),
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: roadmapResponseJsonSchema,
    },
  });

  const text = response.text;

  if (!text) {
    // An empty body usually means the response was cut off by a safety filter
    // or the token limit, neither of which retrying the same prompt will fix.
    throw new ServiceUnavailableError("The AI roadmap service returned an empty response.");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ServiceUnavailableError("The AI roadmap service returned an unreadable response.");
  }

  // Structured output makes conformance likely, not guaranteed. Validating here
  // keeps malformed content out of the Json column, where it would be a
  // permanent render failure rather than one bad request.
  const result = roadmapContentSchema.safeParse(parsed);

  if (!result.success) {
    throw new ServiceUnavailableError(
      "The AI roadmap service returned an unexpected response. Please try again.",
    );
  }

  return result.data;
}

/**
 * Reads the stored Json back into the generated shape.
 *
 * Rows written before a schema change — or by hand — can fail this, so it
 * degrades to a usable empty roadmap rather than throwing and taking down the
 * whole list for one bad row.
 */
function parseStoredContent(value: Roadmap["content"]): RoadmapContent | null {
  const result = roadmapContentSchema.safeParse(value);

  return result.success ? result.data : null;
}

function toSteps(content: RoadmapContent, completedWeeks: number[]): RoadmapStepView[] {
  const done = new Set(completedWeeks);
  const weeks = [...content.weeklyPlan].sort((a, b) => a.week - b.week);

  // "Active" is the earliest week still outstanding — the one thing the user
  // should be working on now. Everything after it that is not ticked stays
  // planned rather than silently counting as done.
  const activeWeek = weeks.find((entry) => !done.has(entry.week))?.week;

  return weeks.map((entry) => ({
    id: `week-${entry.week}`,
    week: entry.week,
    title: `Week ${entry.week}: ${entry.focus}`,
    description: entry.objectives.join(" "),
    duration: "1 week",
    status: done.has(entry.week) ? "completed" : entry.week === activeWeek ? "active" : "planned",
  }));
}

function formatRoadmap(roadmap: Roadmap) {
  const content = parseStoredContent(roadmap.content);

  return {
    id: roadmap.id,
    goal: roadmap.goal,
    targetRole: roadmap.targetRole,
    duration: roadmap.duration,
    currentSkills: roadmap.currentSkills,
    completedWeeks: roadmap.completedWeeks,
    createdAt: roadmap.createdAt.toISOString().slice(0, 10),
    // title/description keep the field names the client already renders; the
    // generated body supplies them instead of them being separate columns.
    title: content?.title ?? roadmap.goal,
    description: content?.summary ?? "",
    steps: content ? toSteps(content, roadmap.completedWeeks) : [],
    content,
  };
}

export type RoadmapView = ReturnType<typeof formatRoadmap>;

async function findOwnedRoadmap(roadmapId: string, userId: string) {
  const roadmap = await prisma.roadmap.findFirst({
    where: {
      id: roadmapId,
      userId,
    },
  });

  if (!roadmap) {
    throw new NotFoundError("Roadmap");
  }

  return roadmap;
}

export async function getRoadmaps(userId: string) {
  const roadmaps = await prisma.roadmap.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return roadmaps.map(formatRoadmap);
}

export async function generateRoadmap(userId: string, payload: GenerateRoadmapPayload) {
  let content: RoadmapContent;

  try {
    content = await generateContent(payload);
  } catch (error) {
    throw toGenerationError(error);
  }

  const roadmap = await prisma.roadmap.create({
    data: {
      userId,
      goal: payload.goal,
      targetRole: payload.targetRole,
      duration: payload.duration,
      currentSkills: payload.currentSkills ?? [],
      content,
      completedWeeks: [],
    },
  });

  return formatRoadmap(roadmap);
}

/** Ticks a single week of the plan on or off. */
export async function setWeekCompletion(
  userId: string,
  roadmapId: string,
  week: number,
  completed: boolean,
) {
  const roadmap = await findOwnedRoadmap(roadmapId, userId);
  const content = parseStoredContent(roadmap.content);

  if (!content?.weeklyPlan.some((entry) => entry.week === week)) {
    throw new ValidationError("That week is not part of this roadmap.");
  }

  const current = new Set(roadmap.completedWeeks);

  if (completed) {
    current.add(week);
  } else {
    current.delete(week);
  }

  const updated = await prisma.roadmap.update({
    where: {
      id: roadmapId,
    },
    data: {
      completedWeeks: [...current].sort((a, b) => a - b),
    },
  });

  return formatRoadmap(updated);
}

export async function deleteRoadmap(userId: string, roadmapId: string) {
  await findOwnedRoadmap(roadmapId, userId);

  await prisma.roadmap.delete({
    where: {
      id: roadmapId,
    },
  });
}
