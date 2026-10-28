import type { SiteSettings, Unit } from "@/content/types";
import { advertisedMonthlyPrice } from "./pricing";

export const SITE_URL = "https://37thstreethousing.com";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
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
