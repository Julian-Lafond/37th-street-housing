import { expect, test } from "@playwright/test";
import { expectNoAxeViolations, settle } from "./helpers";

// Everything else runs with reduced motion; this file checks the full motion system.
test.use({ contextOptions: { reducedMotion: "no-preference" } });

const sectionOf = (id: string) => `section:has(#${id})`;

test("intro never blocks interaction", async ({ page }) => {
  await page.goto("/");
  // The intro panel is still on screen here; clicks must pass straight through.
  await page.getByRole("link", { name: "View residences" }).click({ timeout: 8000 });
  await expect(page).toHaveURL(/\/residences$/, { timeout: 10_000 });
});

test("intro plays once per session", async ({ page, isMobile }) => {
  test.skip(isMobile, "once is enough");
  // The flag itself clears ~2.3s after load, so check the session marker it sets.
  await page.goto("/");
  expect(await page.evaluate(() => sessionStorage.getItem("intro-seen"))).toBe("1");
  await page.goto("/gallery", { waitUntil: "commit" });
  await expect(page.locator("html")).not.toHaveAttribute("data-intro", "play");
});

test("no horizontal overflow with motion on", async ({ page }) => {
  test.setTimeout(120_000); // visits several pages, scrolling each end to end
  for (const path of ["/", "/residences", "/gallery", "/contact"]) {
    await page.goto(path);
    await settle(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test("axe passes with animations running to completion", async ({ page }) => {
  await page.goto("/");
  await settle(page);
  await page.waitForTimeout(1500);
  await expectNoAxeViolations(page);
});

test("no console errors with motion on", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const path of ["/", "/residences", "/residences/apt-1160", "/gallery", "/contact", "/privacy"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    await settle(page);
  }
  expect(errors).toEqual([]);
});

test.describe("desktop", () => {
  test.skip(({ isMobile }) => isMobile, "desktop behaviour");

  test("interiors showcase pins and keyboard focus scrolls panels into view", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const section = page.locator(sectionOf("interiors-heading"));
    await expect(section).toHaveAttribute("data-pinned", "");
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const last = section.getByRole("button", { name: /open larger view/ }).last();
    await last.focus();
    await page.waitForTimeout(800);
    const box = await last.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width / 2).toBeLessThanOrEqual(1440);
  });

  test("header hides on scroll down and returns on scroll up", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForTimeout(1600);
    await page.mouse.move(700, 500);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(1500);
    expect(await page.locator("header").evaluate((h) => h.getBoundingClientRect().bottom)).toBeLessThanOrEqual(1);
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(1200);
    expect(await page.locator("header").evaluate((h) => h.getBoundingClientRect().top)).toBeGreaterThanOrEqual(-1);
  });

  test("smooth scrolling is active and the mouse cursor is the normal one", async ({ page }) => {
    await page.goto("/");
    await page.mouse.move(400, 400);
    await expect(page.locator("html")).toHaveClass(/lenis/);
    expect(await page.locator("body").evaluate((b) => getComputedStyle(b).cursor)).not.toBe("none");
  });
});

test.describe("phones", () => {
  test.skip(({ isMobile }) => !isMobile, "touch behaviour");

  test("showcase is a swipeable rail", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(sectionOf("interiors-heading"))).not.toHaveAttribute("data-pinned", "");
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("turns off smooth scroll, pinning and intro", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-intro", "play");
    await expect(page.locator("html")).not.toHaveClass(/lenis/);
    await expect(page.locator(sectionOf("interiors-heading"))).not.toHaveAttribute("data-pinned", "");
  });
});
