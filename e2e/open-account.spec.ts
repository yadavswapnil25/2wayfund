import { expect, test } from "@playwright/test";

/** Exercises the complete Open an Account flow against the real Laravel
 * backend (2wayfund-API) — referral gate, applicant form, real network
 * submission, and the confirmation screen driven entirely by the server's
 * response. Requires the backend running at http://127.0.0.1:8000
 * (Docker MySQL up, `php artisan serve`). */

test.describe("Open an Account", () => {
  test("submits an application end-to-end and shows the server-issued reference", async ({ page }) => {
    await page.goto("/#/open-account");

    // Step 1 — referral gate
    await page.getByPlaceholder("2WF-XXXXXX").fill("2WF-DEMO01");
    await page.getByRole("button", { name: "Verify Referral Code" }).click();
    await expect(page.getByText(/Referral code.*2WF-DEMO01.*accepted/)).toBeVisible();

    // Step 2 — applicant details
    const uniqueEmail = `e2e.${Date.now()}@example.invalid`;
    await page.locator("#oa-name").fill("Playwright Applicant");
    await page.locator("#oa-father").fill("Playwright Parent");
    await page.locator("#oa-email").fill(uniqueEmail);
    await page.locator("#oa-age").check();
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

    // The confirmation screen reflects the server's response, not a
    // client-generated stand-in.
    await expect(page.getByText("Application received")).toBeVisible();
    await expect(page.getByText(body.data.ref)).toBeVisible();
    await expect(page.getByText(/Playwright Applicant/)).toBeVisible();
  });

  test("rejects an unrecognised referral code before reaching the applicant form", async ({ page }) => {
    await page.goto("/#/open-account");

    await page.getByPlaceholder("2WF-XXXXXX").fill("2WF-NOPE01");
    await page.getByRole("button", { name: "Verify Referral Code" }).click();

    await expect(page.getByText("That referral code is not recognised. Check it with whoever referred you.")).toBeVisible();
    await expect(page.locator("#oa-name")).toHaveCount(0);
  });

  test("shows per-field errors when required applicant details are missing", async ({ page }) => {
    await page.goto("/#/open-account");

    await page.getByPlaceholder("2WF-XXXXXX").fill("2WF-DEMO01");
    await page.getByRole("button", { name: "Verify Referral Code" }).click();

    await page.getByRole("button", { name: "Submit Application" }).click();

    await expect(page.getByText("Enter the applicant’s full name.")).toBeVisible();
    await expect(page.getByText("Enter the father’s or husband’s name.")).toBeVisible();
    await expect(page.getByText("Enter a contact email.")).toBeVisible();
    await expect(page.getByText("You must accept the terms and conditions to continue.")).toBeVisible();
  });
});
