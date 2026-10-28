"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { HomePageContent, MediaItem } from "@/content/types";
import { REPRESENTATIVE_NOTE } from "@/lib/copy";
import { RepresentativeNote } from "@/components/ui/representative-note";
import { getLenis, loadMotion } from "@/lib/motion";

const Lightbox = dynamic(() => import("@/components/gallery/lightbox").then((m) => m.Lightbox), { ssr: false });

// Alternating panel heights give the rail an editorial rhythm when pinned.
const PANEL_HEIGHTS = ["66dvh", "50dvh", "58dvh", "68dvh", "48dvh", "60dvh"];

/**
 * The signature moment: on desktop the section pins and the interiors glide
 * sideways as you scroll, each photo drifting inside its frame. Everywhere
 * else (phones, reduced motion, no JavaScript) it is a native swipeable
 * scroll-snap rail. The pinned layout is switched on by JS only, so the page
 * never overflows horizontally.
 */
export function InteriorsShowcase({ content, items }: { content: HomePageContent["interiors"]; items: MediaItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    let cancelled = false;
    let revert: (() => void) | undefined;
    loadMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia();
      revert = () => mm.revert();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        section.setAttribute("data-pinned", "");
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: "none", // scroll-mapped; Lenis provides the smoothing
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            // Pins must be measured before triggers further down the page (it may be created after them).
            refreshPriority: 1,
            scrub: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => gsap.set(progressRef.current, { scaleX: self.progress }),
          },
        });

        // Each photo drifts inside its frame for depth.
        track.querySelectorAll<HTMLElement>("[data-drift]").forEach((el) => {
          gsap.fromTo(
            el,
            { xPercent: -7 },
            {
              xPercent: 7,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement,
                containerAnimation: slide,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        // Keyboard: bring a focused panel into view by scrolling the page to it.
        const onFocus = (e: FocusEvent) => {
          const panel = (e.target as HTMLElement).closest<HTMLElement>("[data-panel]");
          const st = slide.scrollTrigger;
          if (!panel || !st) return;
          section.scrollLeft = 0;
          const progress = gsap.utils.clamp(0, 1, (panel.offsetLeft - window.innerWidth * 0.25) / (distance() || 1));
          const y = st.start + progress * (st.end - st.start);
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(y, { immediate: true });
          else window.scrollTo(0, y);
        };
        track.addEventListener("focusin", onFocus);
        requestAnimationFrame(() => ScrollTrigger.refresh());

        return () => {
          track.removeEventListener("focusin", onFocus);
          section.removeAttribute("data-pinned");
        };
      });
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="interiors-heading"
      className="group/show relative overflow-hidden section-y group-data-[pinned]/show:py-0"
    >
      <div className="group-data-[pinned]/show:flex group-data-[pinned]/show:h-dvh group-data-[pinned]/show:flex-col group-data-[pinned]/show:justify-center">
        <div
          ref={trackRef}
          className="group-data-[pinned]/show:flex group-data-[pinned]/show:h-[72dvh] group-data-[pinned]/show:w-max group-data-[pinned]/show:items-stretch group-data-[pinned]/show:gap-10 group-data-[pinned]/show:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] group-data-[pinned]/show:pr-[12vw] group-data-[pinned]/show:will-change-transform"
        >
          {/* Intro panel */}
          <div className="container-site mb-10 grid gap-6 md:grid-cols-12 md:items-end group-data-[pinned]/show:m-0! group-data-[pinned]/show:flex! group-data-[pinned]/show:w-[min(30rem,32vw)] group-data-[pinned]/show:max-w-none group-data-[pinned]/show:shrink-0 group-data-[pinned]/show:flex-col group-data-[pinned]/show:justify-center group-data-[pinned]/show:gap-0 group-data-[pinned]/show:px-0!">
            <div className="md:col-span-7">
              <p className="eyebrow text-terracotta">{content.eyebrow}</p>
              <h2 id="interiors-heading" data-split className="mt-4 text-display">
                {content.heading}
              </h2>
            </div>
            <div className="md:col-span-5 group-data-[pinned]/show:mt-6">
              <p className="text-lede text-ink-soft">{content.body}</p>
              <RepresentativeNote className="mt-4" />
              <p
                aria-hidden="true"
                className="eyebrow mt-8 hidden items-center gap-3 text-ink-soft group-data-[pinned]/show:flex"
              >
                Scroll to explore <ArrowRight className="size-4" />
              </p>
            </div>
          </div>

          {/* Rail */}
          <ul
            aria-label="Interior photos"
            className="scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:scroll-px-6 sm:px-6 lg:scroll-px-10 lg:px-10 group-data-[pinned]/show:contents"
          >
            {items.map((item, i) => (
              <li
                key={item.id}
                data-panel
                className={`flex w-[80vw] shrink-0 snap-start flex-col sm:w-[54vw] lg:w-[40vw] group-data-[pinned]/show:w-auto ${
                  i % 2 ? "group-data-[pinned]/show:justify-end" : "group-data-[pinned]/show:justify-start"
                }`}
                style={{ "--panel-h": PANEL_HEIGHTS[i % PANEL_HEIGHTS.length] } as CSSProperties}
              >
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => {
                    setOpened(true);
                    setIndex(i);
                  }}
                  className="group/img relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-sand group-data-[pinned]/show:h-(--panel-h) group-data-[pinned]/show:w-auto"
                >
                  <div data-drift className="absolute inset-y-0 -inset-x-[8%]">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 1024px) 60vw, 80vw"
                      quality={70}
                      placeholder="blur"
                      blurDataURL={item.blurDataURL}
                      className="object-cover transition-transform duration-(--dur-reveal) ease-(--ease-entrance) group-hover/img:scale-[1.04]"
                      style={{ objectPosition: `${item.focalPoint.x}% ${item.focalPoint.y}%` }}
                    />
                  </div>
                  <span className="sr-only">, open larger view</span>
                </button>
                <p className="mt-3 flex items-baseline gap-3 text-sm">
                  <span aria-hidden="true" className="font-display text-lg tabular-nums text-terracotta">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold text-ink-soft">{item.caption}</span>
                </p>
              </li>
            ))}
            <li
              data-panel
              className="flex w-[70vw] shrink-0 snap-start sm:w-[40vw] lg:w-[28vw] group-data-[pinned]/show:w-[22rem]"
            >
              <Link
                href="/gallery"
                className="on-dark group/end flex w-full flex-col justify-between rounded-2xl bg-dusk p-7 text-plaster transition-transform duration-(--dur-ui) ease-(--ease-entrance) hover:-translate-y-1 aspect-[4/5] group-data-[pinned]/show:aspect-auto group-data-[pinned]/show:h-[58dvh] group-data-[pinned]/show:self-center"
              >
                <span className="eyebrow text-sunset">Gallery</span>
                <span>
                  <span className="block font-display text-title">See the full gallery</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="mt-5 size-6 transition-transform duration-(--dur-ui) ease-(--ease-entrance) group-hover/end:translate-x-2"
                  />
                </span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Scroll progress (pinned only) */}
        <div aria-hidden="true" className="container-site mt-8 hidden group-data-[pinned]/show:block">
          <div className="h-px w-full bg-ink/15">
            <div ref={progressRef} className="h-px origin-left scale-x-0 bg-terracotta" />
          </div>
        </div>
      </div>

      {opened && (
        <Lightbox
          items={items}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setIndex(null)}
          note={REPRESENTATIVE_NOTE}
        />
      )}
    </section>
  );
}
