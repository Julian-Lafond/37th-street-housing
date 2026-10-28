import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const PAGES = [
  "/",
  "/residences",
  "/residences/apt-1158",
  "/residences/apt-1158-quarter",
  "/residences/apt-1158-half",
  "/residences/apt-1158-three-quarter",
  "/residences/apt-1160",
  "/gallery",
  "/contact",
  "/privacy",
  "/terms",
  "/accessibility",
  "/fair-housing",
  "/this-page-does-not-exist",
];

/** Scroll the whole page so lazy images load and scroll-reveals settle. */
export async function settle(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);
}

export async function expectNoAxeViolations(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  const summary = violations.map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(" ")).slice(0, 5).join("\n  ")}`);
  expect(summary, summary.join("\n")).toEqual([]);
}
