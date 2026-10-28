import type Lenis from "lenis";

/**
 * Motion tokens. The CSS equivalents live in globals.css (--ease-entrance,
 * --dur-micro, …) so CSS and GSAP animations share one vocabulary.
 *
 *   Easing     entrance   cubic-bezier(0.22, 1, 0.36, 1)   things arriving
 *              transition cubic-bezier(0.65, 0, 0.35, 1)   things changing state
 *   Duration   micro  0.2s   hovers, presses
 *              ui     0.4s   menus, toggles, UI changes
 *              reveal 0.9s   section reveals (images 1.1s)
 *   Stagger    0.06s between grouped items
 */
export const EASE = { entrance: "entrance", transition: "transition" } as const;
export const DUR = { micro: 0.2, ui: 0.4, reveal: 0.9, image: 1.1 } as const;
export const STAGGER = 0.06;

export type MotionRuntime = typeof import("./motion-runtime");

let runtime: Promise<MotionRuntime> | null = null;

/** GSAP + ScrollTrigger + SplitText, loaded once, after hydration. */
export function loadMotion(): Promise<MotionRuntime> {
  runtime ??= import("./motion-runtime");
  return runtime;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Desktop-class pointer: custom cursor and magnetic effects only apply here. */
export function hasFinePointer() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Elements inside routes kept hidden by React <Activity> are skipped. */
export function isRendered(el: Element) {
  return el.getClientRects().length > 0;
}

// The shared Lenis instance (null when smooth scroll is off, e.g. reduced motion).
let lenis: Lenis | null = null;
export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
};
export const getLenis = () => lenis;
