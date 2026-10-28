import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  heading,
  body,
  id,
  tone = "light",
  as: Heading = "h2",
  className = "",
  children,
}: {
  eyebrow: string;
  heading: ReactNode;
  body?: ReactNode;
  id?: string;
  tone?: "light" | "dark";
  as?: "h1" | "h2";
  className?: string;
  children?: ReactNode;
}) {
  const eyebrowColor = tone === "dark" ? "text-sunset" : "text-terracotta";
  const bodyColor = tone === "dark" ? "text-mist" : "text-ink-soft";
  return (
    <div className={className}>
      <p className={`eyebrow ${eyebrowColor}`}>{eyebrow}</p>
      <Heading id={id} className={`mt-4 ${Heading === "h1" ? "text-hero" : "text-display"}`}>
        {heading}
      </Heading>
      {body && <div className={`mt-5 max-w-[60ch] text-lede ${bodyColor}`}>{body}</div>}
      {children}
    </div>
  );
}
