import Link from "next/link";
import { cacheLife } from "next/cache";
import { EqualHousingLogo } from "@/components/brand/equal-housing-logo";
import { Wordmark } from "@/components/brand/wordmark";
import { getSiteSettings } from "@/lib/data";
import { NAV_ITEMS } from "./nav";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/fair-housing", label: "Fair Housing" },
];

export async function SiteFooter() {
  const [site, year] = await Promise.all([getSiteSettings(), currentYear()]);
  const { address } = site;

  return (
    <footer className="on-dark bg-dusk text-plaster">
      <div className="container-site grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Wordmark wordmark={site.wordmark} descriptor={site.descriptor} tone="dark" />
          <address className="mt-6 not-italic leading-relaxed text-mist">
            {address.street}
            <br />
            {address.city}, {address.region} {address.postalCode}
          </address>
          {(site.phone || site.email) && (
            <ul className="mt-4 space-y-1">
              {site.phone && (
                <li>
                  <a className="link-underline" href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}>
                    {site.phone}
                  </a>
                </li>
              )}
              {site.email && (
                <li>
                  <a className="link-underline" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <h2 className="eyebrow text-mist">Explore</h2>
          <ul className="mt-4 space-y-1">
            {[{ href: "/", label: "Home" }, ...NAV_ITEMS].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-8 items-center">
                  <span className="link-underline">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          {site.social.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-4">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className="link-underline" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <div className="md:col-span-4">
          <div className="flex items-start gap-4">
            <EqualHousingLogo className="size-12 shrink-0 text-plaster" />
            <div>
              <p className="font-semibold">Equal Housing Opportunity</p>
              <p className="mt-1 text-sm leading-relaxed text-mist">
                We are pledged to the letter and spirit of U.S. policy for the achievement of equal housing opportunity
                throughout the nation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-plaster/15">
        <div className="container-site flex flex-col gap-4 py-8 text-sm text-mist md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-2">
            <p>
              37th Street Housing is privately owned and is not affiliated with or endorsed by the University of
              Southern California.
            </p>
            <p>
              © {year} {site.legalName}. All rights reserved.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-6 items-center text-plaster">
                  <span className="link-underline">{l.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
