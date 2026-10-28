import Image from "next/image";
import type { HomePageContent, MediaItem } from "@/content/types";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { RepresentativeNote } from "@/components/ui/representative-note";

export function Intro({ intro, media }: { intro: HomePageContent["intro"]; media: MediaItem }) {
  return (
    <section aria-labelledby="intro-heading" className="section-y">
      <div className="container-site">
        <div className="grid gap-8 md:grid-cols-12 md:gap-10">
          <Reveal className="md:col-span-5">
            <p className="eyebrow text-terracotta">{intro.eyebrow}</p>
            <h2 id="intro-heading" data-split className="mt-4 text-display">
              {intro.heading}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5 text-lede text-ink-soft md:col-span-6 md:col-start-7 md:pt-10">
            {intro.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>
        </div>

        <figure className="mt-[var(--space-block)]">
          <div data-image-reveal className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand sm:aspect-[16/8]">
            <div data-parallax="7" className="absolute -inset-y-[9%] inset-x-0">
              <Image
                src={media.src}
                alt={media.alt}
                fill
                sizes="(min-width: 1280px) 1200px, 100vw"
                quality={70}
                placeholder="blur"
                blurDataURL={media.blurDataURL}
                className="object-cover"
                style={{ objectPosition: `${media.focalPoint.x}% ${media.focalPoint.y}%` }}
              />
            </div>
          </div>
          <figcaption className="mt-3">
            <RepresentativeNote />
          </figcaption>
        </figure>

        <ul
          aria-label="Key facts"
          className="mt-14 grid grid-cols-2 border-t border-ink/15 sm:grid-cols-3 lg:grid-cols-6"
        >
          {intro.stats.map((stat, i) => (
            <Reveal
              as="li"
              key={stat.label}
              delay={i * 0.06}
              className="border-b border-ink/15 py-6 pr-4 sm:border-r sm:px-5 sm:first:pl-0 lg:border-b-0 lg:last:border-r-0"
            >
              <p
                className="font-display text-[2.5rem] leading-none tracking-tight"
                style={{ fontVariationSettings: '"opsz" 144' }}
              >
                {stat.value !== null ? (
                  <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                ) : (
                  stat.text
                )}
              </p>
              <p className="mt-2 text-sm font-semibold text-ink-soft">{stat.label}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
