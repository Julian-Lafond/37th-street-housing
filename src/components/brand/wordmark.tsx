export function Wordmark({
  wordmark,
  descriptor,
  tone = "light",
  className = "",
}: {
  wordmark: string;
  descriptor: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const sub = tone === "dark" ? "text-mist" : "text-ink-soft";
  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap ${className}`}>
      {/* A low sun over a horizon line. Decorative. */}
      <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8 shrink-0">
        <circle cx="16" cy="17" r="8" className="fill-sunset" />
        <rect x="3" y="20" width="26" height="9" className={tone === "dark" ? "fill-dusk" : "fill-plaster"} />
        <path d="M4 20.5h24M8 24.5h16" className={tone === "dark" ? "stroke-plaster" : "stroke-ink"} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.375rem] tracking-[-0.01em]" style={{ fontVariationSettings: '"opsz" 72' }}>
          {wordmark}
        </span>
        <span className={`mt-1 text-[0.625rem] font-bold uppercase tracking-[0.2em] ${sub}`}>{descriptor}</span>
      </span>
    </span>
  );
}
