/**
 * Badge component tests
 *
 * Coverage areas:
 *  1. Rendering — variants, dot indicator, children
 *  2. Dismiss functionality — button presence, label, callback
 *  3. Accessibility — axe-core violations, ARIA, keyboard
 *  4. Edge cases — numeric children, complex children
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { Badge } from "./Badge";

/* ============================================================
   Axe helper
   ============================================================ */

async function runAxe(container: Element) {
  const results = await axe.run(container);
  return results.violations;
}

/* ============================================================
   1. Rendering
   ============================================================ */

describe("Badge — rendering", () => {
  it("renders label text", () => {
    render(<Badge>TypeScript</Badge>);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("renders as a span element", () => {
    const { container } = render(<Badge>Tag</Badge>);
    expect(container.firstChild?.nodeName).toBe("SPAN");
  });

  it.each([
    "default",
    "neutral",
    "success",
    "warning",
    "error",
  ] as const)("renders %s variant without crashing", (variant) => {
    render(<Badge variant={variant}>Label</Badge>);
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("renders dot indicator when showDot is true", () => {
    const { container } = render(<Badge showDot>Active</Badge>);
    // Dot is a decorative span with aria-hidden inside the badge span
    const dot = container.querySelector('span > span[aria-hidden="true"]');
    expect(dot).toBeInTheDocument();
  });

  it("does not render dot when showDot is false", () => {
    const { container } = render(<Badge showDot={false}>Inactive</Badge>);
    const dot = container.querySelector('span > span[aria-hidden="true"]');
    expect(dot).not.toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <Badge className="my-class">Label</Badge>,
    );
    expect(container.firstChild).toHaveClass("my-class");
  });

  it("renders numeric children", () => {
    render(<Badge>{42}</Badge>);
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});

/* ============================================================
   2. Dismiss functionality
   ============================================================ */

describe("Badge — dismiss", () => {
  it("renders dismiss button when onDismiss is provided", () => {
    render(<Badge onDismiss={() => {}}>React</Badge>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does not render dismiss button when onDismiss is absent", () => {
    render(<Badge>React</Badge>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("dismiss button has auto-generated aria-label from text children", () => {
    render(<Badge onDismiss={() => {}}>TypeScript</Badge>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Remove TypeScript",
    );
  });

  it("uses explicit dismissLabel when provided", () => {
    render(
      <Badge onDismiss={() => {}} dismissLabel="Remove TypeScript filter">
        TypeScript
      </Badge>,
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Remove TypeScript filter",
    );
  });

  it("falls back to 'Remove' for complex children without dismissLabel", () => {
    render(
      <Badge onDismiss={() => {}}>
        <span>Complex</span>
      </Badge>,
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Remove",
    );
  });

  it("calls onDismiss when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();
    render(<Badge onDismiss={handleDismiss}>React</Badge>);
    await user.click(screen.getByRole("button"));
    expect(handleDismiss).toHaveBeenCalledOnce();
  });

  it("calls onDismiss when Enter is pressed on dismiss button", async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();
    render(<Badge onDismiss={handleDismiss}>React</Badge>);
    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");
    expect(handleDismiss).toHaveBeenCalledOnce();
  });

  it("calls onDismiss when Space is pressed on dismiss button", async () => {
    const user = userEvent.setup();
    const handleDismiss = vi.fn();
    render(<Badge onDismiss={handleDismiss}>React</Badge>);
    screen.getByRole("button").focus();
    await user.keyboard(" ");
    expect(handleDismiss).toHaveBeenCalledOnce();
  });
});

/* ============================================================
   3. Accessibility — axe-core
   ============================================================ */

describe("Badge — accessibility (axe-core)", () => {
  it("default variant has no axe violations", async () => {
    const { container } = render(<Badge variant="default">Category</Badge>);
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("neutral variant has no axe violations", async () => {
    const { container } = render(<Badge variant="neutral">Metadata</Badge>);
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("success variant has no axe violations", async () => {
    const { container } = render(<Badge variant="success">Published</Badge>);
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("warning variant has no axe violations", async () => {
    const { container } = render(<Badge variant="warning">Draft</Badge>);
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("error variant has no axe violations", async () => {
    const { container } = render(<Badge variant="error">Failed</Badge>);
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("badge with dismiss button has no axe violations", async () => {
    const { container } = render(
      <Badge onDismiss={() => {}}>TypeScript</Badge>,
    );
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("badge with dot and dismiss has no axe violations", async () => {
    const { container } = render(
      <Badge variant="success" showDot onDismiss={() => {}}>
        Online
      </Badge>,
    );
    expect(await runAxe(container)).toHaveLength(0);
  });
});

/* ============================================================
   4. Keyboard navigation
   ============================================================ */

describe("Badge — keyboard navigation", () => {
  it("dismiss button is reachable via Tab", async () => {
    const user = userEvent.setup();
    render(<Badge onDismiss={() => {}}>React</Badge>);
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
  });

  it("badge without dismiss is not a tab stop", async () => {
    const user = userEvent.setup();
    render(<Badge>React</Badge>);
    await user.tab();
    // Nothing interactive in the badge — active element should be body
    expect(document.activeElement).toBe(document.body);
  });
});
