import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { Reveal } from "@/components/motion/reveal";
import { PriceDetails } from "@/components/units/price-details";
import { RoomPods } from "@/components/units/room-pods";
import { UnitCard } from "@/components/units/unit-card";
import { UnitPrice } from "@/components/units/unit-price";
import { ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { UnitName } from "@/components/ui/unit-name";
import { getSiteSettings, getUnit, getUnitCover, getUnitMedia, getUnitSlugs, getUnits } from "@/lib/data";
import { PRICE_DISCLAIMER, formatAvailability, formatCurrency } from "@/lib/pricing";
import { COMPLEX_ID, JsonLd, absoluteUrl, breadcrumbJsonLd, pageMetadata, postalAddressJsonLd, unitOfferJsonLd, unitSeo } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getUnitSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/residences/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const unit = await getUnit(slug);
  if (!unit) return {};
  return pageMetadata({ ...unitSeo(unit), path: `/residences/${unit.slug}`, ownShareImage: true });
}

export default async function UnitPage({ params }: PageProps<"/residences/[slug]">) {
  const { slug } = await params;
  const unit = await getUnit(slug);
  if (!unit) notFound();

  const [site, allUnits, assigned, cover] = await Promise.all([
    getSiteSettings(),
    getUnits(),
    getUnitMedia(unit.slug),
    getUnitCover(unit.slug),
  ]);
  const others = allUnits.filter((u) => u.slug !== unit.slug);
  const otherCovers = await Promise.all(others.map((u) => getUnitCover(u.slug)));
  const inquireHref = `/contact?unit=${unit.slug}`;

  const apartmentJsonLd = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    "@id": `${absoluteUrl(`/residences/${unit.slug}`)}#apartment`,
    name: `${unit.displayName}, 37th Street Housing`,
    description: unit.description,
    url: absoluteUrl(`/residences/${unit.slug}`),
    numberOfRooms: unit.bedrooms,
    numberOfBedrooms: unit.bedrooms,
    numberOfBathroomsTotal: unit.bathrooms,
    floorSize: { "@type": "QuantitativeValue", value: unit.squareFeet, unitCode: "FTK" },
    amenityFeature: [
      unit.furnished && { "@type": "LocationFeatureSpecification", name: "Fully furnished", value: true },
      unit.inUnitLaundry && { "@type": "LocationFeatureSpecification", name: "In-unit washer and dryer", value: true },
      { "@type": "LocationFeatureSpecification", name: "Private bathroom for every bedroom", value: true },
    ].filter(Boolean),
    address: postalAddressJsonLd(site),
    containedInPlace: { "@type": "ApartmentComplex", "@id": COMPLEX_ID, name: site.legalName, url: absoluteUrl("/") },
    ...(cover && { image: absoluteUrl(cover.src) }),
    offers: unitOfferJsonLd(unit),
  };

  return (
    <>
      <JsonLd
        data={[
          apartmentJsonLd,
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Residences", path: "/residences" },
            { name: unit.displayName, path: `/residences/${unit.slug}` },
          ]),
        ]}
      />

      <nav aria-label="Breadcrumb" className="container-site pt-8">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <li>
            <Link href="/" className="link-underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/residences" className="link-underline">
              Residences
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-ink">
            <UnitName unit={unit} />
          </li>
        </ol>
      </nav>

      {/* Hero band */}
      <section aria-labelledby="unit-heading" className="container-site grid gap-10 pb-16 pt-10 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-24">
        <div className="lg:col-span-6">
          {/* The eyebrow sits inside the H1 so the main heading carries the search phrase. */}
          <h1 id="unit-heading" className="text-[clamp(4rem,2.6rem+6vw,8.5rem)] leading-[0.92] tracking-[-0.04em]">
            <span className="eyebrow mb-4 block text-terracotta">
              {unit.furnished ? "Furnished apartment" : "Apartment"} near USC · {unit.bedrooms} Bed · {unit.bathrooms} Bath
              <span className="sr-only">:</span>
            </span>
            <span className="mask-word">
              <span className="mask-word-inner">
                <UnitName unit={unit} />
              </span>
            </span>
          </h1>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink/12 bg-ink/12 sm:grid-cols-4">
            {[
              ["Bedrooms", String(unit.bedrooms)],
              ["Bathrooms", `${unit.bathrooms} private`],
              ["Size", `${unit.squareFeet.toLocaleString("en-US")} sq ft`],
              ["Available", formatAvailability(unit.availableFrom)],
            ].map(([label, value]) => (
              <div key={label} className="bg-plaster px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wider text-ink-soft">{label}</dt>
                <dd className="mt-1 font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href={inquireHref} size="lg">
              <span aria-hidden="true">Inquire about {unit.displayName}</span>
              <span className="sr-only">Inquire about {unit.accessibleName}</span>
            </ButtonLink>
            <StatusPill status={unit.status} />
          </div>
        </div>

        <div className="lg:col-span-6">
          {cover ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-sand">
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                preload
                sizes="(min-width: 1024px) 50vw, 100vw"
                placeholder="blur"
                blurDataURL={cover.blurDataURL}
                className="object-cover"
                style={{ objectPosition: `${cover.focalPoint.x}% ${cover.focalPoint.y}%` }}
              />
            </div>
          ) : (
            <figure className="on-dark rounded-[2rem] bg-dusk p-6 sm:p-10">
              <RoomPods bedrooms={unit.bedrooms} bathrooms={unit.bathrooms} squareFeet={unit.squareFeet} tone="dark" className="w-full" />
              <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-mist">
                <span>Diagram: one private bath for each bedroom. Not a floor plan.</span>
                <Link href="/gallery#interiors" className="inline-flex min-h-11 items-center font-semibold text-plaster">
                  <span className="link-underline">See interiors throughout the building →</span>
                </Link>
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      {/* Details + pricing */}
      <section className="section-y border-t border-ink/10 bg-sand/40">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 data-split className="text-title">About this residence</h2>
              <p className="mt-5 max-w-[62ch] text-lede text-ink-soft">{unit.description}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h3 className="mt-12 font-sans text-lg font-bold" style={{ fontVariationSettings: "normal" }}>
                Features
              </h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {unit.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-eucalyptus/15">
                      <Check aria-hidden="true" className="size-3.5 text-eucalyptus-ink" strokeWidth={2.5} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
            {!cover && (
              <Link href="/gallery#interiors" className="group mt-10 inline-flex min-h-11 items-center gap-2 font-semibold text-terracotta">
                <span className="link-underline">See interiors throughout the building</span>
                <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          <aside aria-labelledby="pricing-heading" className="lg:col-span-5">
            <div className="rounded-2xl border border-ink/10 bg-plaster p-6 shadow-[0_1px_0_rgba(27,31,29,0.04),0_24px_48px_-24px_rgba(27,31,29,0.18)] sm:p-8 lg:sticky lg:top-28">
              <h2 id="pricing-heading" className="eyebrow text-terracotta">
                Pricing
              </h2>
              <div className="mt-4">
                <UnitPrice unit={unit} size="lg" showDisclaimer={false} />
              </div>
              <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10 text-[0.9375rem]">
                {[
                  ["Security deposit", formatCurrency(unit.securityDeposit)],
                  ["Lease term", `${unit.leaseTermMonths} months`],
                  ["Available", formatAvailability(unit.availableFrom)],
                  ["Furnished", unit.furnished ? "Yes" : "No"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 py-3">
                    <dt className="text-ink-soft">{label}</dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5">
                <PriceDetails unit={unit} />
              </div>
              <p className="mt-4 text-xs text-ink-soft">{PRICE_DISCLAIMER}</p>
              <ButtonLink href={inquireHref} size="lg" className="mt-6 w-full">
                Inquire<span className="sr-only"> about {unit.accessibleName}</span>
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>

      {assigned.length > 0 && (
        <section aria-labelledby="unit-photos" className="section-y container-site">
          <h2 id="unit-photos" className="mb-8 text-title">
            Photos of <UnitName unit={unit} />
          </h2>
          <GalleryGrid items={assigned} label={`Photos of ${unit.accessibleName}`} />
        </section>
      )}

      <section aria-labelledby="others-heading" className="section-y container-site">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="others-heading" data-split className="text-display">
            Other residences
          </h2>
          <Link href="/residences" className="inline-flex min-h-11 items-center font-semibold text-terracotta">
            <span className="link-underline">Compare all five</span>
          </Link>
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {others.map((u, i) => (
            <li key={u.slug}>
              <UnitCard unit={u} cover={otherCovers[i]} compact />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
