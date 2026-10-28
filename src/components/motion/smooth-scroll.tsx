"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { loadMotion, prefersReducedMotion, setLenis } from "@/lib/motion";

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis
 * share one frame loop. Both load after hydration. Off under reduced motion
 * (native scrolling instead). Touch devices keep native scrolling (Lenis only
 * smooths wheel input).
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    Promise.all([loadMotion(), import("lenis")]).then(([{ gsap, ScrollTrigger }, { default: Lenis }]) => {
      if (cancelled) return;
      const lenis = new Lenis({
        // Light smoothing that tracks the wheel closely (higher = snappier; 1 = native).
        lerp: 0.2,
        // Same-page anchor links scroll smoothly and clear the sticky header.
        anchors: { offset: -96 },
        // Modal dialogs (menu, lightbox) and anything marked data-lenis-prevent scroll natively.
        prevent: (node) => Boolean(node.closest("dialog, [data-lenis-prevent]")),
        autoRaf: false,
      });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Freeze smooth scrolling while a modal dialog is open.
      const observer = new MutationObserver(() => {
        if (document.querySelector("dialog[open]")) lenis.stop();
        else lenis.start();
      });
      observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });

      cleanup = () => {
        observer.disconnect();
        gsap.ticker.remove(tick);
        lenis.destroy();
        setLenis(null);
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  // After client navigation, re-measure page height and trigger positions.
  useEffect(() => {
    let id = 0;
    loadMotion().then(({ ScrollTrigger }) => {
      id = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
