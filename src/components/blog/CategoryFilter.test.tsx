/**
 * CategoryFilter component tests
 *
 * Coverage areas:
 *  1. Rendering — "All" button, category buttons, active state
 *  2. URL state management — router.push called with correct params
 *  3. ARIA — role=group, aria-label, aria-pressed, aria-live region
 *  4. Interactions — clicking category sets active, clicking again deactivates
 *  5. Accessibility — axe-core violations
 *  6. Keyboard — buttons reachable via Tab
 *
 * Mocking strategy:
 *   - next/navigation hooks are mocked with vi.mock so CategoryFilterInner
 *     (the useSearchParams consumer) can render in jsdom without a full
 *     Next.js runtime.
 *   - The Suspense boundary in CategoryFilter resolves immediately in jsdom
 *     because the inner component is synchronous once hooks are mocked.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";

/* ---- Next.js navigation mocks -------------------------------- */

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/blog",
  useSearchParams: () => mockSearchParams,
}));

/* -------------------------------------------------------------- */

import { CategoryFilter } from "./CategoryFilter";

async function runAxe(container: Element) {
  const results = await axe.run(container);
  return results.violations;
}

const CATEGORIES = ["engineering", "career", "leadership"];

function renderFilter(
  overrides: Partial<React.ComponentProps<typeof CategoryFilter>> = {},
) {
  return render(
    <CategoryFilter
      categories={CATEGORIES}
      postCount={10}
      {...overrides}
    />,
  );
}

beforeEach(() => {
  mockPush.mockClear();
  // Reset search params before each test
  mockSearchParams.delete("category");
});

/* ============================================================
   1. Rendering
   ============================================================ */

describe("CategoryFilter — rendering", () => {
  it("renders All button", async () => {
    renderFilter();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    });
  });

  it("renders a button for each category", async () => {
    renderFilter();
    await waitFor(() => {
      CATEGORIES.forEach((cat) => {
        expect(
          screen.getByRole("button", { name: cat }),
        ).toBeInTheDocument();
      });
    });
  });

  it("All button is active by default (no param set)", async () => {
    renderFilter();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });
  });

  it("category button is active when param matches", async () => {
    mockSearchParams.set("category", "engineering");
    renderFilter();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "engineering" }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });
  });
});

/* ============================================================
   2. URL state management
   ============================================================ */

describe("CategoryFilter — URL state", () => {
  it("clicking a category button calls router.push with category param", async () => {
    const user = userEvent.setup();
    renderFilter();

    await waitFor(() => screen.getByRole("button", { name: "engineering" }));
    await user.click(screen.getByRole("button", { name: "engineering" }));

    expect(mockPush).toHaveBeenCalledWith(
      "/blog?category=engineering",
      { scroll: false },
    );
  });

  it("clicking All button removes category param", async () => {
    const user = userEvent.setup();
    mockSearchParams.set("category", "engineering");
    renderFilter();

    await waitFor(() => screen.getByRole("button", { name: "All" }));
    await user.click(screen.getByRole("button", { name: "All" }));

    expect(mockPush).toHaveBeenCalledWith("/blog", { scroll: false });
  });

  it("clicking active category button deactivates (removes param)", async () => {
    const user = userEvent.setup();
    mockSearchParams.set("category", "engineering");
    renderFilter();

    await waitFor(() => screen.getByRole("button", { name: "engineering" }));
    await user.click(screen.getByRole("button", { name: "engineering" }));

    expect(mockPush).toHaveBeenCalledWith("/blog", { scroll: false });
  });

  it("respects custom paramKey", async () => {
    const user = userEvent.setup();
    renderFilter({ paramKey: "tag" });

    await waitFor(() => screen.getByRole("button", { name: "engineering" }));
    await user.click(screen.getByRole("button", { name: "engineering" }));

    expect(mockPush).toHaveBeenCalledWith(
      "/blog?tag=engineering",
      { scroll: false },
    );
  });
});

/* ============================================================
   3. ARIA
   ============================================================ */

describe("CategoryFilter — ARIA", () => {
  it("button container is a fieldset with accessible legend", async () => {
    renderFilter();
    await waitFor(() => {
      // <fieldset> has an implicit group role with the legend as its accessible name
      expect(
        screen.getByRole("group", { name: /filter posts by category/i }),
      ).toBeInTheDocument();
    });
  });

  it("live region announces all posts when no filter active", async () => {
    renderFilter({ postCount: 10 });
    await waitFor(() => {
      const live = document.querySelector('[aria-live="polite"]');
      expect(live?.textContent).toContain("Showing all 10 posts");
    });
  });

  it("live region announces category count when filter active", async () => {
    mockSearchParams.set("category", "engineering");
    renderFilter({ postCount: 4 });
    await waitFor(() => {
      const live = document.querySelector('[aria-live="polite"]');
      expect(live?.textContent).toContain("Showing 4 posts in engineering");
    });
  });

  it("live region uses singular 'post' for postCount=1", async () => {
    mockSearchParams.set("category", "career");
    renderFilter({ postCount: 1 });
    await waitFor(() => {
      const live = document.querySelector('[aria-live="polite"]');
      expect(live?.textContent).toContain("Showing 1 post in career");
    });
  });

  it("live region has aria-atomic=true", async () => {
    renderFilter();
    await waitFor(() => {
      const live = document.querySelector('[aria-live="polite"]');
      expect(live).toHaveAttribute("aria-atomic", "true");
    });
  });
});

/* ============================================================
   4. Accessibility (axe-core)
   ============================================================ */

describe("CategoryFilter — accessibility (axe-core)", () => {
  it("has no axe violations with default state", async () => {
    const { container } = renderFilter();
    await waitFor(() => screen.getByRole("button", { name: "All" }));
    expect(await runAxe(container)).toHaveLength(0);
  });

  it("has no axe violations with active category", async () => {
    mockSearchParams.set("category", "engineering");
    const { container } = renderFilter();
    await waitFor(() => screen.getByRole("button", { name: "All" }));
    expect(await runAxe(container)).toHaveLength(0);
  });
});

/* ============================================================
   5. Keyboard navigation
   ============================================================ */

describe("CategoryFilter — keyboard navigation", () => {
  it("All button is reachable via Tab", async () => {
    const user = userEvent.setup();
    renderFilter();
    await waitFor(() => screen.getByRole("button", { name: "All" }));

    await user.tab();
    expect(screen.getByRole("button", { name: "All" })).toHaveFocus();
  });

  it("subsequent Tab moves to first category button", async () => {
    const user = userEvent.setup();
    renderFilter();
    await waitFor(() => screen.getByRole("button", { name: "engineering" }));

    await user.tab(); // All
    await user.tab(); // engineering
    expect(screen.getByRole("button", { name: "engineering" })).toHaveFocus();
  });

  it("Enter key activates a category button", async () => {
    const user = userEvent.setup();
    renderFilter();
    await waitFor(() => screen.getByRole("button", { name: "engineering" }));

    screen.getByRole("button", { name: "engineering" }).focus();
    await user.keyboard("{Enter}");

    expect(mockPush).toHaveBeenCalledWith(
      "/blog?category=engineering",
      { scroll: false },
    );
  });

  it("Space key activates a category button", async () => {
    const user = userEvent.setup();
    renderFilter();
    await waitFor(() => screen.getByRole("button", { name: "career" }));

    screen.getByRole("button", { name: "career" }).focus();
    await user.keyboard(" ");

    expect(mockPush).toHaveBeenCalledWith(
      "/blog?category=career",
      { scroll: false },
    );
  });
});
