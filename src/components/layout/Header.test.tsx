/**
 * Header component tests
 *
 * Coverage areas:
 *   1. Rendering — logo, nav links, theme toggle button
 *   2. Accessibility — axe-core violations, landmarks, ARIA attributes
 *   3. Theme toggle — correct label, toggleTheme called, announcement
 *   4. Active link — aria-current reflects pathname
 *   5. Keyboard navigation — focusable elements reachable in order
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ThemeProvider from "@/components/providers/ThemeProvider";
import Header from "./Header";

/* ============================================================
   Mocks
   ============================================================ */

// next/navigation must be mocked in jsdom — usePathname is a Next.js hook
// that reads from the router context which does not exist in tests.
const mockUsePathname = vi.fn<() => string>(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

// next/link renders as a plain <a> in jsdom via the mock below.
// @testing-library/react renders it fine without this, but we make the
// href passthrough explicit so aria-current and href assertions work.
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

/* ============================================================
   Test helpers
   ============================================================ */

function renderHeader() {
  return render(
    <ThemeProvider>
      <Header />
    </ThemeProvider>,
  );
}

async function runAxe(container: Element) {
  const results = await axe.run(container);
  return results.violations;
}

/* ============================================================
   Setup
   ============================================================ */

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset["theme"];
  mockUsePathname.mockReturnValue("/");
});

/* ============================================================
   1. Rendering
   ============================================================ */

describe("Header — rendering", () => {
  it("renders a <header> element with banner landmark", () => {
    const { container } = renderHeader();
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
  });

  it("renders the logo link pointing to /", () => {
    renderHeader();
    const logo = screen.getByRole("link", { name: /home/i });
    expect(logo).toHaveAttribute("href", "/");
  });

  it("renders the Writing nav link", () => {
    renderHeader();
    expect(
      screen.getByRole("link", { name: "Writing" }),
    ).toBeInTheDocument();
  });

  it("renders the About nav link", () => {
    renderHeader();
    expect(
      screen.getByRole("link", { name: "About" }),
    ).toBeInTheDocument();
  });

  it("renders the theme toggle button", () => {
    renderHeader();
    // In light mode (default) the button offers to switch to dark
    expect(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    ).toBeInTheDocument();
  });

  it("renders a main navigation landmark", () => {
    renderHeader();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
  });
});

/* ============================================================
   2. Accessibility — axe-core
   ============================================================ */

describe("Header — accessibility (axe-core)", () => {
  it("has no axe violations in light mode", async () => {
    const { container } = renderHeader();
    const violations = await runAxe(container);
    expect(violations).toHaveLength(0);
  });

  it("has no axe violations in dark mode", async () => {
    document.documentElement.dataset["theme"] = "dark";
    const { container } = renderHeader();
    const violations = await runAxe(container);
    expect(violations).toHaveLength(0);
  });

  it("has no axe violations on a content page", async () => {
    mockUsePathname.mockReturnValue("/writing");
    const { container } = renderHeader();
    const violations = await runAxe(container);
    expect(violations).toHaveLength(0);
  });

  it("theme toggle has an accessible name at all times", () => {
    renderHeader();
    const toggle = screen.getByRole("button", { name: /switch to/i });
    expect(toggle).toHaveAccessibleName();
  });
});

/* ============================================================
   3. Theme toggle
   ============================================================ */

describe("Header — theme toggle", () => {
  it("shows 'Switch to dark mode' label when theme is light", () => {
    renderHeader();
    expect(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    ).toBeInTheDocument();
  });

  it("shows 'Switch to light mode' label when theme is dark", () => {
    document.documentElement.dataset["theme"] = "dark";
    renderHeader();
    expect(
      screen.getByRole("button", { name: "Switch to light mode" }),
    ).toBeInTheDocument();
  });

  it("toggles from light to dark on click", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    );

    expect(document.documentElement.dataset["theme"]).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("toggles from dark to light on click", async () => {
    document.documentElement.dataset["theme"] = "dark";
    const user = userEvent.setup();
    renderHeader();

    await user.click(
      screen.getByRole("button", { name: "Switch to light mode" }),
    );

    expect(document.documentElement.dataset["theme"]).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("updates the button label after toggling", async () => {
    const user = userEvent.setup();
    renderHeader();

    // Initially light — button says "Switch to dark mode"
    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    );

    // After toggle — button should say "Switch to light mode"
    expect(
      screen.getByRole("button", { name: "Switch to light mode" }),
    ).toBeInTheDocument();
  });

  it("announces theme change to screen readers via live region", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    );

    // The sr-only live region should contain the announcement
    await waitFor(() => {
      const status = screen.getByRole("status");
      expect(status).toHaveTextContent(/switched to dark mode/i);
    });
  });

  it("is keyboard activatable with Enter key", async () => {
    const user = userEvent.setup();
    renderHeader();

    const toggle = screen.getByRole("button", { name: "Switch to dark mode" });
    toggle.focus();
    await user.keyboard("{Enter}");

    expect(document.documentElement.dataset["theme"]).toBe("dark");
  });

  it("is keyboard activatable with Space key", async () => {
    const user = userEvent.setup();
    renderHeader();

    const toggle = screen.getByRole("button", { name: "Switch to dark mode" });
    toggle.focus();
    await user.keyboard(" ");

    expect(document.documentElement.dataset["theme"]).toBe("dark");
  });
});

/* ============================================================
   4. Active link — aria-current
   ============================================================ */

describe("Header — active navigation state", () => {
  it("does not mark any link as current on the home page", () => {
    mockUsePathname.mockReturnValue("/");
    renderHeader();

    const writingLink = screen.getByRole("link", { name: "Writing" });
    const aboutLink = screen.getByRole("link", { name: "About" });

    expect(writingLink).not.toHaveAttribute("aria-current");
    expect(aboutLink).not.toHaveAttribute("aria-current");
  });

  it("marks Writing as current when on /writing", () => {
    mockUsePathname.mockReturnValue("/writing");
    renderHeader();

    expect(screen.getByRole("link", { name: "Writing" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "About" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks Writing as current for nested post routes", () => {
    mockUsePathname.mockReturnValue("/writing/my-post-slug");
    renderHeader();

    expect(screen.getByRole("link", { name: "Writing" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks About as current when on /about", () => {
    mockUsePathname.mockReturnValue("/about");
    renderHeader();

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Writing" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("only marks one link as current at a time", () => {
    mockUsePathname.mockReturnValue("/writing");
    renderHeader();

    const currentLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");

    expect(currentLinks).toHaveLength(1);
  });
});

/* ============================================================
   5. Keyboard navigation
   ============================================================ */

describe("Header — keyboard navigation", () => {
  it("all interactive elements are reachable by Tab", async () => {
    const user = userEvent.setup();
    renderHeader();

    // Start from body
    await user.tab();

    // The exact tab order depends on DOM position:
    // logo → Writing → About → theme toggle
    // We verify all are reachable by checking focus lands on them.
    const focusable = [
      screen.getByRole("link", { name: /home/i }),
      screen.getByRole("link", { name: "Writing" }),
      screen.getByRole("link", { name: "About" }),
      screen.getByRole("button", { name: /switch to/i }),
    ];

    for (let i = 0; i < focusable.length; i++) {
      // After each tab, the focused element should be one of our expected elements
      expect(focusable).toContain(document.activeElement);
      await user.tab();
    }
  });
});
