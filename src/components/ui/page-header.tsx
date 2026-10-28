import type { CSSProperties, ReactNode } from "react";
import { SplitHeadline } from "@/components/motion/split-headline";

/** Page title block. The title rises in line by line on load; supporting copy follows. */
export function PageHeader({ eyebrow, title, body, children }: { eyebrow: string; title: string; body?: ReactNode; children?: ReactNode }) {
  return (
    <header className="container-site pb-[var(--space-block)] pt-14 md:pt-24">
      <p className="eyebrow load-rise text-terracotta" style={{ "--d": -4 } as CSSProperties}>
        {eyebrow}
      </p>
      <SplitHeadline className="mt-5 max-w-5xl text-hero" segments={[{ text: title }]} />
      {body && (
        <div className="load-rise mt-7 max-w-[60ch] text-lede text-ink-soft" style={{ "--d": 0 } as CSSProperties}>
          {body}
        </div>
      )}
      {children && (
        <div className="load-rise" style={{ "--d": 1 } as CSSProperties}>
          {children}
        </div>
      )}
    </header>
  );
}
