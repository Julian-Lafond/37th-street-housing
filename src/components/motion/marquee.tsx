"use client";

import { useEffect, useRef } from "react";
import { loadMotion, prefersReducedMotion } from "@/lib/motion";

/**
 * Infinite ticker of facts already stated on the page. It drifts on its own,
 * speeds up with scroll velocity and reverses with scroll direction, then
 * eases back to cruising speed. Decorative (aria-hidden): the same facts are
 * in the page content. Static under reduced motion.
 */
export function Marquee({ items }: { items: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    loadMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      // Two identical halves: moving by -50% loops seamlessly.
      const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
      const settle = gsap.quickTo(loop, "timeScale", { duration: 0.8, ease: "transition" });
      const trigger = ScrollTrigger.create({
        trigger: track,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = Math.min(Math.abs(self.getVelocity()) / 250, 6);
          loop.timeScale(self.direction * (1 + boost));
          settle(self.direction);
        },
      });
      cleanup = () => {
        trigger.kill();
        loop.kill();
        gsap.set(track, { clearProps: "transform" });
      };
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const half = (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap px-6 font-display text-[clamp(2rem,1.4rem+2.4vw,3.75rem)] leading-none tracking-[-0.02em] md:px-10">
            {item}
          </span>
          <svg viewBox="0 0 20 20" className="size-4 shrink-0 md:size-5">
            <circle cx="10" cy="10" r="7" className="fill-sunset" />
          </svg>
        </span>
      ))}
    </div>
  );

  return (
    <div aria-hidden="true" className="overflow-hidden border-y border-ink/12 py-6 select-none md:py-8">
      <div ref={trackRef} className="flex w-max will-change-transform">
        {half}
        {half}
      </div>
    </div>
  );
}
