import { describe, expect, it } from "vitest";
import type { Unit } from "@/content/types";
import { units } from "@/content/units";
import {
  advertisedMonthlyPrice,
  formatAvailability,
  formatCurrency,
  perBedroomIllustration,
} from "@/lib/pricing";

describe("unit data (owner-confirmed)", () => {
  const expected = [
    ["apt-1158", 5, 5, 1720, 8750, 8750, 1750],
    ["apt-1158-quarter", 3, 3, 1042, 5100, 5100, 1700],
    ["apt-1158-half", 3, 3, 1045, 5100, 5100, 1700],
    ["apt-1158-three-quarter", 4, 4, 1411, 6800, 6800, 1700],
    ["apt-1160", 5, 5, 1809, 8875, 8875, 1775],
  ] as const;

  it("lists the five units in display order", () => {
    expect(units.map((u) => u.slug)).toEqual(expected.map((e) => e[0]));
  });

  it.each(expected)("%s has the confirmed specs and pricing", (slug, beds, baths, sqft, rent, deposit, perBed) => {
    const u = units.find((x) => x.slug === slug)!;
    expect([u.bedrooms, u.bathrooms, u.squareFeet, u.monthlyRent, u.securityDeposit]).toEqual([beds, baths, sqft, rent, deposit]);
    expect(u.furnished && u.inUnitLaundry).toBe(true);
    expect(u.leaseTermMonths).toBe(12);
    expect(formatAvailability(u.availableFrom)).toBe("August 2027");
    expect(perBedroomIllustration(u)).toBe(perBed);
  });

  it("never uses fraction characters in slugs", () => {
    for (const u of units) expect(u.slug).toMatch(/^[a-z0-9-]+$/);
  });
});

describe("pricing rules", () => {
  const base = units[0];

  it("formats whole dollars", () => {
    expect(formatCurrency(8750)).toBe("$8,750");
  });

  it("includes mandatory fees in the advertised price and the per-bedroom illustration", () => {
    const withFees = { ...base, mandatoryFees: [{ name: "Trash", monthlyAmount: 50 }, { name: "Water", monthlyAmount: 100 }] };
    expect(advertisedMonthlyPrice(withFees)).toBe(8900);
    expect(perBedroomIllustration(withFees)).toBe(1780);
  });

  it("does not add optional fees to the advertised price", () => {
    const withOptional: Unit = { ...base, optionalFees: [{ name: "Parking", monthlyAmount: 150 }] };
    expect(advertisedMonthlyPrice(withOptional)).toBe(8750);
  });

  it("supports per-bedroom and on-request modes", () => {
    expect(advertisedMonthlyPrice({ ...base, pricingMode: "per_bedroom", monthlyRent: 1800 })).toBe(9000);
    expect(advertisedMonthlyPrice({ ...base, pricingMode: "on_request" })).toBeNull();
    expect(perBedroomIllustration({ ...base, pricingMode: "per_bedroom" })).toBeNull();
  });

  it("hides the illustration when turned off", () => {
    expect(perBedroomIllustration({ ...base, showPerBedroomHelper: false })).toBeNull();
  });
});
