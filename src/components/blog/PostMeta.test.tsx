/**
 * PostMeta component tests
 *
 * Coverage areas:
 *  1. Rendering — dates, reading time, author, category
 *  2. Date formatting — display text, datetime attributes
 *  3. Updated date — only shown when different from publishedAt
 *  4. Accessibility — axe-core, semantic time elements, ARIA
 *  5. Size variant
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { PostMeta } from "./PostMeta";

async function runAxe(container: Element) {
  const results = await axe.run(container);
  return results.violations;
}

/* ============================================================
   1. Rendering
   ============================================================ */

describe("PostMeta — rendering", () => {
  it("renders publishedAt date", () => {
    render(<PostMeta publishedAt="2024-03-15" />);
    // Should find a <time> element with the date
    const timeEl = document.querySelector("time");
    expect(timeEl).toBeInTheDocument();
    expect(timeEl).toHaveAttribute("datetime", "2024-03-15");
  });

  it("renders reading time when provided", () => {
    render(<PostMeta publishedAt="2024-03-15" readingTimeMinutes={8} />);
    expect(screen.getByText("8 min read")).toBeInTheDocument();
  });

  it("does not render reading time when omitted", () => {
    render(<PostMeta publishedAt="2024-03-15" />);
    expect(screen.queryByText(/min read/)).not.toBeInTheDocument();
  });

  it("renders author when provided", () => {
    render(<PostMeta publishedAt="2024-03-15" author="Jane Smith" />);
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
  });

  it("does not render author when omitted", () => {
    render(<PostMeta publishedAt="2024-03-15" />);
    expect(screen.queryByText(/by /)).not.toBeInTheDocument();
  });

  it("renders category badge when provided", () => {
    render(<PostMeta publishedAt="2024-03-15" category="engineering" />);
    expect(screen.getByText("engineering")).toBeInTheDocument();
  });

  it("does not render category badge when null", () => {
    render(<PostMeta publishedAt="2024-03-15" category={null} />);
    // We check that no badge-like element with a category appears
    // The component renders no extra badge text
    expect(screen.queryByText("engineering")).not.toBeInTheDocument();
  });

  it("merges custom className onto the container", () => {
    const { container } = render(
      <PostMeta publishedAt="2024-03-15" className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

/* ============================================================
   2. Date formatting
   ============================================================ */

describe("PostMeta — date formatting", () => {
  it("uses machine-readable datetime attribute on time element", () => {
    render(<PostMeta publishedAt="2024-03-15" />);
    const timeEl = document.querySelector("time");
    expect(timeEl).toHaveAttribute("datetime", "2024-03-15");
  });

  it("renders a human-readable date string inside time element", () => {
    const { container } = render(<PostMeta publishedAt="2024-03-15" />);
    const timeEl = container.querySelector("time");
    expect(timeEl?.textContent).toMatch(/2024/);
    expect(timeEl?.textContent).toMatch(/Mar/);
  });

  it("renders 'Published' label prefix when updatedAt is also shown", () => {
    render(
      <PostMeta publishedAt="2024-03-15" updatedAt="2024-04-01" />,
    );
    expect(screen.getByText(/Published/)).toBeInTheDocument();
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
  });
});

/* ============================================================
   3. Updated date visibility
   ============================================================ */

describe("PostMeta — updatedAt visibility", () => {
  it("does not render updated date when updatedAt is null", () => {
    render(<PostMeta publishedAt="2024-03-15" updatedAt={null} />);
    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
  });

  it("does not render updated date when updatedAt equals publishedAt", () => {
    render(
      <PostMeta publishedAt="2024-03-15" updatedAt="2024-03-15" />,
    );
    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
  });

  it("renders updated date when it differs from publishedAt", () => {
    render(
      <PostMeta publishedAt="2024-03-15" updatedAt="2024-04-01" />,
    );
    const timeEls = document.querySelectorAll("time");
    expect(timeEls).toHaveLength(2);
    expect(timeEls[1]).toHaveAttribute("datetime", "2024-04-01");
  });
});

/* ============================================================
   4. Accessibility
   ============================================================ */

describe("PostMeta — accessibility (axe-core)", () => {
  it("minimal usage has no axe violations", async () => {
    const { container } = render(<PostMeta publishedAt="2024-03-15" />);
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("all props together has no axe violations", async () => {
    const { container } = render(
      <PostMeta
        publishedAt="2024-03-15"
        updatedAt="2024-04-01"
        readingTimeMinutes={8}
        author="Jane Smith"
        category="engineering"
      />,
    );
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("has an accessible label on the metadata paragraph", () => {
    const { container } = render(<PostMeta publishedAt="2024-03-15" />);
    const meta = container.querySelector('[aria-label="Post metadata"]');
    expect(meta).toBeInTheDocument();
  });

  it("singular reading time has grammatically correct abbr title", () => {
    render(<PostMeta publishedAt="2024-03-15" readingTimeMinutes={1} />);
    const abbr = document.querySelector("abbr");
    expect(abbr).toHaveAttribute(
      "title",
      "Approximately 1 minute to read",
    );
  });

  it("plural reading time has grammatically correct abbr title", () => {
    render(<PostMeta publishedAt="2024-03-15" readingTimeMinutes={5} />);
    const abbr = document.querySelector("abbr");
    expect(abbr).toHaveAttribute(
      "title",
      "Approximately 5 minutes to read",
    );
  });
});

/* ============================================================
   5. Size variant
   ============================================================ */

describe("PostMeta — size variant", () => {
  it("renders without error in sm size", () => {
    render(
      <PostMeta publishedAt="2024-03-15" readingTimeMinutes={3} size="sm" />,
    );
    expect(screen.getByText("3 min read")).toBeInTheDocument();
  });
});
