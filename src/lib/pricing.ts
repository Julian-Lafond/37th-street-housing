import type { Unit } from "@/content/types";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return usd.format(amount);
}

export const PRICE_DISCLAIMER = "Pricing and availability subject to change. Contact us for current details.";

/** Sum of mandatory recurring fees per month. */
export function mandatoryFeesTotal(unit: Pick<Unit, "mandatoryFees">): number {
  return unit.mandatoryFees.reduce((sum, fee) => sum + fee.monthlyAmount, 0);
}

/**
 * The advertised monthly price. Always includes every mandatory recurring fee,
 * so adding a fee in units.ts updates every displayed price automatically.
 * Returns null when the price is "on request".
 */
export function advertisedMonthlyPrice(
  unit: Pick<Unit, "pricingMode" | "monthlyRent" | "mandatoryFees" | "bedrooms">,
): number | null {
  if (unit.pricingMode === "on_request") return null;
  const rent = unit.pricingMode === "per_bedroom" ? unit.monthlyRent * unit.bedrooms : unit.monthlyRent;
  return rent + mandatoryFeesTotal(unit);
}

/** Illustrative even split of the advertised price, rounded to the nearest dollar. */
export function perBedroomIllustration(
  unit: Pick<Unit, "pricingMode" | "monthlyRent" | "mandatoryFees" | "bedrooms" | "showPerBedroomHelper">,
): number | null {
  if (!unit.showPerBedroomHelper || unit.pricingMode !== "whole_unit" || unit.bedrooms < 2) return null;
  const total = advertisedMonthlyPrice(unit);
  return total === null ? null : Math.round(total / unit.bedrooms);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "August 2027" from an ISO date like "2027-08-01" (no Date parsing, so no timezone drift). */
export function formatAvailability(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

/** "October 26, 2026" from an ISO date. */
export function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}
