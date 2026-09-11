import { readFileSync, writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const LOG_PATH = "E:/Personal/2 Way Fund/2wayfund-API/storage/logs/laravel.log";

function clearLog() {
  writeFileSync(LOG_PATH, "");
}

function extractOtp(): string {
  const content = readFileSync(LOG_PATH, "utf-8");
  const matches = [...content.matchAll(/One-time code:\s*(?:\*\*|<strong[^>]*>)(\d{6})/g)];
  if (matches.length === 0) throw new Error("No OTP found in log: " + content.slice(0, 2000));
  return matches[matches.length - 1][1];
}

test.describe.serial("Transfer Funds — real API integration", () => {
  test("set PIN, add + verify an internal beneficiary, then transfer", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("main").getByRole("button", { name: "Sign In", exact: true }).click();
    await expect(page).toHaveURL("/");

    // --- Set the 9-digit transaction PIN ---
    await page.goto("/pin-security");
    const pinCard = page
      .getByRole("heading", { name: "9-Digit Transaction PIN Setup", exact: true })
      .locator("xpath=ancestor::div[contains(@class,'bg-white')][1]");
    await pinCard.locator('input[type="password"]').nth(0).fill("demo1234");
    await pinCard.getByPlaceholder("9 numeric digits (e.g. 984018274)").fill("135792468");
    await pinCard.getByPlaceholder("Re-enter 9 numeric digits").fill("135792468");

    clearLog();
    await pinCard.getByRole("button", { name: "Set & Activate 9-Digit Transaction PIN" }).click();
    await expect(pinCard.getByText("Enter the one-time code we emailed you")).toBeVisible({ timeout: 10000 });
    let otp = extractOtp();
    await pinCard.getByLabel("One-time code").fill(otp);
    await pinCard.getByRole("button", { name: "Confirm", exact: true }).click();
    await expect(pinCard.getByText("Transaction PIN set")).toBeVisible({ timeout: 10000 });

    // --- Add and confirm an internal beneficiary (unique account number
    // each run — the backend rejects a duplicate masked account + name) ---
    const uniqueAccount = "90220011" + String(Math.floor(1000 + Math.random() * 9000));
    const beneficiaryLabel = `2 Way Fund account ${uniqueAccount.slice(-4)}`;
    await page.goto("/beneficiaries");
    await page.getByRole("button", { name: "2 Way Fund (Internal)" }).click();
    await page.getByPlaceholder("e.g. 902200118855").fill(uniqueAccount);
    await page.getByPlaceholder("e.g. PNL-IN-4402").fill("PNL-IN-4402");
    await page.getByPlaceholder("e.g. 2WFMP04817").fill("2WFMP04817");
    await page.getByRole("button", { name: "Verify Account" }).click();
    await expect(page.getByText("Account details verified")).toBeVisible();

    clearLog();
    await page.getByRole("button", { name: "Save Internal Payee" }).click();
    await expect(page.getByText("Enter the one-time code we emailed you")).toBeVisible({ timeout: 10000 });
    otp = extractOtp();
    await page.getByLabel("One-time code").fill(otp);
    await page.getByRole("button", { name: "Confirm", exact: true }).click();
    await expect(page.getByText(/registered and placed in the cooling-off period/)).toBeVisible({ timeout: 10000 });

    // --- Verify the beneficiary via the directory's "Complete check" ---
    await page.goto("/beneficiaries-directory");
    const card = page.getByText(beneficiaryLabel).locator("xpath=ancestor::div[contains(@class,'hover:bg-tint')][1]");
    await card.getByRole("button", { name: "Complete check" }).click();
    await expect(card.getByRole("link", { name: "Transfer" })).toBeVisible({ timeout: 10000 });

    // --- Transfer Funds: Details stage ---
    await page.goto("/transfer");
    await expect(page.getByRole("heading", { name: "Electronic Fund Transfer", level: 1 })).toBeVisible();

    // The dropdown seeds from the (stale) shared store immediately, then is
    // quietly replaced once the page's own listBeneficiaries() fetch
    // resolves — poll rather than reading the options in a single shot.
    const beneficiarySelect = page.locator("select").first();
    await expect
      .poll(async () => {
        const options = await beneficiarySelect.locator("option").allTextContents();
        return options.some((o) => o.includes(beneficiaryLabel));
      }, { timeout: 10000 })
      .toBe(true);

    const options = await beneficiarySelect.locator("option").allTextContents();
    const targetOption = options.find((o) => o.includes(beneficiaryLabel));
    if (!targetOption) throw new Error("Beneficiary option not found: " + options.join(" | "));
    await beneficiarySelect.selectOption({ label: targetOption });
    await expect(page.getByText("Account", { exact: true })).toBeVisible();

    await page.getByPlaceholder("₹ 0.00").fill("5000");
    await page.getByPlaceholder("e.g. Vendor payment, Medical, Monthly bills").fill("E2E test transfer");
    await page.getByRole("button", { name: "Proceed to Review & Authorization" }).click();

    // --- Review & PIN stage ---
    await expect(page.getByRole("heading", { name: "Review Transaction Details" })).toBeVisible();
    await page.getByPlaceholder("Enter your 9 numeric digits").fill("135792468");

    await page.screenshot({ path: "e2e/_tmp-transfer-review.png", fullPage: true });

    await page.getByRole("button", { name: /Authorize & Transfer/ }).click();

    // --- Receipt stage ---
    await expect(page.getByText("Payment Processed Successfully!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(beneficiaryLabel).first()).toBeVisible();

    await page.screenshot({ path: "e2e/_tmp-transfer-receipt.png", fullPage: true });

    // --- Voucher modal ---
    await page.getByRole("button", { name: "Download / Print Official Receipt" }).click();
    await expect(page.getByText("Official Bank Transaction Advisory Voucher")).toBeVisible();
    await page.screenshot({ path: "e2e/_tmp-transfer-voucher.png", fullPage: true });
  });
});
