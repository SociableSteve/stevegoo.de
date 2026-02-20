/**
 * PostCard component tests
 *
 * Coverage areas:
 *  1. Rendering — title, excerpt, meta, category badge, tags
 *  2. Internal post — link href, no external indicators
 *  3. External post — href is external URL, "External" badge, target=_blank,
 *     rel="noopener noreferrer", sr-only "(opens in new tab)"
 *  4. Accessibility — axe-core violations, heading structure, article element
 *  5. No-category / minimal fields — graceful omission of optional UI
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import {
  SUMMARY_TYPESCRIPT_GENERICS,
  SUMMARY_EXTERNAL_DEVTO,
  SUMMARY_NO_CATEGORY,
  SUMMARY_MINIMAL_FIELDS,
} from "@/test/fixtures/post.fixtures";
import { PostCard } from "./PostCard";

// Mock next/link to render a plain anchor for test assertions
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

async function runAxe(container: Element) {
  const results = await axe.run(container);
  return results.violations;
}

/* ============================================================
   1. Rendering
   ============================================================ */

describe("PostCard — rendering", () => {
  it("renders post title", () => {
    render(<PostCard post={SUMMARY_TYPESCRIPT_GENERICS} />);
    expect(
      screen.getByRole("heading", { name: /Understanding TypeScript Generics/i }),
    ).toBeInTheDocument();
  });

  it("renders description/excerpt", () => {
    render(<PostCard post={SUMMARY_TYPESCRIPT_GENERICS} />);
    expect(
      screen.getByText(/deep dive into generic types/i),
    ).toBeInTheDocument();
  });

  it("renders category badge", () => {
    render(<PostCard post={SUMMARY_TYPESCRIPT_GENERICS} />);
    // Category badge in the card header
    const badges = screen.getAllByText("engineering");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("renders tags as a list", () => {
    render(<PostCard post={SUMMARY_TYPESCRIPT_GENERICS} />);
    const tagList = screen.getByRole("list", { name: /post tags/i });
    expect(tagList).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("generics")).toBeInTheDocument();
  });

  it("renders reading time via PostMeta", () => {
    render(<PostCard post={SUMMARY_TYPESCRIPT_GENERICS} />);
    expect(screen.getByText("8 min read")).toBeInTheDocument();
  });

  it("renders as an <article> element", () => {
    const { container } = render(
      <PostCard post={SUMMARY_TYPESCRIPT_GENERICS} />,
    );
    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <PostCard post={SUMMARY_TYPESCRIPT_GENERICS} className="my-class" />,
    );
    expect(container.querySelector("article")).toHaveClass("my-class");
  });
});

/* ============================================================
   2. Internal post
   ============================================================ */

describe("PostCard — internal post", () => {
  it("links to internal /blog/{slug} path", () => {
    render(<PostCard post={SUMMARY_TYPESCRIPT_GENERICS} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "/blog/understanding-typescript-generics",
    );
  });

  it("does not render External badge", () => {
    render(<PostCard post={SUMMARY_TYPESCRIPT_GENERICS} />);
    expect(screen.queryByText("External")).not.toBeInTheDocument();
  });

  it("does not open in a new tab", () => {
    render(<PostCard post={SUMMARY_TYPESCRIPT_GENERICS} />);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
  });
});

/* ============================================================
   3. External post
   ============================================================ */

describe("PostCard — external post", () => {
  it("links to the external URL", () => {
    render(<PostCard post={SUMMARY_EXTERNAL_DEVTO} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://dev.to/author/building-accessible-forms",
    );
  });

  it("opens in a new tab", () => {
    render(<PostCard post={SUMMARY_EXTERNAL_DEVTO} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("has rel=noopener noreferrer", () => {
    render(<PostCard post={SUMMARY_EXTERNAL_DEVTO} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders External badge", () => {
    render(<PostCard post={SUMMARY_EXTERNAL_DEVTO} />);
    expect(screen.getByText("External")).toBeInTheDocument();
  });

  it("includes screen-reader-only '(opens in new tab)' in link", () => {
    render(<PostCard post={SUMMARY_EXTERNAL_DEVTO} />);
    const link = screen.getByRole("link");
    expect(link.textContent).toContain("(opens in new tab)");
  });
});

/* ============================================================
   4. Accessibility
   ============================================================ */

describe("PostCard — accessibility (axe-core)", () => {
  it("internal post has no axe violations", async () => {
    const { container } = render(
      <PostCard post={SUMMARY_TYPESCRIPT_GENERICS} />,
    );
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("external post has no axe violations", async () => {
    const { container } = render(<PostCard post={SUMMARY_EXTERNAL_DEVTO} />);
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("no-category post has no axe violations", async () => {
    const { container } = render(<PostCard post={SUMMARY_NO_CATEGORY} />);
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("title is an h2 heading", () => {
    render(<PostCard post={SUMMARY_TYPESCRIPT_GENERICS} />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Understanding TypeScript Generics/i,
      }),
    ).toBeInTheDocument();
  });
});

/* ============================================================
   5. No-category / minimal fields
   ============================================================ */

describe("PostCard — optional fields absent", () => {
  it("does not render category badge when category is null", () => {
    render(<PostCard post={SUMMARY_NO_CATEGORY} />);
    // The category badge row should be empty / hidden
    // We check that no badge text "null" appears
    expect(screen.queryByText("null")).not.toBeInTheDocument();
  });

  it("does not render tags list when tags array is empty", () => {
    render(<PostCard post={SUMMARY_NO_CATEGORY} />);
    expect(screen.queryByRole("list", { name: /post tags/i })).not.toBeInTheDocument();
  });

  it("renders minimal post without errors", () => {
    render(<PostCard post={SUMMARY_MINIMAL_FIELDS} />);
    expect(
      screen.getByRole("heading", { name: /A Post With Only Required Fields/i }),
    ).toBeInTheDocument();
  });
});
