import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for cross-browser E2E testing.
 * Targets Chromium, Firefox, and WebKit (Safari).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  workers: process.env["CI"] ? 1 : "50%",
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    // In CI the static export artefact is downloaded and extracted before this
    // job runs, so we only need to serve the 'out' directory rather than
    // rebuild from scratch. Locally, run a full build then serve.
    command: process.env["CI"]
      ? "npx serve out -p 3000"
      : "npm run build && npx serve out -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env["CI"],
    timeout: 120000,
  },
});
