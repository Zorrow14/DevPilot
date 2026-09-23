import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "./Pagination";

function setup(overrides: Partial<React.ComponentProps<typeof Pagination>> = {}) {
  const onPageChange = vi.fn();

  render(
    <Pagination
      page={2}
      pageSize={25}
      total={57}
      totalPages={3}
      onPageChange={onPageChange}
      label="users"
      {...overrides}
    />,
  );

  return { onPageChange };
}

describe("Pagination", () => {
  it("reports which slice of the total is on screen", () => {
    setup();
    expect(screen.getByText("Showing 26–50 of 57 users")).toBeInTheDocument();
  });

  // The last page is partial, so counting a full page would overshoot the total.
  it("does not overshoot the total on a partial last page", () => {
    setup({ page: 3 });
    expect(screen.getByText("Showing 51–57 of 57 users")).toBeInTheDocument();
  });

  it("says so plainly when there is nothing to show", () => {
    setup({ page: 1, total: 0, totalPages: 1 });
    expect(screen.getByText("No users")).toBeInTheDocument();
  });

  it("hides the controls when everything fits on one page", () => {
    setup({ page: 1, total: 4, totalPages: 1 });
    expect(screen.queryByRole("button", { name: "Next page" })).not.toBeInTheDocument();
  });

  it("moves forward and back from the current page", async () => {
    const { onPageChange } = setup();

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await userEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("cannot page back from the first page", () => {
    setup({ page: 1 });
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  it("cannot page past the last page", () => {
    setup({ page: 3 });
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
});
