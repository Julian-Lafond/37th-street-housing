import type { Metadata } from "next";
import Link from "next/link";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { PageHeader } from "@/components/ui/page-header";
import { RepresentativeNote } from "@/components/ui/representative-note";
import { UnitName } from "@/components/ui/unit-name";
import { ButtonLink } from "@/components/ui/button";
import { getMedia, getUnits } from "@/lib/data";
import { selectForUnit, selectShared } from "@/lib/data/media-selectors";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Photo Gallery: Inside the Building",
  description:
    "Photos of 37th Street Housing near USC: the building on West 37th Street, furnished bedrooms, private bathrooms and shared kitchens.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const [media, units] = await Promise.all([getMedia(), getUnits()]);
  const shared = selectShared(media);
  const exterior = shared.filter((m) => m.kind === "image" && m.category === "exterior");
  const interiors = shared.filter((m) => m.kind === "image" && m.category === "interior");
  const videos = shared.filter((m) => m.kind === "video");
  const perUnit = units.map((u) => ({ unit: u, items: selectForUnit(media, u.slug) })).filter((g) => g.items.length > 0);

  const segments = [
    exterior.length > 0 && { id: "exterior", label: "Exterior" },
    interiors.length > 0 && { id: "interiors", label: "Interiors" },
    ...perUnit.map((g) => ({ id: g.unit.slug, label: g.unit.displayName })),
    videos.length > 0 && { id: "video", label: "Video" },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Gallery", path: "/gallery" }])} />
      <PageHeader
        eyebrow="Gallery"
        title="Inside 37th Street"
        body="The building on West 37th Street, and a look at the furnished bedrooms, private bathrooms and kitchens inside."
      >
        <RepresentativeNote className="mt-6 max-w-2xl" />
        {segments.length > 1 && (
          <nav aria-label="Gallery sections" className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {segments.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`#${s.id}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-ink/25 px-5 text-[0.9375rem] font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-plaster"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </PageHeader>

      {exterior.length > 0 && (
        <section id="exterior" aria-labelledby="exterior-heading" className="container-site pb-[var(--space-block)]">
          <h2 id="exterior-heading" data-split className="mb-6 text-title">
            Exterior
          </h2>
          <GalleryGrid items={exterior} label="Exterior photos" />
        </section>
      )}

      {interiors.length > 0 && (
        <section id="interiors" aria-labelledby="interiors-heading" className="container-site pb-[var(--space-block)]">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 id="interiors-heading" data-split className="text-title">
              Interiors
            </h2>
            <RepresentativeNote className="max-w-md" />
          </div>
          <GalleryGrid items={interiors} label="Interior photos" />
        </section>
      )}

      {perUnit.map(({ unit, items }) => (
        <section key={unit.slug} id={unit.slug} aria-labelledby={`${unit.slug}-heading`} className="container-site pb-[var(--space-block)]">
          <h2 id={`${unit.slug}-heading`} className="mb-6 text-title">
            <UnitName unit={unit} />
          </h2>
          <GalleryGrid items={items} label={`Photos of ${unit.accessibleName}`} />
        </section>
      ))}

      {videos.length > 0 && (
        <section id="video" aria-labelledby="video-heading" className="container-site pb-[var(--space-block)]">
          <h2 id="video-heading" className="mb-6 text-title">
            Video
          </h2>
          <ul className="grid gap-6 md:grid-cols-2">
            {videos.map((v) => (
              <li key={v.id}>
                <figure>
                  <video controls preload="metadata" poster={v.poster} className="aspect-video w-full rounded-xl bg-ink" aria-label={v.alt}>
                    <source src={v.src} type="video/mp4" />
                    {v.captionsSrc && <track kind="captions" src={v.captionsSrc} srcLang="en" label="English" default />}
                  </video>
                  {v.caption && <figcaption className="mt-2 text-sm text-ink-soft">{v.caption}</figcaption>}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="container-site pb-[var(--space-section)]">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-sand p-8 md:flex-row md:items-center md:p-10">
          <p className="font-display text-title">Like what you see?</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/residences" variant="secondary">
              View residences
            </ButtonLink>
            <ButtonLink href="/contact">Inquire</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
