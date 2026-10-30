import type { CSSProperties, ReactNode } from "react";
import { SplitHeadline } from "@/components/motion/split-headline";

/**
 * Page title block. The title rises in line by line on load; supporting copy follows.
 * With `eyebrowInHeading`, the eyebrow becomes part of the H1 (for pages whose
 * eyebrow carries the search phrase); it looks the same either way.
 */
export function PageHeader({
  eyebrow,
  eyebrowInHeading = false,
  title,
  body,
  children,
}: {
  eyebrow: string;
  eyebrowInHeading?: boolean;
  title: string;
  body?: ReactNode;
  children?: ReactNode;
}) {
  const eyebrowClassName = "eyebrow load-rise text-terracotta";
  const eyebrowStyle = { "--d": -4 } as CSSProperties;
  return (
    <header className="container-site pb-[var(--space-block)] pt-14 md:pt-24">
      {eyebrowInHeading ? (
        <SplitHeadline
          kicker={eyebrow}
          kickerClassName={`${eyebrowClassName} mb-5`}
          kickerStyle={eyebrowStyle}
          className="max-w-5xl text-hero"
          segments={[{ text: title }]}
        />
      ) : (
        <>
          <p className={eyebrowClassName} style={eyebrowStyle}>
            {eyebrow}
          </p>
          <SplitHeadline className="mt-5 max-w-5xl text-hero" segments={[{ text: title }]} />
        </>
      )}
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
