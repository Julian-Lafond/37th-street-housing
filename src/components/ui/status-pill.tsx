import type { UnitStatus } from "@/content/types";

const labels: Record<UnitStatus, string> = {
  available: "Available",
  limited: "Limited availability",
  waitlist: "Waitlist",
  leased: "Leased",
};

const dots: Record<UnitStatus, string> = {
  available: "bg-eucalyptus",
  limited: "bg-sunset",
  waitlist: "bg-jacaranda",
  leased: "bg-ink-soft",
};

/** Status is always spelled out in text; the dot is decoration, never the only signal. */
export function StatusPill({ status, className = "" }: { status: UnitStatus; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-ink/15 bg-plaster/70 px-3 py-1 text-[0.8125rem] font-semibold text-ink ${className}`}
    >
      <span aria-hidden="true" className={`size-2 rounded-full ${dots[status]}`} />
      {labels[status]}
    </span>
  );
}
