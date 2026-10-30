import type { Metadata } from "next";
import { ComparisonTable } from "@/components/units/comparison-table";
import { FilterableItem, ResidenceFilter } from "@/components/units/residence-filter";
import { UnitCard } from "@/components/units/unit-card";
import { PageHeader } from "@/components/ui/page-header";
import { getUnitCover, getUnits } from "@/lib/data";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { PRICE_DISCLAIMER, advertisedMonthlyPrice, formatCurrency } from "@/lib/pricing";

export async function generateMetadata(): Promise<Metadata> {
  const units = await getUnits();
  const prices = units.map(advertisedMonthlyPrice).filter((p): p is number => p !== null);
  const beds = units.map((u) => u.bedrooms);
  const range = `${Math.min(...beds)}–${Math.max(...beds)}`;
  return pageMetadata({
    title: `${range} Bedroom Apartments Near USC`,
    description: `Compare ${units.length} furnished ${range} bedroom apartments near USC${
      prices.length ? `, from ${formatCurrency(Math.min(...prices))}/month` : ""
    }, each bedroom with a private bath. Inquire about August 2027 leases.`,
    path: "/residences",
  });
}

export default async function ResidencesPage() {
  const units = await getUnits();
  const covers = await Promise.all(units.map((u) => getUnitCover(u.slug)));
  const counts = units.reduce<Record<number, number>>((acc, u) => ({ ...acc, [u.bedrooms]: (acc[u.bedrooms] ?? 0) + 1 }), {});
  const bedroomCounts = Object.keys(counts).map(Number).sort((a, b) => b - a);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Residences", path: "/residences" }])} />
      <PageHeader
        eyebrow="3–5 bedroom apartments near USC · August 2027"
        eyebrowInHeading
        title="Five apartments, three to five bedrooms."
        body="Every apartment is fully furnished, has a washer and dryer in the unit, and gives each bedroom its own private bathroom. Rent is for the whole apartment per month on a 12-month lease."
      />

      <section aria-labelledby="all-residences" className="container-site pb-[var(--space-section)]">
        <h2 id="all-residences" className="sr-only">
          All residences
        </h2>
        <ResidenceFilter bedroomCounts={bedroomCounts} total={counts}>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((unit, i) => (
              <FilterableItem key={unit.slug} bedrooms={unit.bedrooms}>
                <UnitCard unit={unit} cover={covers[i]} />
              </FilterableItem>
            ))}
          </ul>
        </ResidenceFilter>
      </section>

      <section aria-labelledby="compare-heading" className="section-y border-t border-ink/10 bg-sand/40">
        <div className="container-site">
          <p className="eyebrow text-terracotta">Side by side</p>
          <h2 id="compare-heading" data-split className="mt-4 text-display">
            Compare the residences
          </h2>
          <div className="mt-10">
            <ComparisonTable units={units} />
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Rent shown is for the whole apartment per month. {PRICE_DISCLAIMER}
          </p>
        </div>
      </section>
    </>
  );
}
