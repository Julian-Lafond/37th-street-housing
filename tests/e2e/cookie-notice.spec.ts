import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "./helpers";

test.use({ storageState: { cookies: [], origins: [] } });

test("cookie notice shows on a first home-page visit and stays dismissed", async ({ page, browserName }) => {
  await page.goto("/");
  const notice = page.getByRole("complementary", { name: "Cookie notice" });
  await expect(notice).toBeVisible();
  await expect(notice.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
  if (browserName === "chromium") await expectNoAxeViolations(page, "aside[aria-label='Cookie notice']");

  await notice.getByRole("button", { name: "Got it" }).click();
  await expect(notice).toBeHidden();
  await page.reload();
  await expect(notice).toBeHidden();
});

test("cookie notice appears only on the home page", async ({ page }) => {
  await page.goto("/residences");
  await expect(page.getByRole("complementary", { name: "Cookie notice" })).toHaveCount(0);
});
