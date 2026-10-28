import { ChevronDown } from "lucide-react";
import type { Unit } from "@/content/types";
import { advertisedMonthlyPrice, formatCurrency } from "@/lib/pricing";

/** Expandable itemization: rent, each mandatory fee, the monthly total, optional fees, deposit and one-time charges. */
export function PriceDetails({ unit }: { unit: Unit }) {
  const total = advertisedMonthlyPrice(unit);

  return (
    <details className="group rounded-xl border border-ink/12 bg-plaster">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-semibold [&::-webkit-details-marker]:hidden">
        Price details
        <ChevronDown aria-hidden="true" className="size-5 transition-transform duration-(--dur-micro) group-open:rotate-180" />
      </summary>
      <div className="border-t border-ink/10 px-5 py-4 text-[0.9375rem]">
        <table className="w-full">
          <caption className="sr-only">Monthly and one-time costs</caption>
          <tbody>
            <Row label="Monthly rent (whole apartment)" value={formatCurrency(unit.monthlyRent)} />
            {unit.mandatoryFees.map((fee) => (
              <Row key={fee.name} label={`${fee.name} (required, monthly)`} value={formatCurrency(fee.monthlyAmount)} />
            ))}
            {total !== null && (
              <Row label="Total monthly price" value={formatCurrency(total)} strong />
            )}
            {unit.optionalFees.map((fee) => (
              <Row key={fee.name} label={`${fee.name} (optional, monthly)`} value={formatCurrency(fee.monthlyAmount)} />
            ))}
            <Row label="Security deposit (one-time)" value={formatCurrency(unit.securityDeposit)} spaced />
            {unit.oneTimeCharges.map((c) => (
              <Row key={c.name} label={`${c.name} (one-time${c.refundable ? ", refundable" : ""})`} value={formatCurrency(c.amount)} />
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function Row({ label, value, strong, spaced }: { label: string; value: string; strong?: boolean; spaced?: boolean }) {
  return (
    <tr className={`${strong ? "border-t border-ink/15 font-bold" : ""} ${spaced ? "border-t border-ink/10" : ""}`}>
      <th scope="row" className="py-2 pr-4 text-left font-[inherit]">
        {label}
      </th>
      <td className="py-2 text-right tabular-nums">{value}</td>
    </tr>
  );
}
