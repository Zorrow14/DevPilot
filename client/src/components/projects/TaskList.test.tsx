import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskList } from "./TaskList";
import type { Task } from "@/src/types";

vi.mock("@/src/lib/api", () => ({
  api: { updateTask: vi.fn(), deleteTask: vi.fn() },
}));

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    projectId: "project-1",
    title: "Write hero copy",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    completed: false,
    ...overrides,
  };
}

const TASKS: Task[] = [
  makeTask({ id: "t1", title: "Todo low", status: "todo", priority: "low" }),
  makeTask({ id: "t2", title: "Doing high", status: "in-progress", priority: "high" }),
  makeTask({ id: "t3", title: "Done high", status: "done", priority: "high", completed: true }),
];

describe("TaskList filtering", () => {
  it("shows every task by default", () => {
    render(<TaskList tasks={TASKS} onChanged={vi.fn()} />);

    expect(screen.getByText("Todo low")).toBeInTheDocument();
    expect(screen.getByText("Doing high")).toBeInTheDocument();
    expect(screen.getByText("Done high")).toBeInTheDocument();
  });

  it("narrows by status", async () => {
    render(<TaskList tasks={TASKS} onChanged={vi.fn()} />);

    await userEvent.selectOptions(screen.getByLabelText("Filter by status"), "done");

    expect(screen.getByText("Done high")).toBeInTheDocument();
    expect(screen.queryByText("Todo low")).not.toBeInTheDocument();
  });

  it("narrows by priority", async () => {
    render(<TaskList tasks={TASKS} onChanged={vi.fn()} />);

    await userEvent.selectOptions(screen.getByLabelText("Filter by priority"), "high");

    expect(screen.getByText("Doing high")).toBeInTheDocument();
    expect(screen.queryByText("Todo low")).not.toBeInTheDocument();
  });

  it("applies status and priority together", async () => {
    render(<TaskList tasks={TASKS} onChanged={vi.fn()} />);

    await userEvent.selectOptions(screen.getByLabelText("Filter by status"), "in-progress");
    await userEvent.selectOptions(screen.getByLabelText("Filter by priority"), "high");

    expect(screen.getByText("Doing high")).toBeInTheDocument();
    expect(screen.queryByText("Done high")).not.toBeInTheDocument();
  });

  it("explains an empty result from filters rather than looking like no tasks exist", async () => {
    render(<TaskList tasks={TASKS} onChanged={vi.fn()} />);

    await userEvent.selectOptions(screen.getByLabelText("Filter by status"), "done");
    await userEvent.selectOptions(screen.getByLabelText("Filter by priority"), "low");

    expect(screen.getByText("No tasks match the current filters.")).toBeInTheDocument();
    expect(screen.queryByText("No tasks yet")).not.toBeInTheDocument();
  });

  it("shows the add-a-task empty state when the project genuinely has none", () => {
    render(<TaskList tasks={[]} onChanged={vi.fn()} />);

    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
    expect(screen.queryByLabelText("Filter by status")).not.toBeInTheDocument();
  });

  it("counts open tasks against the full list, not the filtered view", async () => {
    render(<TaskList tasks={TASKS} onChanged={vi.fn()} />);

    await userEvent.selectOptions(screen.getByLabelText("Filter by status"), "done");

    expect(screen.getByText(/1 shown \/ 2 open \/ 3 total/)).toBeInTheDocument();
  });
});
