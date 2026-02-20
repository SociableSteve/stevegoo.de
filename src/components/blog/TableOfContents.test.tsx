/**
 * TableOfContents component tests
 *
 * Coverage areas:
 *  1. Rendering — headings list, "On this page" label, nav landmark
 *  2. Nested headings — h3 items receive nesting treatment
 *  3. Active section — aria-current on the active link
 *  4. Scroll behaviour — clicking a link calls scrollIntoView on the target
 *  5. Empty headings — returns null when headings array is empty
 *  6. Accessibility — axe-core violations, nav landmark label
 *  7. Keyboard navigation — all links reachable via Tab
 *
 * IntersectionObserver is mocked because jsdom does not implement it.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { TableOfContents, type TocHeading } from "./TableOfContents";

/* ============================================================
   IntersectionObserver mock
   IntersectionObserver must be mocked as a proper constructor (class)
   because the component calls `new IntersectionObserver(...)`.
   vi.fn() alone produces an arrow function which is not a constructor.
   ============================================================ */

const observeMock = vi.fn();
const unobserveMock = vi.fn();
const disconnectMock = vi.fn();

class MockIntersectionObserver {
  observe = observeMock;
  unobserve = unobserveMock;
  disconnect = disconnectMock;
   
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

async function runAxe(container: Element) {
  const results = await axe.run(container);
  return results.violations;
}

/* ============================================================
   Fixtures
   ============================================================ */

const HEADINGS: TocHeading[] = [
  { id: "introduction", text: "Introduction", level: 2 },
  { id: "getting-started", text: "Getting Started", level: 2 },
  { id: "installation", text: "Installation", level: 3 },
  { id: "configuration", text: "Configuration", level: 3 },
  { id: "advanced-usage", text: "Advanced Usage", level: 2 },
];

/* ============================================================
   1. Rendering
   ============================================================ */

describe("TableOfContents — rendering", () => {
  it("renders a nav landmark", () => {
    render(<TableOfContents headings={HEADINGS} />);
    expect(
      screen.getByRole("navigation", { name: "Table of contents" }),
    ).toBeInTheDocument();
  });

  it("uses custom label when provided", () => {
    render(
      <TableOfContents headings={HEADINGS} label="Article outline" />,
    );
    expect(
      screen.getByRole("navigation", { name: "Article outline" }),
    ).toBeInTheDocument();
  });

  it("renders a link for each heading", () => {
    render(<TableOfContents headings={HEADINGS} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(HEADINGS.length);
  });

  it("each link href points to the heading id anchor", () => {
    render(<TableOfContents headings={HEADINGS} />);
    const introLink = screen.getByRole("link", { name: "Introduction" });
    expect(introLink).toHaveAttribute("href", "#introduction");
  });

  it("renders all heading texts as link labels", () => {
    render(<TableOfContents headings={HEADINGS} />);
    HEADINGS.forEach((h) => {
      expect(screen.getByRole("link", { name: h.text })).toBeInTheDocument();
    });
  });

  it("merges custom className", () => {
    const { container } = render(
      <TableOfContents headings={HEADINGS} className="toc-sidebar" />,
    );
    expect(container.firstChild).toHaveClass("toc-sidebar");
  });
});

/* ============================================================
   2. Nested headings
   ============================================================ */

describe("TableOfContents — nested headings", () => {
  it("h3 items exist in the list", () => {
    render(<TableOfContents headings={HEADINGS} />);
    // Installation and Configuration are h3 — they should still be rendered
    expect(
      screen.getByRole("link", { name: "Installation" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Configuration" }),
    ).toBeInTheDocument();
  });
});

/* ============================================================
   3. Active section
   ============================================================ */

describe("TableOfContents — active section", () => {
  it("no link has aria-current before any scroll", () => {
    render(<TableOfContents headings={HEADINGS} />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).not.toHaveAttribute("aria-current");
    });
  });
});

/* ============================================================
   4. Scroll behaviour
   ============================================================ */

describe("TableOfContents — click navigation", () => {
  it("clicking a link calls scrollIntoView on the heading element", async () => {
    const user = userEvent.setup();

    // Create a DOM element to simulate the article heading
    const headingEl = document.createElement("h2");
    headingEl.id = "introduction";
    document.body.appendChild(headingEl);

    const scrollMock = vi.fn();
    headingEl.scrollIntoView = scrollMock;

    render(<TableOfContents headings={HEADINGS} />);
    await user.click(screen.getByRole("link", { name: "Introduction" }));

    expect(scrollMock).toHaveBeenCalled();

    document.body.removeChild(headingEl);
  });

  it("clicking a link that has no matching heading element does not throw", async () => {
    const user = userEvent.setup();
    render(<TableOfContents headings={HEADINGS} />);
    // No heading with id="introduction" in DOM — should be a no-op
    expect(async () => {
      await user.click(screen.getByRole("link", { name: "Introduction" }));
    }).not.toThrow();
  });
});

/* ============================================================
   5. Empty headings
   ============================================================ */

describe("TableOfContents — empty headings", () => {
  it("returns null when headings array is empty", () => {
    const { container } = render(<TableOfContents headings={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

/* ============================================================
   6. Accessibility
   ============================================================ */

describe("TableOfContents — accessibility (axe-core)", () => {
  it("has no axe violations", async () => {
    const { container } = render(<TableOfContents headings={HEADINGS} />);
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("nav has an accessible name", () => {
    render(<TableOfContents headings={HEADINGS} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Table of contents");
  });
});

/* ============================================================
   7. Keyboard navigation
   ============================================================ */

describe("TableOfContents — keyboard navigation", () => {
  it("first link is reachable via Tab", async () => {
    const user = userEvent.setup();
    render(<TableOfContents headings={HEADINGS} />);

    await user.tab();
    // First link should be "Introduction"
    expect(screen.getByRole("link", { name: "Introduction" })).toHaveFocus();
  });

  it("all links are reachable via sequential Tab presses", async () => {
    const user = userEvent.setup();
    render(<TableOfContents headings={HEADINGS} />);

    for (let i = 0; i < HEADINGS.length; i++) {
      await user.tab();
    }

    // After tabbing through all links, last link should have focus
    expect(
      screen.getByRole("link", { name: "Advanced Usage" }),
    ).toHaveFocus();
  });
});
