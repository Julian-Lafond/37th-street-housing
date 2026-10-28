import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import type { HomePageContent, MediaItem, SiteSettings } from "@/content/types";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitHeadline } from "@/components/motion/split-headline";
import { buttonClasses } from "@/components/ui/button";

/**
 * Phones: full-bleed photo with the headline over a bottom gradient; the rest
 * of the copy follows on plaster.
 * Desktop: the headline runs the full width at display size, the photo bleeds
 * off the right edge below it, and the supporting copy anchors the bottom left.
 * `lg:contents` lets the photo and headline become grid items on desktop.
 *
 * Load sequence (CSS, follows the intro): headline words rise line by line,
 * then subline → leasing pill → CTAs in a 60ms stagger. The photo settles
 * from 1.12 and drifts with scroll (data-parallax).
 */
export function Hero({ hero, media, site }: { hero: HomePageContent["hero"]; media: MediaItem; site: SiteSettings }) {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden">
      <div className="lg:container-site lg:grid lg:grid-cols-12 lg:gap-x-10 lg:pb-[var(--space-block)] lg:pt-10">
        <div className="relative lg:contents">
          {/* Photo */}
          <div className="relative h-[68svh] max-h-[44rem] min-h-[26rem] overflow-hidden lg:col-span-7 lg:col-start-6 lg:row-start-2 lg:-mr-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] lg:mt-10 lg:h-[min(70vh,44rem)] lg:min-h-[28rem] lg:rounded-l-[2rem] lg:rounded-tl-[7rem]">
            <div data-parallax="6" className="absolute -inset-y-[8%] inset-x-0">
              <div className="hero-zoom absolute inset-0">
                <Image
                  src={media.src}
                  alt={media.alt}
                  fill
                  preload
                  quality={80}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  placeholder="blur"
                  blurDataURL={media.blurDataURL}
                  className="object-cover"
                  style={{ objectPosition: `${media.focalPoint.x}% ${media.focalPoint.y}%` }}
                />
              </div>
            </div>
            {/* Legibility gradient behind the headline (phones only) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/70 via-40% to-transparent to-70% lg:hidden"
            />
            {/* Golden-hour edge */}
            <div
              aria-hidden="true"
              className="bg-golden absolute inset-x-0 bottom-0 h-1.5 opacity-90 lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-2"
            />
          </div>

          {/* Headline: over the photo on phones, full width on desktop */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-8 text-plaster sm:px-6 lg:static lg:col-span-12 lg:row-start-1 lg:p-0 lg:text-ink">
            <p className="eyebrow load-rise text-plaster lg:text-terracotta" style={{ "--d": -4 } as CSSProperties}>
              {hero.eyebrow}
            </p>
            <SplitHeadline
              id="hero-heading"
              className="mt-5 max-w-[16ch] text-mega lg:max-w-none"
              accentClassName="text-peach lg:text-terracotta"
              segments={[{ text: hero.headline }, { text: hero.headlineAccent, accent: true, block: true }]}
            />
          </div>
        </div>

        {/* Supporting copy */}
        <div className="px-4 pb-14 pt-8 sm:px-6 lg:col-span-5 lg:row-start-2 lg:self-start lg:p-0 lg:pt-16">
          <p className="load-rise max-w-[34rem] text-lede text-ink-soft" style={{ "--d": 0 } as CSSProperties}>
            {hero.subline}
          </p>

          <div className="load-rise mt-6 flex flex-wrap items-center gap-x-4 gap-y-3" style={{ "--d": 1 } as CSSProperties}>
            {site.leasingBanner.enabled && (
              <p className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-sand px-3.5 py-1.5 text-sm font-semibold">
                <span aria-hidden="true" className="size-2 animate-[pulse-dot_2.4s_var(--ease-transition)_infinite] rounded-full bg-sunset" />
                {site.leasingBanner.text}
              </p>
            )}
            <address className="text-sm not-italic text-ink-soft">
              {site.address.street}, {site.address.city}
            </address>
          </div>

          <div className="load-rise mt-8 flex flex-wrap gap-3" style={{ "--d": 2 } as CSSProperties}>
            <Magnetic>
              <Link href="/residences" className={buttonClasses("primary", "lg")}>
                View residences
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-(--dur-micro) ease-(--ease-transition) group-hover:translate-x-1"
                />
              </Link>
            </Magnetic>
            <Link href="/contact" className={buttonClasses("secondary", "lg")}>
              Inquire
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
