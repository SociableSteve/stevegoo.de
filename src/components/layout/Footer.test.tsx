/**
 * Footer component tests
 *
 * Coverage areas:
 *   1. Rendering — copyright, social links conditionally rendered
 *   2. Accessibility — axe-core violations, landmarks, ARIA labels
 *   3. Social link behaviour — correct hrefs, external link attributes
 *   4. Configuration — social links absent when config is empty
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Footer from "./Footer";

/* ============================================================
   Mocks
   ============================================================ */

// We mock SITE_CONFIG so tests are deterministic regardless of
// environment variables set on the machine running the tests.
// The mock is declared at module scope; individual tests that need
// a different config shape override it with vi.mocked().mockReturnValue.

const baseSiteConfig = {
  siteUrl: "https://example.com",
  siteName: "Test Site",
  siteDescription: "A test site",
  authorName: "Jane Doe",
  authorEmail: "jane@example.com",
  githubUsername: "janedoe",
  linkedinUsername: "jane-doe",
  twitterHandle: null,
  postsPerPage: 10,
};

vi.mock("@/lib/config/site.config", () => ({
  SITE_CONFIG: {
    siteUrl: "https://example.com",
    siteName: "Test Site",
    siteDescription: "A test site",
    authorName: "Jane Doe",
    authorEmail: "jane@example.com",
    githubUsername: "janedoe",
    linkedinUsername: "jane-doe",
    twitterHandle: null,
    postsPerPage: 10,
  },
}));

/* ============================================================
   Test helpers
   ============================================================ */

async function runAxe(container: Element) {
  const results = await axe.run(container);
  return results.violations;
}

/* ============================================================
   Setup
   ============================================================ */

beforeEach(() => {
  vi.resetModules();
});

/* ============================================================
   1. Rendering
   ============================================================ */

describe("Footer — rendering", () => {
  it("renders a <footer> element with contentinfo landmark", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });

  it("renders copyright text with the author name", () => {
    render(<Footer />);
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
  });

  it("renders copyright text with the current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it("renders the GitHub social link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: "Jane Doe on GitHub" }),
    ).toBeInTheDocument();
  });

  it("renders the LinkedIn social link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: "Jane Doe on LinkedIn" }),
    ).toBeInTheDocument();
  });

  it("renders a social navigation landmark", () => {
    render(<Footer />);
    expect(
      screen.getByRole("navigation", { name: "Social links" }),
    ).toBeInTheDocument();
  });
});

/* ============================================================
   2. Accessibility — axe-core
   ============================================================ */

describe("Footer — accessibility (axe-core)", () => {
  it("has no axe violations with all social links present", async () => {
    const { container } = render(<Footer />);
    const violations = await runAxe(container);
    expect(violations).toHaveLength(0);
  });

  it("GitHub link has an accessible name", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "Jane Doe on GitHub" });
    expect(link).toHaveAccessibleName();
  });

  it("LinkedIn link has an accessible name", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "Jane Doe on LinkedIn" });
    expect(link).toHaveAccessibleName();
  });
});

/* ============================================================
   3. Social link behaviour
   ============================================================ */

describe("Footer — social link behaviour", () => {
  it("GitHub link points to the correct URL", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "Jane Doe on GitHub" });
    expect(link).toHaveAttribute("href", "https://github.com/janedoe");
  });

  it("LinkedIn link points to the correct URL", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "Jane Doe on LinkedIn" });
    expect(link).toHaveAttribute("href", "https://linkedin.com/in/jane-doe");
  });

  it("social links open in a new tab", () => {
    render(<Footer />);
    const links = screen
      .getAllByRole("link")
      .filter(
        (l) =>
          l.getAttribute("aria-label")?.includes("GitHub") ||
          l.getAttribute("aria-label")?.includes("LinkedIn"),
      );
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
    }
  });

  it("social links have rel='noopener noreferrer' for security", () => {
    render(<Footer />);
    const links = screen
      .getAllByRole("link")
      .filter(
        (l) =>
          l.getAttribute("aria-label")?.includes("GitHub") ||
          l.getAttribute("aria-label")?.includes("LinkedIn"),
      );
    for (const link of links) {
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});

/* ============================================================
   4. Configuration — conditional rendering
   ============================================================ */

describe("Footer — conditional social links", () => {
  it("renders no social nav when neither GitHub nor LinkedIn is configured", async () => {
    // Temporarily override the module mock with null usernames
    // by re-importing with a different mock value.
    // Since vi.mock is hoisted, we test this by rendering a version of
    // Footer that uses a controlled config. The easiest approach in
    // Vitest is to spy on the module export for this specific test.
    //
    // Because SITE_CONFIG is a plain object (not a function), we directly
    // mutate within a controlled scope. We restore afterward.

    const { SITE_CONFIG } = await import("@/lib/config/site.config");

    // Cast to any so we can mutate the readonly mock object in tests
    const mutable = SITE_CONFIG as Record<string, unknown>;
    const originalGithub = mutable["githubUsername"];
    const originalLinkedin = mutable["linkedinUsername"];

    mutable["githubUsername"] = null;
    mutable["linkedinUsername"] = null;

    const { unmount } = render(<Footer />);

    expect(
      screen.queryByRole("navigation", { name: "Social links" }),
    ).not.toBeInTheDocument();

    unmount();

    // Restore
    mutable["githubUsername"] = originalGithub;
    mutable["linkedinUsername"] = originalLinkedin;
  });

  it("renders only the GitHub link when LinkedIn is not configured", async () => {
    const { SITE_CONFIG } = await import("@/lib/config/site.config");
    const mutable = SITE_CONFIG as Record<string, unknown>;
    const originalLinkedin = mutable["linkedinUsername"];

    mutable["linkedinUsername"] = null;

    render(<Footer />);

    expect(
      screen.getByRole("link", { name: "Jane Doe on GitHub" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Jane Doe on LinkedIn" }),
    ).not.toBeInTheDocument();

    mutable["linkedinUsername"] = originalLinkedin;
  });

  it("has no axe violations when no social links are configured", async () => {
    const { SITE_CONFIG } = await import("@/lib/config/site.config");
    const mutable = SITE_CONFIG as Record<string, unknown>;
    const originalGithub = mutable["githubUsername"];
    const originalLinkedin = mutable["linkedinUsername"];

    mutable["githubUsername"] = null;
    mutable["linkedinUsername"] = null;

    const { container, unmount } = render(<Footer />);
    const violations = await runAxe(container);
    expect(violations).toHaveLength(0);

    unmount();
    mutable["githubUsername"] = originalGithub;
    mutable["linkedinUsername"] = originalLinkedin;
  });
});

// Re-export the baseSiteConfig shape reference so TypeScript is satisfied
// (the import is used only in describe labels above, prevent unused-var lint)
export type { };
void baseSiteConfig;
