import type { Metadata } from "next";
import { ComparisonTable } from "@/components/units/comparison-table";
import { FilterableItem, ResidenceFilter } from "@/components/units/residence-filter";
import { UnitCard } from "@/components/units/unit-card";
import { PageHeader } from "@/components/ui/page-header";
import { getUnitCover, getUnits } from "@/lib/data";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { PRICE_DISCLAIMER } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "3, 4 & 5-Bedroom Furnished Apartments Near USC",
  description:
    "Compare all five furnished apartments at 37th Street Housing near USC: 3, 4 and 5 bedrooms, a private bath for every bedroom, in-unit laundry, from $5,100/month. Available August 2027.",
  alternates: { canonical: "/residences" },
};

export default async function ResidencesPage() {
  const units = await getUnits();
  const covers = await Promise.all(units.map((u) => getUnitCover(u.slug)));
  const counts = units.reduce<Record<number, number>>((acc, u) => ({ ...acc, [u.bedrooms]: (acc[u.bedrooms] ?? 0) + 1 }), {});
  const bedroomCounts = Object.keys(counts).map(Number).sort((a, b) => b - a);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Residences", path: "/residences" }])} />
      <PageHeader
        eyebrow="Residences · August 2027"
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
