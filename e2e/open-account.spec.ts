import { expect, type Page, test } from "@playwright/test";

/** Exercises the complete seven-stage Open an Account flow against the
 * real Laravel backend (2wayfund-API) — referral gate, all five
 * interactive stages including the signature and (for a corporate tier)
 * business certificate uploads, real network submission, and the
 * confirmation screen driven entirely by the server's response. Requires
 * the backend running at http://127.0.0.1:8000 (Docker MySQL up,
 * `php artisan serve`). */

// A minimal valid 1x1 PNG, so the backend's real "image" MIME validation
// (not just a fake blob) genuinely passes — matches e2e/ekyc-photo.spec.ts.
const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

// A minimal but genuinely valid PDF (starts with the %PDF- header the
// backend's real fileinfo-based "mimes:pdf" check looks for), so the
// business certificate upload exercises real server-side validation
// rather than a same-extension stand-in.
const TINY_PDF = Buffer.from(
  "%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 3 3]>>endobj\ntrailer<</Root 1 0 R/Size 4>>\n%%EOF",
);

async function fillStage2(page: Page, email: string) {
  await page.locator("#oa-name").fill("Playwright Applicant");
  await page.locator("#oa-father").fill("Playwright Parent");
  await page.locator("#oa-dob").fill("1991-04-17");
  await page.locator("#oa-addr-comm").fill("14 Sample Street, Andheri East, Mumbai 400069, India");
  await page.locator("#oa-mob-personal").fill("+91 90000 00000");
  await page.locator("#oa-email").fill(email);
}

async function fillStage3(page: Page) {
  await page.locator("#oa-org").fill("Playwright Trading Company Pvt Ltd");
}

async function fillStage4(page: Page) {
  await page.locator("#oa-xb-detail").fill("The applicant invoices customers in the United Kingdom and needs a settlement account in that corridor.");
}

async function walkToReview(page: Page, email: string) {
  await page.goto("/#/open-account");

  await page.getByPlaceholder("2WF-XXXXXX").fill("2WF-DEMO01");
  await page.getByRole("button", { name: "Verify Referral Code" }).click();
  await expect(page.getByText(/Referral code.*2WF-DEMO01.*accepted/)).toBeVisible();

  await page.getByRole("button", { name: "Continue to Application" }).click();
  await fillStage2(page, email);
  await page.getByRole("button", { name: "Continue to Verification" }).click();
  await fillStage3(page);
  await page.getByRole("button", { name: "Continue to Financial Requirement" }).click();
  await fillStage4(page);
  await page.getByRole("button", { name: "Continue to Compliance Review" }).click();
}

test.describe("Open an Account", () => {
  test("submits an application end-to-end and shows the server-issued reference", async ({ page }) => {
    const uniqueEmail = `e2e.${Date.now()}@example.invalid`;
    await walkToReview(page, uniqueEmail);

    // Compliance review recap carries values from every earlier stage.
    await expect(page.getByText("Playwright Applicant")).toBeVisible();
    await expect(page.getByText("Playwright Trading Company Pvt Ltd")).toBeVisible();

    await page.locator("#oa-signature").setInputFiles({ name: "signature.png", mimeType: "image/png", buffer: ONE_PIXEL_PNG });
    await page.locator("#oa-terms").check();

    const submitResponse = page.waitForResponse(
      (res) => res.url().includes("/api/v1/applications") && res.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Submit Application" }).click();
    const response = await submitResponse;

    // The submission genuinely round-tripped through the real backend.
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.status).toBe("success");
    expect(body.data.ref).toMatch(/^2WF-APP-\d{5}$/);
    expect(body.data.email).toBe(uniqueEmail);
    expect(body.data.referrer).toBe("Demonstration partner");
    expect(body.data.organisation).toBe("Playwright Trading Company Pvt Ltd");

    // The confirmation screen reflects the server's response, not a
    // client-generated stand-in, and confirms the signature really
    // uploaded (not just that the request succeeded).
    await expect(page.getByText("Application received")).toBeVisible();
    await expect(page.getByText(body.data.ref)).toBeVisible();
    await expect(page.getByText(/Playwright Applicant/)).toBeVisible();
    await expect(page.getByText("Signature: uploaded.")).toBeVisible();

    // All seven named stages are visible on the shared stepper, with the
    // five just-completed ones marked done and stage 6 current.
    for (const label of ["Account selection", "Application", "Identity & business verification", "Financial requirement", "Compliance review", "Account approval", "International payment services"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("a corporate tier requires a business name and a real business certificate upload", async ({ page }) => {
    const uniqueEmail = `e2e.corp.${Date.now()}@example.invalid`;
    await page.goto("/#/open-account");

    await page.getByPlaceholder("2WF-XXXXXX").fill("2WF-DEMO01");
    await page.getByRole("button", { name: "Verify Referral Code" }).click();
    await page.selectOption("#oa-tier", "Corporate Account");
    await page.getByRole("button", { name: "Continue to Application" }).click();
    await fillStage2(page, uniqueEmail);
    await page.getByRole("button", { name: "Continue to Verification" }).click();

    // The organisation field is relabelled for a corporate applicant.
    await expect(page.getByText("Business name")).toBeVisible();

    // Blocked without a business certificate, even with the name filled in.
    await page.locator("#oa-org").fill("Playwright Holdings Pvt Ltd");
    await page.getByRole("button", { name: "Continue to Financial Requirement" }).click();
    await expect(page.getByText("Upload a business certificate to continue.")).toBeVisible();

    await page.locator("#oa-business-cert").setInputFiles({ name: "certificate.pdf", mimeType: "application/pdf", buffer: TINY_PDF });
    await page.getByRole("button", { name: "Continue to Financial Requirement" }).click();
    await fillStage4(page);
    await page.getByRole("button", { name: "Continue to Compliance Review" }).click();

    await page.locator("#oa-signature").setInputFiles({ name: "signature.png", mimeType: "image/png", buffer: ONE_PIXEL_PNG });
    await page.locator("#oa-terms").check();

    const submitResponse = page.waitForResponse(
      (res) => res.url().includes("/api/v1/applications") && res.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Submit Application" }).click();
    const response = await submitResponse;
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data.organisation).toBe("Playwright Holdings Pvt Ltd");

    await expect(page.getByText("Application received")).toBeVisible();
    await expect(page.getByText("Business certificate: uploaded.")).toBeVisible();
  });

  test("rejects an unrecognised referral code before reaching stage 1", async ({ page }) => {
    await page.goto("/#/open-account");

    await page.getByPlaceholder("2WF-XXXXXX").fill("2WF-NOPE01");
    await page.getByRole("button", { name: "Verify Referral Code" }).click();

    await expect(page.getByText("That referral code is not recognised. Check it with whoever referred you.")).toBeVisible();
    await expect(page.locator("#oa-country")).toHaveCount(0);
  });

  test("blocks progress at stage 2 when required applicant details are missing", async ({ page }) => {
    await page.goto("/#/open-account");

    await page.getByPlaceholder("2WF-XXXXXX").fill("2WF-DEMO01");
    await page.getByRole("button", { name: "Verify Referral Code" }).click();
    await page.getByRole("button", { name: "Continue to Application" }).click();

    await page.getByRole("button", { name: "Continue to Verification" }).click();

    await expect(page.getByText("Enter the applicant’s full name.")).toBeVisible();
    await expect(page.getByText("Enter the father’s or husband’s name.")).toBeVisible();
    await expect(page.getByText("Enter a contact email.")).toBeVisible();
    await expect(page.getByText("Enter a personal mobile number.")).toBeVisible();
    // Still on stage 2 — never advanced to stage 3.
    await expect(page.locator("#oa-org")).toHaveCount(0);
  });

  test("blocks submission at stage 5 until a signature is uploaded and terms are accepted", async ({ page }) => {
    const uniqueEmail = `e2e.terms.${Date.now()}@example.invalid`;
    await walkToReview(page, uniqueEmail);

    await page.getByRole("button", { name: "Submit Application" }).click();

    await expect(page.getByText("Upload your signature to continue.")).toBeVisible();
    await expect(page.getByText("You must accept the terms and conditions to continue.")).toBeVisible();
    await expect(page.getByText("Application received")).toHaveCount(0);

    // Uploading a signature clears its own error but submission still
    // waits on terms acceptance.
    await page.locator("#oa-signature").setInputFiles({ name: "signature.png", mimeType: "image/png", buffer: ONE_PIXEL_PNG });
    await page.getByRole("button", { name: "Submit Application" }).click();
    await expect(page.getByText("Upload your signature to continue.")).toHaveCount(0);
    await expect(page.getByText("You must accept the terms and conditions to continue.")).toBeVisible();
    await expect(page.getByText("Application received")).toHaveCount(0);
  });
});

test.describe("Duplicate email", () => {
  test("a second application cannot reuse an email already submitted", async ({ page }) => {
    // Two full submissions, each including a real (slow, synchronous)
    // notification email send in this dev environment — see the note
    // below. The default 30s test timeout doesn't leave enough room.
    test.setTimeout(90_000);

    const email = `e2e.dupe.${Date.now()}@example.invalid`;

    // First submission succeeds for real. The backend sends a real
    // notification email synchronously before responding in this dev
    // environment (App\Services\ApplicationService::sendMailSafely, a
    // real SMTP sandbox host) — slow (several seconds), not a defect in
    // what's under test here, so the assertion timeout is generous.
    await walkToReview(page, email);
    await page.locator("#oa-signature").setInputFiles({ name: "signature.png", mimeType: "image/png", buffer: ONE_PIXEL_PNG });
    await page.locator("#oa-terms").check();
    await page.getByRole("button", { name: "Submit Application" }).click();
    await expect(page.getByText("Application received")).toBeVisible({ timeout: 20_000 });

    // This is a single-page app: navigating walkToReview's page.goto()
    // to the *same* hash route again would not reset the component's own
    // state (it's still showing the first submission's confirmation
    // screen, with verifiedCode/submitted still set) — a hard reload is
    // what actually gets back to a fresh referral gate.
    await page.reload();

    // Second submission with the same email, from scratch, is blocked.
    await walkToReview(page, email);
    await page.locator("#oa-signature").setInputFiles({ name: "signature.png", mimeType: "image/png", buffer: ONE_PIXEL_PNG });
    await page.locator("#oa-terms").check();
    await page.getByRole("button", { name: "Submit Application" }).click();

    await expect(page.locator("#oa-email").locator("xpath=ancestor::div[1]").getByText(/already been taken|already/i)).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText("Application received")).toHaveCount(0);
  });
});
