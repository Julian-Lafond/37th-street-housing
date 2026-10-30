import { describe, expect, it } from "vitest";
import { units } from "@/content/units";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_NAME, unitSeo } from "@/lib/seo";

// Google shows roughly 60 characters of a title and 155 of a description.
const fullTitle = (title: string) => `${title} | ${SITE_NAME}`;

describe("apartment search titles and descriptions", () => {
  it.each(units.map((u) => [u.slug, u] as const))("%s fits Google's limits and names the apartment", (_slug, unit) => {
    const { title, description } = unitSeo(unit);
    expect(fullTitle(title).length).toBeLessThanOrEqual(60);
    expect(description.length).toBeLessThanOrEqual(155);
    expect(title).toContain(unit.displayName);
    expect(title).toContain("Near USC");
    expect(description).toContain("Inquire today");
  });

  it("are unique across apartments", () => {
    const titles = units.map((u) => unitSeo(u).title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("price includes mandatory fees, so Google never shows a lower price than the page", () => {
    const unit = { ...units[0], mandatoryFees: [{ name: "Trash & sewer", monthlyAmount: 45 }] };
    expect(unitSeo(unit).description).toContain("$8,795/month");
  });

  it("uses the owner's own SEO text from /admin when filled in", () => {
    const unit = { ...units[0], seo: { title: "Custom title", description: "Custom description." } };
    expect(unitSeo(unit)).toEqual({ title: "Custom title", description: "Custom description." });
  });

  it("says when an apartment is leased instead of advertising a price", () => {
    const { description } = unitSeo({ ...units[0], status: "leased" });
    expect(description).not.toContain("$");
    expect(description).toContain("Currently leased");
  });
});

describe("home page", () => {
  it("fits Google's limits", () => {
    expect(HOME_TITLE.length).toBeLessThanOrEqual(60);
    expect(HOME_DESCRIPTION.length).toBeLessThanOrEqual(155);
  });
});
