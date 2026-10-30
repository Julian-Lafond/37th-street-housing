import type { Metadata } from "next";
import type { SiteSettings, Unit } from "@/content/types";
import { advertisedMonthlyPrice, formatAvailability, formatCurrency } from "./pricing";

export const SITE_URL = "https://37thstreethousing.com";

export const SITE_NAME = "37th Street Housing";
export const HOME_TITLE = "Furnished Apartments Near USC | 37th Street Housing";
export const HOME_DESCRIPTION =
  "Five furnished 3–5 bedroom apartments in University Park, Los Angeles, about a 5-minute walk to USC. A private bath for every bedroom. Inquire today.";

/** Stable IDs so the building, its apartments and the website link up in Google's knowledge graph. */
export const COMPLEX_ID = `${SITE_URL}/#apartment-complex`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

/** The site-wide share image (src/app/opengraph-image.tsx). */
export const DEFAULT_SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "37th Street Housing: furnished 3–5 bedroom apartments near USC",
};

/**
 * Title, description, canonical and share tags for one page. A page's own
 * openGraph object replaces the root layout's instead of merging with it, so
 * every page sets the full set here (otherwise og:url, og:type, og:site_name
 * and the share image go missing). Pages with their own opengraph-image file
 * pass `ownShareImage` so that file is used instead of the default. `title` is
 * the keyword part; the layout adds " | 37th Street Housing".
 * Aim for titles under 60 characters in total and descriptions under 155.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  ownShareImage = false,
}: {
  title?: string;
  description: string;
  path: string;
  type?: "website" | "article";
  ownShareImage?: boolean;
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : undefined;
  const images = ownShareImage ? {} : { images: [DEFAULT_SHARE_IMAGE] };
  return {
    ...(title && { title }),
    description,
    alternates: { canonical: path },
    openGraph: {
      ...(fullTitle && { title: fullTitle }),
      description,
      url: path,
      type,
      siteName: SITE_NAME,
      locale: "en_US",
      ...images,
    },
    twitter: { card: "summary_large_image", ...(fullTitle && { title: fullTitle }), description, ...images },
  };
}

/** Renders JSON-LD safely: `<` is escaped so content can't break out of the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function postalAddressJsonLd(site: SiteSettings) {
  return {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  };
}

export function unitOfferJsonLd(unit: Unit) {
  const price = advertisedMonthlyPrice(unit);
  if (price === null) return undefined;
  return {
    "@type": "Offer",
    price,
    priceCurrency: "USD",
    availability: unit.status === "leased" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    availabilityStarts: unit.availableFrom,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price,
      priceCurrency: "USD",
      unitCode: "MON",
      referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
    },
    url: absoluteUrl(`/residences/${unit.slug}`),
  };
}

type UnitSeoFields = Pick<
  Unit,
  | "displayName"
  | "bedrooms"
  | "bathrooms"
  | "squareFeet"
  | "furnished"
  | "inUnitLaundry"
  | "status"
  | "availableFrom"
  | "pricingMode"
  | "monthlyRent"
  | "mandatoryFees"
  | "seo"
>;

/**
 * Search title and description for an apartment page. The owner's SEO fields
 * in /admin win when filled in; left blank, they're built from the apartment's
 * live details, so the price in Google (which includes mandatory fees) never
 * goes stale when rent changes.
 */
export function unitSeo(unit: UnitSeoFields): { title: string; description: string } {
  const title = unit.seo.title.trim() || `${unit.displayName}: ${unit.bedrooms}-Bed${unit.furnished ? " Furnished" : " Apartment"} Near USC`;

  const price = advertisedMonthlyPrice(unit);
  const features = [
    `${unit.bedrooms} bedrooms`,
    `${unit.bathrooms}${unit.bathrooms >= unit.bedrooms ? " private" : ""} baths`,
    `${unit.squareFeet.toLocaleString("en-US")} sq ft`,
    unit.furnished && "furnished",
    unit.inUnitLaundry && "in-unit laundry",
  ].filter(Boolean);
  const availability =
    unit.status === "leased"
      ? "Currently leased; ask about future openings."
      : `${price === null ? "Rent on request" : `${formatCurrency(price)}/month`}, available ${formatAvailability(unit.availableFrom)}. Inquire today.`;
  const description = unit.seo.description.trim() || `${features.join(", ")}, near USC in University Park. ${availability}`;

  return { title, description };
}
