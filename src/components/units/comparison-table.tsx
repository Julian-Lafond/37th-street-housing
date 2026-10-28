import Link from "next/link";
import type { Unit } from "@/content/types";
import { UnitName } from "@/components/ui/unit-name";
import { advertisedMonthlyPrice, formatAvailability, formatCurrency } from "@/lib/pricing";

function rows(unit: Unit) {
  const price = advertisedMonthlyPrice(unit);
  return [
    { label: "Beds/Baths", value: `${unit.bedrooms} bed / ${unit.bathrooms} bath` },
    { label: "Sq ft", value: unit.squareFeet.toLocaleString("en-US") },
    { label: "Rent/month", value: price === null ? "On request" : formatCurrency(price) },
    { label: "Deposit", value: formatCurrency(unit.securityDeposit) },
    { label: "Furnished", value: unit.furnished ? "Yes" : "No" },
    { label: "Washer/Dryer", value: unit.inUnitLaundry ? "In unit" : "No" },
    { label: "Lease term", value: `${unit.leaseTermMonths} months` },
    { label: "Available", value: formatAvailability(unit.availableFrom) },
  ];
}

/** Semantic table on desktop; separate stacked cards on small screens (display:none keeps only one in the a11y tree). */
export function ComparisonTable({ units }: { units: Unit[] }) {
  const headers = rows(units[0]).map((r) => r.label);

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-ink/10 md:block">
        <table className="w-full min-w-[56rem] border-collapse text-left text-[0.9375rem]">
          <caption className="sr-only">
            Comparison of all five apartments: bedrooms and bathrooms, size, monthly rent, deposit, furnishing, laundry,
            lease term and availability
          </caption>
          <thead className="bg-sand">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">
                Apartment
              </th>
              {headers.map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-bold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.slug} className="border-t border-ink/10">
                <th scope="row" className="px-4 py-3 font-display text-xl font-normal whitespace-nowrap">
                  <Link href={`/residences/${unit.slug}`} className="link-underline">
                    <UnitName unit={unit} />
                  </Link>
                </th>
                {rows(unit).map((r) => (
                  <td key={r.label} className="px-4 py-3 whitespace-nowrap">
                    {r.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-4 md:hidden">
        {units.map((unit) => (
          <li key={unit.slug} className="rounded-2xl border border-ink/10 bg-plaster p-5">
            <h3 className="font-display text-2xl">
              <Link href={`/residences/${unit.slug}`} className="link-underline">
                <UnitName unit={unit} />
              </Link>
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.9375rem]">
              {rows(unit).map((r) => (
                <div key={r.label}>
                  <dt className="text-xs font-bold uppercase tracking-wider text-ink-soft">{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
