import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileInquireBar } from "@/components/layout/mobile-inquire-bar";
import { Intro } from "@/components/motion/intro";
import { MotionDirector } from "@/components/motion/motion-director";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { getSiteSettings } from "@/lib/data";

/** Header, footer, intro and motion system for every public page (not /admin). */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const site = await getSiteSettings();
  const addressLine = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;

  return (
    <>
      <Intro wordmark={site.wordmark} />
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-5 py-3 font-semibold text-plaster focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <SiteHeader wordmark={site.wordmark} descriptor={site.descriptor} addressLine={addressLine} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
      {/* Room for the sticky mobile Inquire bar so it never covers the footer. */}
      <div aria-hidden="true" className="h-[4.75rem] bg-dusk md:hidden" />
      <MobileInquireBar
        leasingText={site.leasingBanner.enabled ? site.leasingBanner.text : "37th Street Housing"}
        phone={site.phone}
      />
      <SmoothScroll />
      <MotionDirector />
    </>
  );
}
