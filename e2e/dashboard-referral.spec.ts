import { expect, test } from "@playwright/test";

/** The referral code is the customer's own — it must be on their
 * dashboard, in full and copyable, on every visit. Runs against the
 * frontend only: the customer session is still the prefilled demo login,
 * so the code shown comes from the seeded store. */
test.describe("Customer dashboard referral code", () => {
  test("shows the account's own referral code on the dashboard", async ({ page }) => {
    await page.goto("/#/login");
    await page.getByRole("button", { name: "Sign In", exact: true }).click();

    const tile = page.locator("div").filter({ hasText: /^Referral code/ }).last();
    await expect(tile).toBeVisible();
    await expect(tile).toContainText(/2WF-[A-Z0-9]{6}/);

    // Unlike the account number, the referral code is meant to be shared,
    // so it is never masked behind a reveal control.
    await expect(page.getByTitle("Copy Referral code")).toBeVisible();
  });
});
