import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SkillEditForm } from "./SkillEditForm";
import type { Skill } from "@/src/types";

const updateSkill = vi.fn();

vi.mock("@/src/lib/api", () => ({
  api: { updateSkill: (...args: unknown[]) => updateSkill(...args) },
}));

function makeSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: "skill-1",
    name: "React",
    category: "Frontend",
    level: "intermediate",
    progress: 45,
    lastPracticed: "2026-08-20",
    notes: "Practising hooks.",
    ...overrides,
  };
}

beforeEach(() => {
  updateSkill.mockResolvedValue(undefined);
});

describe("SkillEditForm", () => {
  it("pre-fills every field from the skill being edited", () => {
    render(<SkillEditForm skill={makeSkill()} onSaved={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText("Skill name")).toHaveValue("React");
    expect(screen.getByLabelText("Progress %")).toHaveValue(45);
    expect(screen.getByLabelText("Notes")).toHaveValue("Practising hooks.");
    expect(screen.getByLabelText("Level")).toHaveValue("intermediate");
  });

  it("saves the edited values", async () => {
    render(<SkillEditForm skill={makeSkill()} onSaved={vi.fn()} onCancel={vi.fn()} />);

    const progress = screen.getByLabelText("Progress %");
    await userEvent.clear(progress);
    await userEvent.type(progress, "80");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateSkill).toHaveBeenCalledWith(
        "skill-1",
        expect.objectContaining({ progress: 80, name: "React" }),
      );
    });
  });

  it("sends a re-typed progress as a number, not the raw input string", async () => {
    // Must be typed, not left at the default: the default is already a number,
    // so an untouched field would pass even without valueAsNumber. The server
    // rejects a non-integer progress, so a string here would 400.
    render(<SkillEditForm skill={makeSkill()} onSaved={vi.fn()} onCancel={vi.fn()} />);

    const progress = screen.getByLabelText("Progress %");
    await userEvent.clear(progress);
    await userEvent.type(progress, "30");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(updateSkill).toHaveBeenCalled());
    expect(updateSkill.mock.calls[0][1].progress).toBe(30);
  });

  it("clears empty notes to null rather than sending an empty string", async () => {
    render(
      <SkillEditForm skill={makeSkill({ notes: "" })} onSaved={vi.fn()} onCancel={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(updateSkill).toHaveBeenCalled());
    expect(updateSkill.mock.calls[0][1].notes).toBeNull();
  });

  it("blocks the request and shows a field message when a name is cleared", async () => {
    render(<SkillEditForm skill={makeSkill()} onSaved={vi.fn()} onCancel={vi.fn()} />);

    await userEvent.clear(screen.getByLabelText("Skill name"));
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("Skill name is required.")).toBeInTheDocument();
    expect(updateSkill).not.toHaveBeenCalled();
  });

  it("rejects an out-of-range progress before it reaches the API", async () => {
    render(<SkillEditForm skill={makeSkill()} onSaved={vi.fn()} onCancel={vi.fn()} />);

    const progress = screen.getByLabelText("Progress %");
    await userEvent.clear(progress);
    await userEvent.type(progress, "150");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(
      await screen.findByText("Progress must be a whole number between 0 and 100."),
    ).toBeInTheDocument();
    expect(updateSkill).not.toHaveBeenCalled();
  });

  it("keeps a category that is not one of the presets", () => {
    // Editing an unusual category must not silently recategorise the skill.
    render(
      <SkillEditForm
        skill={makeSkill({ category: "Quantum Computing" })}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Category")).toHaveValue("Quantum Computing");
  });

  it("surfaces a server rejection without calling onSaved", async () => {
    updateSkill.mockRejectedValue(new Error("Skill not found."));
    const onSaved = vi.fn();
    render(<SkillEditForm skill={makeSkill()} onSaved={onSaved} onCancel={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("Skill not found.")).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
