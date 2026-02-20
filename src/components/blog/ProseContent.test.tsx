/**
 * ProseContent component tests
 *
 * Coverage areas:
 *  1. Rendering — HTML content, wrapper element
 *  2. Accessibility — aria-label, aria-labelledby, axe-core
 *  3. Heading structure inside prose HTML
 *  4. Custom className
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { ProseContent } from "./ProseContent";

async function runAxe(container: Element) {
  const results = await axe.run(container);
  return results.violations;
}

const SAMPLE_HTML = `
  <h2 id="introduction">Introduction</h2>
  <p>This is the introductory paragraph of the article.</p>
  <h3 id="details">Details</h3>
  <p>This is a more detailed section.</p>
  <pre><code>const x = 1;</code></pre>
  <blockquote><p>A notable quote.</p></blockquote>
`;

/* ============================================================
   1. Rendering
   ============================================================ */

describe("ProseContent — rendering", () => {
  it("renders the HTML content", () => {
    render(<ProseContent html={SAMPLE_HTML} />);
    expect(screen.getByRole("heading", { name: "Introduction" })).toBeInTheDocument();
    expect(screen.getByText(/introductory paragraph/i)).toBeInTheDocument();
  });

  it("renders headings from the HTML", () => {
    render(<ProseContent html={SAMPLE_HTML} />);
    expect(screen.getByRole("heading", { level: 2, name: "Introduction" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Details" })).toBeInTheDocument();
  });

  it("renders code blocks", () => {
    render(<ProseContent html={SAMPLE_HTML} />);
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
  });

  it("renders blockquotes", () => {
    render(<ProseContent html={SAMPLE_HTML} />);
    expect(screen.getByText(/A notable quote/)).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <ProseContent html={SAMPLE_HTML} className="max-w-prose" />,
    );
    expect(container.firstChild).toHaveClass("max-w-prose");
  });
});

/* ============================================================
   2. Accessibility
   ============================================================ */

describe("ProseContent — accessibility", () => {
  it("has no axe violations with typical article HTML", async () => {
    const { container } = render(
      <ProseContent html={SAMPLE_HTML} ariaLabel="Blog post content" />,
    );
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("applies ariaLabel when provided", () => {
    const { container } = render(
      <ProseContent html="<p>Hello</p>" ariaLabel="Post body" />,
    );
    expect(container.firstChild).toHaveAttribute("aria-label", "Post body");
  });

  it("applies ariaLabelledBy when provided", () => {
    const { container } = render(
      <ProseContent html="<p>Hello</p>" ariaLabelledBy="post-title" />,
    );
    expect(container.firstChild).toHaveAttribute(
      "aria-labelledby",
      "post-title",
    );
  });

  it("does not apply ariaLabel when ariaLabelledBy is provided", () => {
    const { container } = render(
      <ProseContent
        html="<p>Hello</p>"
        ariaLabel="Post body"
        ariaLabelledBy="post-title"
      />,
    );
    // ariaLabelledBy takes precedence
    expect(container.firstChild).not.toHaveAttribute("aria-label");
    expect(container.firstChild).toHaveAttribute(
      "aria-labelledby",
      "post-title",
    );
  });

  it("renders without aria attributes when neither label prop is provided", () => {
    const { container } = render(<ProseContent html="<p>Hello</p>" />);
    expect(container.firstChild).not.toHaveAttribute("aria-label");
    expect(container.firstChild).not.toHaveAttribute("aria-labelledby");
  });
});
