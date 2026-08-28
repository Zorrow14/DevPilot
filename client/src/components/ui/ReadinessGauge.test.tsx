import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReadinessGauge } from "./ReadinessGauge";

describe("ReadinessGauge", () => {
  it("renders the score and an accessible label", () => {
    render(<ReadinessGauge value={78} />);

    expect(screen.getByText("78%")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Readiness: 78%" })).toBeInTheDocument();
  });

  it("clamps values outside 0-100 in both the label and the readout", () => {
    // readinessScore is computed server-side, but the gauge is also fed raw
    // percentages elsewhere; an out-of-range value must not draw outside the dial.
    const { rerender } = render(<ReadinessGauge value={140} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Readiness: 100%" })).toBeInTheDocument();

    rerender(<ReadinessGauge value={-20} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Readiness: 0%" })).toBeInTheDocument();
  });

  it("uses a custom label in both the caption and the accessible name", () => {
    render(<ReadinessGauge value={40} label="Backend readiness" />);

    expect(screen.getByRole("img", { name: "Backend readiness: 40%" })).toBeInTheDocument();
    expect(screen.getByText("Backend readiness")).toBeInTheDocument();
  });
});
