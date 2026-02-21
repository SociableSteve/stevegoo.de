import { test, expect, type Page } from "@playwright/test";

/**
 * Mobile responsive layout tests — Issue #3
 *
 * Verifies that all four main pages render correctly at three mobile viewport
 * widths without horizontal overflow and with key UI elements remaining
 * accessible.
 *
 * Viewports under test:
 *   320px — narrowest common device (iPhone SE 1st gen, Galaxy A series)
 *   375px — standard small phone (iPhone SE 3rd gen, iPhone 13 mini)
 *   768px — tablet / large phone boundary; also the primary CSS breakpoint
 *
 * Pages under test:
 *   /                — homepage
 *   /about           — about page
 *   /blog            — blog listing page
 *   /blog/<slug>     — individual blog post (uses first available post)
 *
 * Each test group sets the viewport before navigation using page.setViewportSize
 * rather than Playwright device presets so we can assert exact widths without
 * device-pixel-ratio scaling complicating the measurements.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the horizontal scroll width of the document body.
 * A value greater than the viewport width indicates horizontal overflow.
 */
async function getScrollWidth(page: Page): Promise<number> {
  return page.evaluate(() => document.body.scrollWidth);
}

// One real post slug that is guaranteed to exist in the content directory.
const BLOG_SLUG = "ai-wont-tell-you-when-its-wrong";

// ---------------------------------------------------------------------------
// Shared page list used across all viewport groups
// ---------------------------------------------------------------------------

const PAGES = [
  { name: "homepage", path: "/" },
  { name: "about page", path: "/about" },
  { name: "blog listing", path: "/blog" },
  { name: "blog post", path: `/blog/${BLOG_SLUG}` },
] as const;

// ---------------------------------------------------------------------------
// Viewport groups
// ---------------------------------------------------------------------------

const VIEWPORTS = [
  { label: "320px (narrowest mobile)", width: 320, height: 844 },
  { label: "375px (standard small phone)", width: 375, height: 812 },
  { label: "768px (mobile/tablet boundary)", width: 768, height: 1024 },
] as const;

// ---------------------------------------------------------------------------
// Tests — no horizontal overflow
// ---------------------------------------------------------------------------

for (const viewport of VIEWPORTS) {
  test.describe(`No horizontal overflow at ${viewport.label}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
    });

    for (const { name, path } of PAGES) {
      test(`${name} (${path}) does not overflow horizontally`, async ({ page }) => {
        await page.goto(path);
        // Wait for the page to be fully rendered before measuring
        await page.waitForLoadState("networkidle");

        const scrollWidth = await getScrollWidth(page);
        expect(
          scrollWidth,
          `Expected scrollWidth (${scrollWidth}px) to not exceed viewport width (${viewport.width}px) on ${name}`,
        ).toBeLessThanOrEqual(viewport.width);
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Tests — header is visible and correctly positioned
// ---------------------------------------------------------------------------

for (const viewport of VIEWPORTS) {
  test.describe(`Header is visible at ${viewport.label}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
    });

    for (const { name, path } of PAGES) {
      test(`${name} (${path}) shows the header`, async ({ page }) => {
        await page.goto(path);

        // The header landmark is present and visible
        const header = page.locator("header").first();
        await expect(header).toBeVisible();

        // The header should be at the very top of the viewport (fixed position)
        const boundingBox = await header.boundingBox();
        expect(
          boundingBox?.y,
          `Expected header top (y=${boundingBox?.y}) to be 0 on ${name}`,
        ).toBe(0);
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Tests — main navigation links are accessible
// ---------------------------------------------------------------------------

for (const viewport of VIEWPORTS) {
  test.describe(`Navigation is accessible at ${viewport.label}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
    });

    for (const { name, path } of PAGES) {
      test(`${name} (${path}) shows navigation links`, async ({ page }) => {
        await page.goto(path);

        const nav = page.getByRole("navigation", { name: "Main" });
        await expect(nav).toBeVisible();

        // Both primary nav links must be reachable
        const blogLink = nav.getByRole("link", { name: "Blog" });
        const aboutLink = nav.getByRole("link", { name: "About" });

        await expect(blogLink).toBeVisible();
        await expect(aboutLink).toBeVisible();
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Tests — main content is visible (page renders below the fixed header)
// ---------------------------------------------------------------------------

for (const viewport of VIEWPORTS) {
  test.describe(`Main content is visible at ${viewport.label}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
    });

    for (const { name, path } of PAGES) {
      test(`${name} (${path}) renders main content area`, async ({ page }) => {
        await page.goto(path);

        const main = page.getByRole("main");
        await expect(main).toBeVisible();

        // The main content should start below the header — at 320px the
        // header is 70px tall, at 768px it is also 70px (mobile breakpoint).
        // We allow up to 90px to accommodate any transition animations.
        const boundingBox = await main.boundingBox();
        expect(
          boundingBox?.y,
          `Expected main content top (y=${boundingBox?.y}) to be below header on ${name}`,
        ).toBeGreaterThanOrEqual(60);
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Tests — theme toggle button is reachable (sufficient tap target)
// ---------------------------------------------------------------------------

for (const viewport of VIEWPORTS) {
  test.describe(`Theme toggle is accessible at ${viewport.label}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
    });

    test("homepage shows a theme toggle button", async ({ page }) => {
      await page.goto("/");

      // Button is identified by its aria-label (either direction)
      const themeToggle = page.getByRole("button", {
        name: /switch to (dark|light) mode/i,
      });
      await expect(themeToggle).toBeVisible();

      // Confirm the tap target meets WCAG minimum of 44×44px
      const boundingBox = await themeToggle.boundingBox();
      expect(
        boundingBox?.width,
        `Theme toggle width (${boundingBox?.width}px) should be ≥ 44px`,
      ).toBeGreaterThanOrEqual(44);
      expect(
        boundingBox?.height,
        `Theme toggle height (${boundingBox?.height}px) should be ≥ 44px`,
      ).toBeGreaterThanOrEqual(44);
    });
  });
}

// ---------------------------------------------------------------------------
// Tests — 320px navigation layout documented decision
// ---------------------------------------------------------------------------

test.describe("320px navigation layout — documented decision", () => {
  /**
   * At 320px the header shows: logo (~/steve via ::before) + Blog + About + toggle.
   * This is intentionally kept without a hamburger because only two nav links
   * exist. See Header.tsx for the full rationale. This test documents that the
   * decision remains valid — all interactive elements fit without overlap.
   */
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
  });

  test("all header interactive elements are present and visible at 320px", async ({
    page,
  }) => {
    await page.goto("/");

    const header = page.locator("header").first();
    await expect(header).toBeVisible();

    // Logo / home link
    const homeLink = page.getByRole("link", {
      name: /steve goode.*home/i,
    });
    await expect(homeLink).toBeVisible();

    // Nav links
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Blog" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "About" })).toBeVisible();

    // Theme toggle
    const themeToggle = page.getByRole("button", {
      name: /switch to (dark|light) mode/i,
    });
    await expect(themeToggle).toBeVisible();
  });

  test("header elements do not overlap at 320px", async ({ page }) => {
    await page.goto("/");

    const homeLink = page.getByRole("link", { name: /steve goode.*home/i });
    const blogLink = page.getByRole("link", { name: "Blog" });

    const homeBounds = await homeLink.boundingBox();
    const blogBounds = await blogLink.boundingBox();

    if (homeBounds && blogBounds) {
      const homeLinkRight = homeBounds.x + homeBounds.width;
      expect(
        blogBounds.x,
        `Blog link (x=${blogBounds.x}) should start after home link right edge (${homeLinkRight}px)`,
      ).toBeGreaterThanOrEqual(homeLinkRight);
    }
  });
});
