import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import axe from "axe-core";
import SkipLink from "./SkipLink";

describe("SkipLink", () => {
  it("renders skip link with correct href", () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole("link", { name: "Skip to main content" });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("has skip-to-content class for styling", () => {
    render(<SkipLink />);

    const skipLink = screen.getByRole("link");
    expect(skipLink).toHaveClass("skip-to-content");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SkipLink />);
    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});