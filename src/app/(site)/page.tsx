import type { Metadata } from "next";
import { CtaBand } from "@/components/home/cta-band";
import { FaqAccordion } from "@/components/home/faq-accordion";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { InteriorsShowcase } from "@/components/home/interiors-showcase";
import { Intro } from "@/components/home/intro";
import { Neighborhood } from "@/components/home/neighborhood";
import { ResidencesPreview } from "@/components/home/residences-preview";
import { CookieNotice } from "@/components/legal/cookie-notice";
import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { getFaqs, getHomePage, getMediaByIds, getSiteSettings, getUnitCover, getUnits } from "@/lib/data";
import { COMPLEX_ID, HOME_DESCRIPTION, JsonLd, WEBSITE_ID, absoluteUrl, pageMetadata, postalAddressJsonLd } from "@/lib/seo";

// The title is the root layout's default; description is shared with the layout.
export const metadata: Metadata = pageMetadata({ description: HOME_DESCRIPTION, path: "/" });

export default async function HomePage() {
  const [home, site, units, faqs] = await Promise.all([getHomePage(), getSiteSettings(), getUnits(), getFaqs()]);
  const [[heroMedia], [introMedia], interiors, featureMedia] = await Promise.all([
    getMediaByIds([home.hero.mediaId]),
    getMediaByIds([home.intro.mediaId]),
    getMediaByIds(home.interiors.mediaIds),
    getMediaByIds(home.features.mediaIds),
  ]);
  // The ticker repeats facts already stated on the page (confirmed features, walk time, leasing).
  const walk = home.intro.stats.find((st) => st.value !== null && st.suffix);
  const marqueeItems = [
    ...home.features.items.filter((f) => f.confirmed).map((f) => f.title),
    ...(walk ? [`${walk.prefix ?? ""}${walk.value}${walk.suffix} ${walk.label.charAt(0).toLowerCase()}${walk.label.slice(1)}`] : []),
    ...(site.leasingBanner.enabled ? [site.leasingBanner.text] : []),
  ];
  const covers = Object.fromEntries(await Promise.all(units.map(async (u) => [u.slug, await getUnitCover(u.slug)])));

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.legalName,
    url: absoluteUrl("/"),
    about: { "@id": COMPLEX_ID },
  };

  const complexJsonLd = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    "@id": COMPLEX_ID,
    name: site.legalName,
    url: absoluteUrl("/"),
    hasMap: site.googleMapsUrl,
    tourBookingPage: absoluteUrl("/contact"),
    ...(site.social.length > 0 && { sameAs: site.social.map((s) => s.href) }),
    description:
      "Five furnished 3–5 bedroom apartments in University Park, Los Angeles, about a 5-minute walk to USC. Every bedroom has a private bathroom; in-unit washer and dryer.",
    image: absoluteUrl(heroMedia.src),
    address: postalAddressJsonLd(site),
    ...(site.geo && { geo: { "@type": "GeoCoordinates", latitude: site.geo.latitude, longitude: site.geo.longitude } }),
    ...(site.phone && { telephone: site.phone }),
    numberOfAccommodationUnits: units.length,
    amenityFeature: home.features.items
      .filter((f) => f.confirmed)
      .map((f) => ({ "@type": "LocationFeatureSpecification", name: f.title, value: true })),
    containsPlace: units.map((u) => ({
      "@type": "Apartment",
      name: u.displayName,
      "@id": `${absoluteUrl(`/residences/${u.slug}`)}#apartment`,
      url: absoluteUrl(`/residences/${u.slug}`),
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <JsonLd data={[websiteJsonLd, complexJsonLd, faqJsonLd]} />
      <CookieNotice />
      <Hero hero={home.hero} media={heroMedia} site={site} />
      <Marquee items={marqueeItems} />
      <Intro intro={home.intro} media={introMedia} />
      <ResidencesPreview content={home.residences} units={units} covers={covers} />
      <InteriorsShowcase content={home.interiors} items={interiors} />
      <Neighborhood content={home.neighborhood} site={site} />
      <Features content={home.features} media={featureMedia} />

      <section aria-labelledby="faq-heading" className="section-y border-t border-ink/10 bg-sand/40">
        <div className="container-site grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-terracotta">{home.faq.eyebrow}</p>
            <h2 id="faq-heading" data-split className="mt-4 text-display">
              {home.faq.heading}
            </h2>
          </Reveal>
          <div className="lg:col-span-8">
            <FaqAccordion faqs={faqs} />
          </div>
        </div>
      </section>

      <CtaBand heading={home.cta.heading} body={home.cta.body} />
    </>
  );
}
