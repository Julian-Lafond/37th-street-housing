"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { DUR, EASE, STAGGER, isRendered, loadMotion, prefersReducedMotion } from "@/lib/motion";
import type { MotionRuntime } from "@/lib/motion";

/**
 * Scroll choreography for the whole site, driven by data attributes so server
 * components stay plain markup (and fully visible without JavaScript):
 *
 *   data-split          heading reveals line by line, each line rising from a mask
 *   data-reveal         fade + rise; siblings entering together stagger
 *   data-image-reveal   clip-path wipe upward while the inner image settles from 1.15 to 1
 *   data-parallax="8"   inner layer drifts ±8% of its height (layer must be oversized)
 *
 * Every reveal plays once. Anything already on screen when the page loads is
 * left as-is so nothing flickers. Reduced motion: fades only, no parallax.
 */
export function MotionDirector() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = prefersReducedMotion();
    const splits: InstanceType<MotionRuntime["SplitText"]>[] = [];
    let ctx: ReturnType<MotionRuntime["gsap"]["context"]> | null = null;
    let cancelled = false;

    const offscreen = (el: Element) => isRendered(el) && el.getBoundingClientRect().top > window.innerHeight * 0.92;
    const pending = (selector: string) =>
      Array.from(document.querySelectorAll<HTMLElement>(selector)).filter((el) => isRendered(el));

    // GSAP loads after hydration; line breaks depend on the display font, so split after fonts load.
    Promise.all([loadMotion(), document.fonts.ready]).then(([{ gsap, ScrollTrigger, SplitText }]) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        // Headings: masked line reveals.
        for (const el of pending("[data-split]").filter(offscreen)) {
          if (reduce) {
            gsap.from(el, {
              opacity: 0,
              duration: DUR.reveal,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            });
            continue;
          }
          const split = SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            aria: "auto",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: DUR.reveal,
                stagger: STAGGER * 1.5,
                ease: EASE.entrance,
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              }),
          });
          splits.push(split);
        }

        // Generic fade + rise, batched so groups stagger together.
        const reveals = pending("[data-reveal]").filter(offscreen);
        if (reveals.length) {
          for (const el of reveals) {
            // Wrappers of split headings only fade, so the lines do the moving.
            const lift = reduce || el.querySelector("[data-split]") ? 0 : 32;
            gsap.set(el, { opacity: 0, y: lift });
          }
          ScrollTrigger.batch(reveals, {
            start: "top 90%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: DUR.reveal,
                stagger: STAGGER,
                ease: EASE.entrance,
                overwrite: true,
              }),
          });
        }

        // Images: clip-path wipe + settle.
        const images = pending("[data-image-reveal]").filter(offscreen);
        for (const el of images) {
          const inner = el.querySelector("img");
          if (reduce) {
            gsap.from(el, {
              opacity: 0,
              duration: DUR.reveal,
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            });
            continue;
          }
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%", once: true } });
          tl.fromTo(
            el,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.image, ease: EASE.transition, clearProps: "clipPath" },
          );
          if (inner)
            tl.fromTo(
              inner,
              { scale: 1.15 },
              { scale: 1, duration: DUR.image * 1.2, ease: EASE.entrance, clearProps: "scale" },
              0,
            );
        }

        // Parallax layers.
        if (!reduce) {
          for (const el of pending("[data-parallax]")) {
            const amount = Number(el.dataset.parallax) || 8;
            gsap.fromTo(
              el,
              { yPercent: -amount },
              {
                yPercent: amount,
                ease: "none", // mapped 1:1 to scroll position; Lenis supplies the smoothing
                scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
              },
            );
          }
        }
      });
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      splits.forEach((s) => s.revert());
      ctx?.revert();
    };
  }, [pathname]);

  return null;
}
