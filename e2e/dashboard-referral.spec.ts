import { expect, test } from "@playwright/test";

/** The dashboard no longer shows a single permanent referral code — that
 * model was replaced by on-demand, 24h-expiry, single-use codes managed
 * on their own Referrals page. The dashboard's hero card just links
 * there. Runs against the frontend + real backend: logs in as the
 * seeded demo customer (login pages don't prefill credentials). */
test.describe("Customer dashboard referral entry point", () => {
  test("the hero card links to the Referrals page instead of showing a static code", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Customer ID").fill("2WFMP04817");
    await page.getByRole("textbox", { name: "Password" }).fill("demo1234");
    // Scoped to <main> — the navbar's own "Log In" control (a dropdown
    // trigger for Internet Banking / Corporate Internet Banking) shares
    // this accessible name.
    await page.getByRole("main").getByRole("button", { name: "Log In", exact: true }).click();
    await page.waitForURL("http://localhost:5173/");

    const referAndEarn = page.getByRole("link", { name: /refer.*earn/i });
    await expect(referAndEarn).toBeVisible();
    await expect(referAndEarn).toHaveAttribute("href", "/referrals");

    await referAndEarn.click();
    await expect(page.getByRole("heading", { name: "Referral Program" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Generate/ })).toBeVisible();
  });
});
