import type { Metadata } from "next";
import Link from "next/link";
import { InquiryForm, type UnitOption } from "@/components/contact/inquiry-form";
import { MapFacade } from "@/components/map/map-facade";
import { PageHeader } from "@/components/ui/page-header";
import { getSiteSettings, getUnits } from "@/lib/data";
import { isServiceConfigured } from "@/lib/supabase/service";
import { advertisedMonthlyPrice, formatCurrency } from "@/lib/pricing";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Inquire About Apartments Near USC",
  description:
    "Ask about a furnished 3, 4 or 5-bedroom apartment near USC in University Park, Los Angeles. Send an inquiry and we’ll follow up with availability.",
  path: "/contact",
});

export default async function ContactPage() {
  const [site, units] = await Promise.all([getSiteSettings(), getUnits()]);
  const addressLine = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;

  const options: UnitOption[] = units.map((u) => {
    const price = advertisedMonthlyPrice(u);
    const priceText = price === null ? "price on request" : `${formatCurrency(price)}/mo`;
    return {
      slug: u.slug,
      name: u.displayName,
      label: `${u.displayName} · ${u.bedrooms} bed / ${u.bathrooms} bath · ${priceText}`,
      accessibleLabel: `${u.accessibleName}, ${u.bedrooms} bedrooms, ${u.bathrooms} bathrooms, ${price === null ? "price on request" : `${formatCurrency(price)} per month`}`,
    };
  });

  const details = [
    { label: "Address", value: addressLine, href: null },
    site.phone && { label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/[^\d+]/g, "")}` },
    site.email && { label: "Email", value: site.email, href: `mailto:${site.email}` },
    site.officeHours && { label: "Office hours", value: site.officeHours, href: null },
    site.tourHours && { label: "Tours", value: site.tourHours, href: null },
  ].filter(Boolean) as { label: string; value: string; href: string | null }[];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <PageHeader
        eyebrow="Contact · Leasing August 2027"
        title="Let’s talk about your next place."
        body="Tell us which apartment you’re interested in and how to reach you. We’ll follow up with availability and next steps."
      />

      <div className="container-site grid gap-14 pb-[var(--space-section)] lg:grid-cols-12 lg:gap-16">
        <section aria-labelledby="form-heading" className="lg:col-span-7">
          <h2 id="form-heading" className="sr-only">
            Inquiry form
          </h2>
          <InquiryForm units={options} contact={{ email: site.email, phone: site.phone, addressLine }} backend={isServiceConfigured()} />
        </section>

        <aside aria-labelledby="details-heading" className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <h2 id="details-heading" data-split className="text-title">
              Find us
            </h2>
            <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
              {details.map((d) => (
                <div key={d.label} className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                  <dt className="text-sm font-bold uppercase tracking-wider text-ink-soft">{d.label}</dt>
                  <dd>
                    {d.href ? (
                      <a href={d.href} className="link-underline font-semibold text-terracotta">
                        {d.value}
                      </a>
                    ) : (
                      d.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <MapFacade className="mt-8" embedUrl={site.mapEmbedUrl} mapsUrl={site.googleMapsUrl} addressLine={addressLine} />
            <p className="mt-6 text-sm text-ink-soft">
              Need a reasonable accommodation or information in another format? See our{" "}
              <Link href="/fair-housing" className="font-semibold text-terracotta underline">
                Fair Housing
              </Link>{" "}
              and{" "}
              <Link href="/accessibility" className="font-semibold text-terracotta underline">
                Accessibility
              </Link>{" "}
              pages.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
