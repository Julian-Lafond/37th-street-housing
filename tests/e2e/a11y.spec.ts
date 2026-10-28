import { expect, test } from "@playwright/test";
import { PAGES, expectNoAxeViolations, settle } from "./helpers";

for (const path of PAGES) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    await settle(page);
    await expectNoAxeViolations(page);
  });
}

test("axe: open lightbox", async ({ page }) => {
  await page.goto("/gallery");
  await page.getByRole("list", { name: "Interior photos" }).getByRole("button").first().click();
  await expect(page.getByRole("dialog", { name: "Photo viewer" })).toBeVisible();
  await page.waitForTimeout(500);
  await expectNoAxeViolations(page);
});

test("axe: form error state and success state", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByRole("heading", { name: /Please fix/ })).toBeVisible();
  await expectNoAxeViolations(page);

  await page.getByLabel("Full name").fill("Alex Rivera");
  await page.getByRole("textbox", { name: /^Email/ }).fill("alex@example.com");
  await page.getByLabel("Apartment of interest").selectOption("any");
  await page.getByLabel(/I agree to be contacted/).check();
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByRole("heading", { name: "Thanks, we received your inquiry." })).toBeVisible();
  await expectNoAxeViolations(page);
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("axe: open mobile menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("dialog", { name: "Site menu" })).toBeVisible();
    await page.waitForTimeout(500);
    await expectNoAxeViolations(page);
  });
});

test("axe: admin login", async ({ page }) => {
  await page.goto("/admin/login");
  await expectNoAxeViolations(page);
  await page.getByRole("button", { name: "Forgot your password?" }).click();
  await expectNoAxeViolations(page);
});
