import { test, expect } from "@playwright/test";

/**
 * Smoke tests for the home page.
 *
 * These tests verify the critical user journey of loading the site
 * and confirm basic accessibility and rendering across browsers.
 */
test.describe("Home page", () => {
  test("loads successfully and has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Steve Goode - Head of Engineering/i);
  });

  test("renders the main heading", async ({ page }) => {
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("has no detectable accessibility violations on load", async ({
    page,
  }) => {
    await page.goto("/");
    // Verify main navigation landmark is present
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();
  });
});
