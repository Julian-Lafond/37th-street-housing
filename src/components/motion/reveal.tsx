import type { CSSProperties, ReactNode } from "react";

type Tag = "div" | "li" | "section" | "article" | "figure";

/**
 * Fade/slide-up on scroll into view. Server-rendered markup plus CSS; one
 * shared observer (RevealObserver in the root layout) flips data-revealed.
 * Content stays visible without JavaScript. Never use on the hero/LCP.
 */
export function Reveal({
  children,
  delay = 0,
  as: Component = "div",
  className,
}: {
  children: ReactNode;
  /** Seconds. Use small steps (0.06–0.1) for staggered groups. */
  delay?: number;
  as?: Tag;
  className?: string;
}) {
  return (
    <Component data-reveal="" className={className} style={{ "--reveal-delay": `${delay}s` } as CSSProperties}>
      {children}
    </Component>
  );
}
