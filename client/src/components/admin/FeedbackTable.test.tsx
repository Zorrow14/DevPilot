import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FeedbackTable } from "./FeedbackTable";
import type { Feedback } from "@/src/types";

const setFeedbackStatus = vi.fn();

vi.mock("@/src/lib/api", () => ({
  api: {
    setFeedbackStatus: (...args: unknown[]) => setFeedbackStatus(...args),
  },
}));

function makeFeedback(overrides: Partial<Feedback> = {}): Feedback {
  return {
    id: "feedback-1",
    userId: "user-1",
    userName: "Ada",
    userEmail: "ada@example.com",
    title: "Dashboard is slow",
    message: "The readiness gauge takes a few seconds.",
    type: "bug",
    status: "new",
    createdAt: "2026-08-20",
    updatedAt: "2026-08-20",
    ...overrides,
  };
}

beforeEach(() => {
  setFeedbackStatus.mockResolvedValue(undefined);
});

describe("FeedbackTable", () => {
  it("sends the chosen status to the API", async () => {
    render(<FeedbackTable feedback={[makeFeedback()]} onChanged={vi.fn()} />);

    await userEvent.selectOptions(screen.getByRole("combobox", { name: /status/i }), "in-review");

    await waitFor(() => {
      expect(setFeedbackStatus).toHaveBeenCalledWith("feedback-1", "in-review");
    });
  });

  it("reloads the queue after a successful change", async () => {
    const onChanged = vi.fn();
    render(<FeedbackTable feedback={[makeFeedback()]} onChanged={onChanged} />);

    await userEvent.selectOptions(screen.getByRole("combobox", { name: /status/i }), "resolved");

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it("surfaces a failed status change rather than appearing to succeed", async () => {
    setFeedbackStatus.mockRejectedValue(new Error("Feedback not found."));
    const onChanged = vi.fn();
    render(<FeedbackTable feedback={[makeFeedback()]} onChanged={onChanged} />);

    await userEvent.selectOptions(screen.getByRole("combobox", { name: /status/i }), "resolved");

    expect(await screen.findByText("Feedback not found.")).toBeInTheDocument();
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("renders a read-only badge when no change handler is supplied", () => {
    // The admin overview embeds this panel purely as a summary; showing an
    // editable control there would imply a save that never happens.
    render(<FeedbackTable feedback={[makeFeedback({ status: "resolved" })]} />);

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("resolved")).toBeInTheDocument();
  });

  it("falls back to a placeholder when the submitter did not join in", () => {
    render(<FeedbackTable feedback={[makeFeedback({ userName: "", userEmail: "" })]} />);

    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});
