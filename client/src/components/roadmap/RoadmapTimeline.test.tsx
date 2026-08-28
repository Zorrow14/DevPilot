import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoadmapTimeline } from "./RoadmapTimeline";
import type { Roadmap } from "@/src/types";

const setRoadmapWeek = vi.fn();

vi.mock("@/src/lib/api", () => ({
  api: {
    setRoadmapWeek: (...args: unknown[]) => setRoadmapWeek(...args),
  },
}));

function makeRoadmap(overrides: Partial<Roadmap> = {}): Roadmap {
  return {
    id: "roadmap-1",
    goal: "Become internship ready",
    targetRole: "Frontend Developer Intern",
    duration: "3 weeks",
    currentSkills: ["React"],
    completedWeeks: [1],
    createdAt: "2026-08-28",
    title: "Frontend Sprint",
    description: "A short plan.",
    steps: [
      {
        id: "week-1",
        week: 1,
        title: "Week 1: TypeScript",
        description: "Type an API client.",
        duration: "1 week",
        status: "completed",
      },
      {
        id: "week-2",
        week: 2,
        title: "Week 2: React",
        description: "Build a loading state.",
        duration: "1 week",
        status: "active",
      },
    ],
    content: {
      title: "Frontend Sprint",
      summary: "A short plan.",
      weeklyPlan: [
        { week: 1, focus: "TypeScript", objectives: ["Type an API client."] },
        { week: 2, focus: "React", objectives: ["Build a loading state."] },
      ],
      recommendedSkills: [{ name: "TypeScript", reason: "Every listing asks for it." }],
      miniProjects: [{ title: "Expense tracker", description: "CRUD with optimistic updates." }],
      milestones: [{ week: 2, title: "First case study drafted" }],
      mistakesToAvoid: ["Starting a fourth project."],
      nextSteps: ["Apply to five listings."],
    },
    ...overrides,
  };
}

beforeEach(() => {
  setRoadmapWeek.mockResolvedValue(undefined);
});

describe("RoadmapTimeline", () => {
  it("sends the week number, not the list index, when a week is ticked", async () => {
    // The plan can start at any week and arrive sorted; sending an index would
    // silently mark the wrong week complete.
    const roadmap = makeRoadmap({
      completedWeeks: [],
      steps: [
        {
          id: "week-4",
          week: 4,
          title: "Week 4: Deployment",
          description: "Ship it.",
          duration: "1 week",
          status: "active",
        },
      ],
    });
    render(<RoadmapTimeline roadmap={roadmap} onChanged={vi.fn()} />);

    await userEvent.click(screen.getByRole("switch"));

    await waitFor(() => {
      expect(setRoadmapWeek).toHaveBeenCalledWith("roadmap-1", 4, true);
    });
  });

  it("unticks a completed week", async () => {
    render(<RoadmapTimeline roadmap={makeRoadmap()} onChanged={vi.fn()} />);

    await userEvent.click(screen.getAllByRole("switch")[0]);

    await waitFor(() => {
      expect(setRoadmapWeek).toHaveBeenCalledWith("roadmap-1", 1, false);
    });
  });

  it("reloads the roadmap after a successful change", async () => {
    const onChanged = vi.fn();
    render(<RoadmapTimeline roadmap={makeRoadmap()} onChanged={onChanged} />);

    await userEvent.click(screen.getAllByRole("switch")[1]);

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it("surfaces a failure instead of silently leaving the toggle flipped", async () => {
    setRoadmapWeek.mockRejectedValue(new Error("Roadmap not found."));
    const onChanged = vi.fn();
    render(<RoadmapTimeline roadmap={makeRoadmap()} onChanged={onChanged} />);

    await userEvent.click(screen.getAllByRole("switch")[1]);

    expect(await screen.findByText("Roadmap not found.")).toBeInTheDocument();
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("reports progress against the number of weeks in the plan", () => {
    render(<RoadmapTimeline roadmap={makeRoadmap()} onChanged={vi.fn()} />);

    expect(screen.getByText("1 / 2 weeks done")).toBeInTheDocument();
  });

  it("renders every section the generator promises", () => {
    render(<RoadmapTimeline roadmap={makeRoadmap()} onChanged={vi.fn()} />);

    expect(screen.getByText("Recommended skills")).toBeInTheDocument();
    expect(screen.getByText("Mini projects")).toBeInTheDocument();
    expect(screen.getByText("Milestones")).toBeInTheDocument();
    expect(screen.getByText("Mistakes to avoid")).toBeInTheDocument();
    expect(screen.getByText("Next steps")).toBeInTheDocument();
    expect(screen.getByText(/Apply to five listings/)).toBeInTheDocument();
  });

  it("renders the timeline without the detail sections when content is unreadable", () => {
    // A row whose stored JSON failed validation still has to display.
    render(<RoadmapTimeline roadmap={makeRoadmap({ content: null })} onChanged={vi.fn()} />);

    expect(screen.getByText("Frontend Sprint")).toBeInTheDocument();
    expect(screen.queryByText("Mini projects")).not.toBeInTheDocument();
  });
});
