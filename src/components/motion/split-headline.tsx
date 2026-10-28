import type { CSSProperties } from "react";

export interface HeadlineSegment {
  text: string;
  /** Rendered in the italic display face, e.g. the hero's "Miles from ordinary." */
  accent?: boolean;
  /** Start this segment on a new line. */
  block?: boolean;
}

/**
 * Page-load headline: each word rises from behind a mask, in reading order, so
 * the headline builds line by line. Pure CSS (see .mask-word in globals.css):
 * it starts at first paint, never waits for JavaScript, and follows the branded
 * intro via --intro-delay. Screen readers get the plain sentence once.
 */
export function SplitHeadline({
  segments,
  as: Heading = "h1",
  id,
  className = "",
  accentClassName = "",
  delay = 0,
}: {
  segments: HeadlineSegment[];
  as?: "h1" | "h2";
  id?: string;
  className?: string;
  accentClassName?: string;
  /** Extra start delay in seconds. */
  delay?: number;
}) {
  let index = 0;
  const full = segments.map((s) => s.text).join(" ");

  return (
    <Heading id={id} className={className} style={{ "--headline-delay": `${delay}s` } as CSSProperties}>
      <span className="sr-only">{full}</span>
      <span aria-hidden="true">
        {segments.map((segment, s) => {
          const words = segment.text.split(/\s+/).filter(Boolean);
          return (
            <span
              key={s}
              className={`${segment.accent ? `font-display-italic italic ${accentClassName}` : ""} ${segment.block ? "block" : ""}`}
            >
              {words.map((word, w) => (
                <span key={w}>
                  <span className="mask-word">
                    <span className="mask-word-inner" style={{ "--i": index++ } as CSSProperties}>
                      {word}
                    </span>
                  </span>
                  {w < words.length - 1 || (s < segments.length - 1 && !segments[s + 1].block) ? " " : null}
                </span>
              ))}
            </span>
          );
        })}
      </span>
    </Heading>
  );
}
