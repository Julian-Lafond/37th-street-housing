import type { Unit } from "@/content/types";
import { PRICE_DISCLAIMER, advertisedMonthlyPrice, formatCurrency, perBedroomIllustration } from "@/lib/pricing";

/** Advertised monthly price (always includes mandatory fees), the even-split illustration and the disclaimer. */
export function UnitPrice({
  unit,
  size = "md",
  tone = "light",
  showDisclaimer = true,
}: {
  unit: Unit;
  size?: "md" | "lg";
  tone?: "light" | "dark";
  showDisclaimer?: boolean;
}) {
  const price = advertisedMonthlyPrice(unit);
  const perBedroom = perBedroomIllustration(unit);
  const muted = tone === "dark" ? "text-mist" : "text-ink-soft";

  if (price === null) {
    return <p className="font-display text-title">Pricing on request</p>;
  }

  return (
    <div>
      <p className="flex items-baseline gap-1.5">
        <span className={`font-display ${size === "lg" ? "text-display" : "text-[2rem] leading-none"}`}>
          {formatCurrency(price)}
        </span>
        <span className={`text-[0.9375rem] font-semibold ${muted}`}>
          / month<span className="sr-only">, whole apartment</span>
        </span>
      </p>
      {perBedroom !== null && (
        <p className={`mt-1.5 text-sm ${muted}`}>
          Illustration: about {formatCurrency(perBedroom)} per bedroom if split evenly.
        </p>
      )}
      {showDisclaimer && <p className={`mt-2 text-xs leading-snug ${muted}`}>{PRICE_DISCLAIMER}</p>}
    </div>
  );
}
