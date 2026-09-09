import { defineConfig, devices } from "@playwright/test";

/** End-to-end tests exercise the real frontend against the real Laravel
 * backend (2wayfund-API) — no mocking. The backend (Docker MySQL + `php
 * artisan serve` on :8000) must already be running; see
 * e2e/open-account.spec.ts for what it verifies. */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    // Matches the backend's FRONTEND_URL (2wayfund-API/.env) exactly —
    // browsers treat 127.0.0.1 and localhost as different CORS origins.
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
