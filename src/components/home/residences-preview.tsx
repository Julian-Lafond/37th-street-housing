import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomePageContent, MediaItem, Unit } from "@/content/types";
import { UnitCard } from "@/components/units/unit-card";
import { Reveal } from "@/components/motion/reveal";

export function ResidencesPreview({
  content,
  units,
  covers,
}: {
  content: HomePageContent["residences"];
  units: Unit[];
  covers: Record<string, MediaItem | null>;
}) {
  return (
    <section aria-labelledby="residences-heading" className="section-y border-t border-ink/10 bg-sand/40">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-terracotta">{content.eyebrow}</p>
            <h2 id="residences-heading" data-split className="mt-4 text-display">
              {content.heading}
            </h2>
            <p className="mt-5 text-lede text-ink-soft">{content.body}</p>
          </Reveal>
          <Link href="/residences" className="group inline-flex min-h-11 items-center gap-2 font-semibold text-terracotta">
            <span className="link-underline">View all residences</span>
            <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-(--dur-micro) group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Phones: horizontal scroll-snap. Tablet/desktop: grid. */}
      <div className="mt-12 md:container-site">
        <ul
          aria-label="Residences"
          className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6 md:grid md:snap-none md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3"
        >
          {units.map((unit, i) => (
            <Reveal as="li" key={unit.slug} delay={(i % 3) * 0.08} className="w-[84%] max-w-sm shrink-0 snap-start md:w-auto md:max-w-none">
              <UnitCard unit={unit} cover={covers[unit.slug] ?? null} compact />
            </Reveal>
          ))}
          <Reveal as="li" delay={0.16} className="w-[84%] max-w-sm shrink-0 snap-start md:w-auto md:max-w-none">
            <Link
              href="/residences"
              className="on-dark group flex h-full min-h-72 flex-col justify-between rounded-2xl bg-dusk p-6 text-plaster transition-transform duration-(--dur-ui) ease-(--ease-entrance) hover:-translate-y-1"
            >
              <span className="eyebrow text-sunset">Compare</span>
              <span>
                <span className="block font-display text-title">See all five side by side.</span>
                <span className="mt-4 inline-flex items-center gap-2 font-semibold">
                  Comparison table
                  <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-(--dur-micro) group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </Reveal>
        </ul>
      </div>
    </section>
  );
}
