import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",

  timeout: 90_000,

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
  },

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
      caret: "hide",
    },
  },

  projects: [
    {
      name: "chromium-desktop",
      testIgnore: /api\//,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      // API contract tests — no browser, runs in seconds.
      name: "api",
      testMatch: /api\/.*\.spec\.ts$/,
      use: { baseURL },
    },
  ],

  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !isCI,
        timeout: 120_000,
      },
});
