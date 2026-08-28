import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("exposes the value to assistive tech", () => {
    render(<ProgressBar value={42} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps out-of-range values so the fill cannot overflow its track", () => {
    const { rerender } = render(<ProgressBar value={250} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");

    rerender(<ProgressBar value={-30} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });
});
