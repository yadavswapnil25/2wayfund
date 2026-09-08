import { chromium } from "playwright";

const browser = await chromium.launch({
  executablePath: "C:/Users/Admin/AppData/Local/ms-playwright/chromium-1200/chrome-win64/chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });

await page.goto("http://localhost:5194/#/login", { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Sign In" }).click();
await page.waitForTimeout(500);

await page.goto("http://localhost:5194/#/ekyc", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: "screenshot-ekyc-default.png", fullPage: true });

// Select the "Not started" application explicitly (2WF-APP-10231)
const select = page.locator("select").first();
await select.selectOption({ label: (await select.locator("option").allTextContents()).find(t => t.includes("2WF-APP-10231")) });
await page.waitForTimeout(300);
await page.screenshot({ path: "screenshot-ekyc-notstarted.png", fullPage: true });

// Upload a file for the Aadhaar doc via the "Choose file" button (3rd doc)
// Prepare a small temp PNG to upload
import fs from "fs";
import path from "path";
const tmpFile = path.join(process.cwd(), "test-doc.png");
// 1x1 png
const pngBuffer = Buffer.from("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000100ffff03000006000557bfabd40000000049454e44ae426082", "hex");
fs.writeFileSync(tmpFile, pngBuffer);

page.once("filechooser", async (chooser) => {
  await chooser.setFiles(tmpFile);
});
const chooseFileButtons = page.getByRole("button", { name: /Choose file/ });
console.log("Choose file button count:", await chooseFileButtons.count());
await chooseFileButtons.nth(2).click(); // aadhaar
await page.waitForTimeout(500);
await page.screenshot({ path: "screenshot-ekyc-after-upload.png", fullPage: true });

// Try signature draw via pointer drag on canvas
const canvas = page.locator("button:has-text('Draw signature')");
if (await canvas.count()) {
  await canvas.click();
  await page.waitForTimeout(200);
  const box = await page.locator("canvas").boundingBox();
  if (box) {
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();
    await page.mouse.move(box.x + 100, box.y + 60, { steps: 10 });
    await page.mouse.move(box.x + 200, box.y + 20, { steps: 10 });
    await page.mouse.up();
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: "screenshot-ekyc-signature.png", fullPage: true });
  const useSig = page.getByRole("button", { name: /Use this signature/ });
  if (await useSig.count()) {
    await useSig.click();
    await page.waitForTimeout(300);
  }
}

await page.screenshot({ path: "screenshot-ekyc-after-signature.png", fullPage: true });

console.log("CONSOLE/PAGE ERRORS:", JSON.stringify(errors));

await browser.close();
