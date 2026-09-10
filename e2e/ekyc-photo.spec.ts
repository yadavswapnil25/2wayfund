import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";

/** Exercises the real photo-upload path on the eKYC page: submits an
 * application through the real backend (so it has a real ref the eKYC
 * page can resolve), then drives the actual "Choose file" control and
 * confirms — via the real backend, not just the UI — that the photo was
 * actually persisted. */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = "http://127.0.0.1:8000/api/v1";
const CLIENT_KEY = "local-dev-client-key-change-me";
const API_PROJECT_DIR = path.resolve(__dirname, "..", "..", "2wayfund-API");

function hasStoredPhoto(ref: string): boolean {
  const output = execFileSync(
    "php",
    [
      "artisan",
      "tinker",
      "--execute",
      `echo App\\Models\\Application::where('ref','${ref}')->firstOrFail()->photo_path ? 'yes' : 'no';`,
    ],
    { cwd: API_PROJECT_DIR, encoding: "utf-8" },
  );
  return output.trim().split("\n").pop()!.trim() === "yes";
}

// A minimal valid 1x1 PNG, so the backend's real "image" MIME validation
// (not just a fake blob) genuinely passes.
const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

test("a customer can upload their photograph and it is really persisted", async ({ page, request }) => {
  const email = `e2e.photo.${Date.now()}@example.invalid`;

  const submitResponse = await request.post(`${API_BASE}/applications`, {
    headers: { "X-Client-Key": CLIENT_KEY },
    data: {
      country: "India",
      tier: "Master Account",
      purpose: "Personal savings",
      name: "Photo Upload Test",
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

  expect(hasStoredPhoto(ref)).toBe(false);

  await page.goto(`/#/ekyc?ref=${encodeURIComponent(ref)}`);
  await expect(page.getByTestId("doc-photo")).toBeVisible();

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByTestId("doc-photo").getByRole("button", { name: "Choose file" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({ name: "photo.png", mimeType: "image/png", buffer: ONE_PIXEL_PNG });

  await expect(page.getByTestId("doc-photo").getByText("Uploading to your application…")).toBeHidden({ timeout: 10_000 });
  await expect(page.getByTestId("doc-photo").getByText(/Upload failed|not recognised|invalid/i)).toHaveCount(0);
  await expect(page.getByTestId("doc-photo").getByRole("img", { name: "Captured document preview" })).toBeVisible();

  expect(hasStoredPhoto(ref)).toBe(true);
});
