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

test("debug pin set values", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("main").getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL("/");

  page.on("request", (req) => {
    if (req.url().includes("/pin/initiate") || req.url().includes("/pin/confirm")) {
      console.log("REQUEST", req.method(), req.url(), req.postData());
    }
  });
  page.on("response", async (res) => {
    if (res.url().includes("/pin/initiate") || res.url().includes("/pin/confirm")) {
      console.log("RESPONSE", res.status(), res.url(), await res.text().catch(() => "<no body>"));
    }
  });

  await page.goto("/pin-security");
  const pinCard = page
    .getByRole("heading", { name: "9-Digit Transaction PIN Setup", exact: true })
    .locator("xpath=ancestor::div[contains(@class,'bg-white')][1]");
  await pinCard.locator('input[type="password"]').nth(0).fill("demo1234");
  await pinCard.getByPlaceholder("9 numeric digits (e.g. 984018274)").fill("111222444");
  await pinCard.getByPlaceholder("Re-enter 9 numeric digits").fill("111222444");

  const v1 = await pinCard.getByPlaceholder("9 numeric digits (e.g. 984018274)").inputValue();
  const v2 = await pinCard.getByPlaceholder("Re-enter 9 numeric digits").inputValue();
  console.log("PIN FIELD VALUES:", v1, v2);

  clearLog();
  await pinCard.getByRole("button", { name: "Set & Activate 9-Digit Transaction PIN" }).click();
  await expect(pinCard.getByText("Enter the one-time code we emailed you")).toBeVisible({ timeout: 10000 });
  const otp = extractOtp();
  console.log("OTP:", otp);
  await pinCard.getByLabel("One-time code").fill(otp);
  await pinCard.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(pinCard.getByText("Transaction PIN set")).toBeVisible({ timeout: 10000 });
});
