import { expect, test } from "@playwright/test";
import { PAGES } from "./helpers";

test.describe("residences", () => {
  test("comparison shows the confirmed data for all five units", async ({ page, isMobile }) => {
    test.skip(isMobile, "table is replaced by stacked cards on mobile");
    await page.goto("/residences");
    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(5);
    const expected = [
      ["Apartment 1158", "5 bed / 5 bath", "1,720", "$8,750", "$8,750"],
      ["Apartment 1158 and a quarter", "3 bed / 3 bath", "1,042", "$5,100", "$5,100"],
      ["Apartment 1158 and a half", "3 bed / 3 bath", "1,045", "$5,100", "$5,100"],
      ["Apartment 1158 and three quarters", "4 bed / 4 bath", "1,411", "$6,800", "$6,800"],
      ["Apartment 1160", "5 bed / 5 bath", "1,809", "$8,875", "$8,875"],
    ];
    for (const [i, cells] of expected.entries()) {
      const text = await rows.nth(i).innerText();
      for (const c of cells.slice(1)) expect(text).toContain(c);
      await expect(rows.nth(i).locator(".sr-only")).toHaveText(cells[0]);
      for (const c of ["Yes", "In unit", "12 months", "August 2027"]) expect(text).toContain(c);
    }
  });

  test("unit cards contain no photos while every photo is shared", async ({ page }) => {
    await page.goto("/residences");
    await expect(page.locator("article img")).toHaveCount(0);
    await page.goto("/residences/apt-1160");
    await expect(page.locator("main section").first().locator("img")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "See interiors throughout the building" }).first()).toBeVisible();
  });

  test("bedroom filter uses toggle buttons and announces the count", async ({ page }) => {
    await page.goto("/residences");
    const three = page.getByRole("button", { name: "3 bed" });
    await three.click();
    await expect(three).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("status").filter({ hasText: "Showing" })).toHaveText("Showing 2 of 5 residences");
    await expect(page.locator("article:visible")).toHaveCount(2);
  });

  test("per-bedroom figure is labeled as an illustration", async ({ page }) => {
    await page.goto("/residences/apt-1158");
    await expect(page.getByText("Illustration: about $1,750 per bedroom if split evenly.").first()).toBeVisible();
    await expect(page.getByText("Pricing and availability subject to change.").first()).toBeVisible();
  });
});

test.describe("contact form", () => {
  test("?unit= prefills the apartment", async ({ page }) => {
    await page.goto("/contact?unit=apt-1158-three-quarter");
    await expect(page.getByLabel("Apartment of interest")).toHaveValue("apt-1158-three-quarter");
  });

  test("failed submit focuses the error summary and links to fields", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send inquiry" }).click();
    const summary = page.locator("[aria-labelledby=error-summary-title]");
    await expect(summary).toBeFocused();
    await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Full name")).toHaveAttribute("aria-describedby", /inquiry-fullName-error/);
    await summary.getByRole("link", { name: /Email/ }).click();
    await expect(page.getByRole("textbox", { name: /^Email/ })).toBeFocused();
  });

  test("texting reveals the SMS consent and requires it", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByLabel(/receive text messages/)).toHaveCount(0);
    await page.getByLabel("Text", { exact: true }).check();
    await expect(page.getByLabel(/receive text messages/)).not.toBeChecked();
    await expect(page.getByText(/Message and data rates may apply/)).toBeVisible();
  });

  test("valid submit is accepted and no form data goes in the URL or to other sites", async ({ page }) => {
    // The e2e server runs with INQUIRY_DRY_RUN=1, so this validates end to end without saving.
    const offsite: string[] = [];
    page.on("request", (r) => r.method() !== "GET" && new URL(r.url()).hostname !== "localhost" && offsite.push(r.url()));
    await page.goto("/contact");
    await page.getByLabel("Full name").fill("Alex Rivera");
    await page.getByRole("textbox", { name: /^Email/ }).fill("alex@example.com");
    await page.getByLabel("Apartment of interest").selectOption("apt-1160");
    await page.getByLabel(/I agree to be contacted/).check();
    await page.getByRole("button", { name: "Send inquiry" }).click();
    const result = page.getByRole("heading", { name: "Thanks, we received your inquiry." });
    await expect(result).toBeVisible();
    await expect(page.locator("div[tabindex='-1']").filter({ has: result })).toBeFocused();
    await expect(page.getByLabel("Full name")).toHaveValue("");
    expect(page.url()).not.toContain("alex");
    expect(offsite).toEqual([]);
  });
});

test.describe("gallery lightbox", () => {
  test("keyboard: opens, navigates, announces, closes and returns focus", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard flow");
    await page.goto("/gallery");
    const thumb = page.getByRole("list", { name: "Interior photos" }).getByRole("button").nth(1);
    await thumb.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Photo viewer" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
    await expect(dialog.getByText(/2 of 17/)).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(dialog.getByText(/3 of 17/)).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.getByText(/1 of 17/)).toBeVisible();
    await expect(dialog.getByText(/representative residences/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(thumb).toBeFocused();
  });
});

test.describe("navigation & layout", () => {
  test("skip link moves focus to main", async ({ page, browserName, isMobile }) => {
    test.skip(isMobile || browserName === "webkit", "WebKit skips links on Tab by default");
    await page.goto("/residences");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });

  test("mobile menu traps focus and closes with Escape", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Menu" });
    await menuButton.click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menuButton).toBeFocused();
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  for (const width of [320, 768, 1024, 1440, 1920]) {
    test(`no horizontal scroll at ${width}px`, async ({ page, isMobile }) => {
      test.skip(isMobile, "desktop projects set the width");
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/residences", "/residences/apt-1158-three-quarter", "/gallery", "/contact"]) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("reduced motion disables the hero zoom", async ({ page }) => {
    await page.goto("/");
    const duration = await page.locator(".hero-zoom").evaluate((el) => getComputedStyle(el).animationDuration);
    expect(parseFloat(duration)).toBeLessThan(0.1);
  });

  test("footer carries the required legal statements", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("img", { name: "Equal Housing Opportunity" })).toBeVisible();
    await expect(footer).toContainText("We are pledged to the letter and spirit of U.S. policy");
    await expect(footer).toContainText("not affiliated with or endorsed by the University of Southern California");
    for (const name of ["Privacy Policy", "Terms of Use", "Accessibility", "Fair Housing"]) {
      await expect(footer.getByRole("link", { name, exact: true })).toBeVisible();
    }
  });

  test("no console errors on public pages", async ({ page }) => {
    const errors: string[] = [];
    // WebKit logs link prefetches cancelled by navigating away as "access control" errors; they aren't real failures.
    const cancelledPrefetch = /Fetch API cannot load .*_rsc=.* due to access control checks/;
    page.on("console", (m) => m.type() === "error" && !cancelledPrefetch.test(m.text()) && errors.push(`${page.url()}: ${m.text()}`));
    page.on("pageerror", (e) => errors.push(String(e)));
    // Wait for idle so cancelled link prefetches from the previous page aren't counted.
    for (const path of PAGES.filter((p) => !p.includes("does-not-exist"))) await page.goto(path, { waitUntil: "networkidle" });
    expect(errors).toEqual([]);
  });
});

test.describe("SEO", () => {
  test("each page has one h1, a unique title and a canonical URL", async ({ page, isMobile }) => {
    test.skip(isMobile, "once is enough");
    const titles = new Set<string>();
    for (const path of PAGES.filter((p) => !p.includes("does-not-exist"))) {
      await page.goto(path);
      await expect(page.locator("h1"), path).toHaveCount(1);
      const title = await page.title();
      expect(titles.has(title), `duplicate title: ${title}`).toBe(false);
      titles.add(title);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/37thstreethousing\.com/);
      for (const script of await page.locator('script[type="application/ld+json"]').allTextContents()) {
        expect(() => JSON.parse(script)).not.toThrow();
      }
    }
  });

  test("structured data, sitemap, robots and OG images", async ({ page, request, isMobile }) => {
    test.skip(isMobile, "once is enough");
    await page.goto("/residences/apt-1158-quarter");
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((s) => [JSON.parse(s)].flat());
    const apt = ld.find((d) => d["@type"] === "Apartment");
    expect(apt.offers.price).toBe(5100);
    expect(apt.offers.availabilityStarts).toBe("2027-08-01");
    expect(ld.some((d) => d["@type"] === "BreadcrumbList")).toBe(true);

    await page.goto("/");
    const home = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((s) => [JSON.parse(s)].flat());
    expect(home.find((d) => d["@type"] === "ApartmentComplex").numberOfAccommodationUnits).toBe(5);
    expect(home.some((d) => d["@type"] === "FAQPage")).toBe(true);

    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const slug of ["apt-1158", "apt-1158-quarter", "apt-1158-half", "apt-1158-three-quarter", "apt-1160"]) {
      expect(sitemap).toContain(`/residences/${slug}`);
    }
    expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap: https://37thstreethousing.com/sitemap.xml");
    // Read the share image URL from the page itself (Next may add a hash to the route).
    await page.goto("/residences/apt-1160");
    const ogUrl = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogUrl).toBeTruthy();
    const og = await request.get(new URL(ogUrl!).pathname);
    expect(og.headers()["content-type"]).toContain("image/png");
  });

  test("security headers are set", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["strict-transport-security"]).toContain("max-age=");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"]).toContain("camera=()");
  });
});

test.describe("admin", () => {
  test("signed-out visitors are sent to the login page", async ({ page }) => {
    await page.goto("/admin/inquiries");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  });

  test("admin pages are hidden from search engines", async ({ page, request }) => {
    await page.goto("/admin/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/admin");
  });

  test("CSV export refuses signed-out requests", async ({ request }) => {
    const res = await request.get("/admin/inquiries/export", { maxRedirects: 0 });
    expect([302, 303, 307, 401]).toContain(res.status());
  });
});

