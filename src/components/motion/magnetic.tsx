"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { DUR, EASE, hasFinePointer, loadMotion, prefersReducedMotion } from "@/lib/motion";

/**
 * Primary CTAs lean gently toward the cursor and settle back on leave.
 * Fine pointers only; off under reduced motion.
 */
export function Magnetic({
  children,
  strength = 0.3,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    loadMotion().then(({ gsap }) => {
      if (cancelled) return;
      const xTo = gsap.quickTo(el, "x", { duration: DUR.ui, ease: EASE.entrance });
      const yTo = gsap.quickTo(el, "y", { duration: DUR.ui, ease: EASE.entrance });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * strength);
        yTo((e.clientY - r.top - r.height / 2) * strength);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      cleanup = () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
        gsap.set(el, { clearProps: "transform" });
      };
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}
