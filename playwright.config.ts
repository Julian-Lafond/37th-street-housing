import { defineConfig, devices } from "@playwright/test";

// Dedicated port: the test server always runs with INQUIRY_DRY_RUN=1 so tests never
// write inquiries to the real database. Never reuse a normal dev/prod server.
const PORT = Number(process.env.E2E_PORT ?? 3200);

// Run against a production build: `npm run build`, then `npm run test:e2e`.
// Note: @playwright/test is pinned to 1.48 because newer releases dropped macOS 13 browser builds.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    contextOptions: { reducedMotion: "reduce" },
    // Start with the home-page cookie notice dismissed so it never covers what a
    // test clicks; tests/e2e/cookie-notice.spec.ts clears this to test the notice.
    storageState: {
      cookies: [],
      origins: [{ origin: `http://localhost:${PORT}`, localStorage: [{ name: "cookie-notice-dismissed", value: "1" }] }],
    },
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    env: { INQUIRY_DRY_RUN: "1" },
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] }, testIgnore: /a11y/ },
    { name: "webkit", use: { ...devices["Desktop Safari"] }, testIgnore: /a11y/ },
    { name: "mobile-webkit", use: { ...devices["iPhone 14"] }, testIgnore: /a11y/ },
  ],
});
