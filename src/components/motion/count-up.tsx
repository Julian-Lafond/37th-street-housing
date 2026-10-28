"use client";

import { useEffect, useRef } from "react";
import { DUR, EASE, loadMotion, prefersReducedMotion } from "@/lib/motion";

/**
 * Counts from 0 to `value` once, when it scrolls into view. The real value is
 * always in the DOM (screen readers, no-JS); only the visible digits animate.
 * Skipped under reduced motion or if already on screen at load.
 */
export function CountUp({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion() || node.getBoundingClientRect().top < window.innerHeight) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    loadMotion().then(({ gsap }) => {
      if (cancelled) return;
      const counter = { v: 0 };
      const render = () => {
        node.textContent = `${prefix}${Math.round(counter.v)}${suffix}`;
      };
      render();
      const tween = gsap.to(counter, {
        v: value,
        duration: DUR.image,
        ease: EASE.entrance,
        onUpdate: render,
        scrollTrigger: { trigger: node, start: "top 90%", once: true },
      });
      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    return () => {
      cancelled = true;
      cleanup?.();
      node.textContent = `${prefix}${value}${suffix}`;
    };
  }, [value, prefix, suffix]);

  const final = `${prefix}${value}${suffix}`;
  return (
    <>
      <span ref={ref} aria-hidden="true">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </>
  );
}
