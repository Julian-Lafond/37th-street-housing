import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { MediaItem, Unit } from "@/content/types";
import { StatusPill } from "@/components/ui/status-pill";
import { UnitName } from "@/components/ui/unit-name";
import { buttonClasses } from "@/components/ui/button";
import { formatAvailability } from "@/lib/pricing";
import { RoomPods } from "./room-pods";
import { UnitPrice } from "./unit-price";

export function FeatureTags({ unit, className = "" }: { unit: Unit; className?: string }) {
  const tags = [
    unit.furnished && "Furnished",
    unit.inUnitLaundry && "Washer/Dryer",
    `${unit.leaseTermMonths}-mo lease`,
  ].filter(Boolean) as string[];
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Features">
      {tags.map((t) => (
        <li key={t} className="rounded-full bg-eucalyptus/12 px-2.5 py-1 text-xs font-bold text-eucalyptus-ink">
          {t}
        </li>
      ))}
    </ul>
  );
}

export function UnitCard({
  unit,
  cover,
  headingLevel = "h3",
  compact = false,
}: {
  unit: Unit;
  /** Only present when the owner has assigned a photo to this unit. */
  cover: MediaItem | null;
  headingLevel?: "h2" | "h3";
  compact?: boolean;
}) {
  const Heading = headingLevel;
  const detailHref = `/residences/${unit.slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-sand/60 transition-[transform,background-color] duration-(--dur-ui) ease-(--ease-entrance) hover:-translate-y-1.5 hover:bg-sand">
      <div className="relative aspect-[16/11] overflow-hidden border-b border-ink/10 bg-sand">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
            placeholder="blur"
            blurDataURL={cover.blurDataURL}
            className="object-cover transition-transform duration-(--dur-reveal) ease-(--ease-entrance) group-hover:scale-[1.05]"
            style={{ objectPosition: `${cover.focalPoint.x}% ${cover.focalPoint.y}%` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-5 pb-3 pt-14 transition-transform duration-(--dur-reveal) ease-(--ease-entrance) group-hover:scale-[1.04]">
            <RoomPods
              bedrooms={unit.bedrooms}
              bathrooms={unit.bathrooms}
              squareFeet={unit.squareFeet}
              className="h-full w-full"
            />
          </div>
        )}
        <StatusPill status={unit.status} className="absolute left-4 top-4" />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="eyebrow text-terracotta">
          {unit.bedrooms} Bed · {unit.bathrooms} Bath
        </p>
        <Heading className={`mt-2 ${compact ? "text-[clamp(2.75rem,2.2rem+1.6vw,3.75rem)] leading-[0.95] tracking-[-0.03em]" : "text-unit"}`}>
          <Link href={detailHref} prefetch className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4">
            <UnitName unit={unit} variant="short" />
          </Link>
        </Heading>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div>
            <dt className="sr-only">Size</dt>
            <dd className="font-semibold">{unit.squareFeet.toLocaleString("en-US")} sq ft</dd>
          </div>
          <div>
            <dt className="sr-only">Available</dt>
            <dd className="font-semibold">Available {formatAvailability(unit.availableFrom)}</dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-ink/10 pt-5">
          <UnitPrice unit={unit} />
        </div>

        {!compact && <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">{unit.summary}</p>}
        <FeatureTags unit={unit} className="mt-4" />

        {/* Actions sit above the card-wide link overlay. */}
        <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-6">
          <Link href={detailHref} prefetch className={buttonClasses("secondary", "md")}>
            View details<span className="sr-only">: {unit.accessibleName}</span>
          </Link>
          <Link href={`/contact?unit=${unit.slug}`} className={buttonClasses("primary", "md")}>
            Inquire<span className="sr-only"> about {unit.accessibleName}</span>
            <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-(--dur-micro) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
