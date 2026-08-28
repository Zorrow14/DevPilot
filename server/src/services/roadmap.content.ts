import { z } from "zod";

/**
 * The shape of a generated roadmap.
 *
 * This is the single source of truth for three things that must agree or the
 * feature breaks silently:
 *   1. what we ask Gemini to produce (converted to JSON Schema below),
 *   2. what we accept back before writing it to the `Roadmap.content` Json
 *      column — structured output makes conformance likely, not certain, and an
 *      unvalidated model response would become permanently stored bad data,
 *   3. what the client renders.
 *
 * Sections map one-to-one onto the roadmap contents the README promises:
 * weekly plan, recommended skills, mini projects, milestones, mistakes to
 * avoid, and next steps.
 */

/**
 * Bounds the generated plan. Gemini's free tier bills by request, not length,
 * but an unbounded plan produces a timeline nobody scrolls and a slower
 * response; 16 weeks covers the realistic "3 month" upper end of the duration
 * field.
 */
export const MAX_PLAN_WEEKS = 16;

export const roadmapContentSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(600),
  weeklyPlan: z
    .array(
      z.object({
        week: z.number().int().min(1).max(MAX_PLAN_WEEKS),
        focus: z.string().min(1).max(120),
        objectives: z.array(z.string().min(1).max(300)).min(1).max(6),
      }),
    )
    .min(1)
    .max(MAX_PLAN_WEEKS),
  recommendedSkills: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        reason: z.string().min(1).max(300),
      }),
    )
    .min(1)
    .max(12),
  miniProjects: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        description: z.string().min(1).max(400),
      }),
    )
    .min(1)
    .max(6),
  milestones: z
    .array(
      z.object({
        week: z.number().int().min(1).max(MAX_PLAN_WEEKS),
        title: z.string().min(1).max(120),
      }),
    )
    .min(1)
    .max(10),
  mistakesToAvoid: z.array(z.string().min(1).max(300)).min(1).max(8),
  nextSteps: z.array(z.string().min(1).max(300)).min(1).max(8),
});

export type RoadmapContent = z.infer<typeof roadmapContentSchema>;

/**
 * The same schema in the JSON Schema dialect Gemini's `responseJsonSchema`
 * expects. Derived rather than hand-written so the two cannot drift — a
 * hand-copied schema that omits a field yields output our own validator then
 * rejects, which is a failure mode that only shows up against the live API.
 */
const { $schema: _draftMarker, ...generatedSchema } = z.toJSONSchema(roadmapContentSchema, {
  // Gemini rejects `$ref`/`$defs`; inlining keeps the schema self-contained.
  io: "input",
  target: "draft-7",
}) as Record<string, unknown>;

// `$schema` is metadata the API has no use for and has been known to reject.
export const roadmapResponseJsonSchema = generatedSchema;
