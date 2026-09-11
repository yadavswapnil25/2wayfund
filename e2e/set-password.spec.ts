import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Exercises account activation end-to-end against the real backend: an
 * application is submitted and approved for real (the approval step runs
 * the actual `applications:approve` Artisan command — there is no HTTP
 * endpoint for it yet, see app/Console/Commands/ApproveApplication.php's
 * docblock), which really provisions a User and really mints a one-time
 * token. The browser then drives the actual Set Your Password page with
 * that real token, and a real login proves the new credentials work.
 *
 * Requires both the frontend dev server and the backend
 * (Docker MySQL + `php artisan serve` on :8000) running, with 2wayfund-API
 * checked out as a sibling directory to this repo. */

const API_BASE = "http://127.0.0.1:8000/api/v1";
const CLIENT_KEY = "local-dev-client-key-change-me";
const API_PROJECT_DIR = path.resolve(__dirname, "..", "..", "2wayfund-API");

function runArtisan(args: string[]): string {
  return execFileSync("php", ["artisan", ...args], { cwd: API_PROJECT_DIR, encoding: "utf-8" });
}

test("an approved applicant can set their password and log in with it", async ({ page, request }) => {
  const email = `e2e.activation.${Date.now()}@example.invalid`;

  const submitResponse = await request.post(`${API_BASE}/applications`, {
    headers: { "X-Client-Key": CLIENT_KEY },
    data: {
      country: "India",
      tier: "Master Account",
      purpose: "Personal savings",
      name: "Activation Test",
      father_name: "Test Parent",
      dob: "1991-04-17",
      address_communication: "14 Sample Street, Andheri East, Mumbai 400069, India",
      address_permanent: "14 Sample Street, Andheri East, Mumbai 400069, India",
      mobile_personal: "+91 90000 00000",
      email,
      organisation: "Sample Trading Company Pvt Ltd",
      cross_border_detail: "Applicant invoices customers abroad and needs a settlement account in that corridor.",
      referral: "2WF-DEMO01",
      terms_accepted: true,
    },
  });
  expect(submitResponse.ok()).toBeTruthy();
  const ref = (await submitResponse.json()).data.ref as string;

  const approveOutput = runArtisan(["applications:approve", ref]);
  expect(approveOutput).toContain("approved");

  const tokenOutput = runArtisan([
    "tinker",
    "--execute",
    `echo app(Illuminate\\Auth\\Passwords\\TokenRepositoryInterface::class)->create(App\\Models\\User::where('email','${email}')->firstOrFail());`,
  ]);
  const token = tokenOutput.trim().split("\n").pop()!.trim();
  expect(token).toMatch(/^[a-f0-9]{64}$/);

  const newPassword = "a-secure-e2e-password";
  await page.goto(`/set-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);

  await page.locator("#sp-password").fill(newPassword);
  await page.locator("#sp-confirm").fill(newPassword);
  await page.getByRole("button", { name: "Set password" }).click();

  await expect(page.getByRole("heading", { name: "Password Set" })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();

  const loginResponse = await request.post(`${API_BASE}/auth/login`, {
    headers: { "X-Client-Key": CLIENT_KEY },
    data: { email, password: newPassword },
  });
  expect(loginResponse.ok()).toBeTruthy();
  const loginBody = await loginResponse.json();
  expect(loginBody.data.user.email).toBe(email);
});

test("an incomplete activation link shows a helpful message instead of a broken form", async ({ page }) => {
  await page.goto("/set-password");

  await expect(page.getByRole("heading", { name: "Link Incomplete" })).toBeVisible();
  await expect(page.locator("#sp-password")).toHaveCount(0);
});
