import { Info } from "lucide-react";
import { REPRESENTATIVE_NOTE } from "@/lib/copy";

export function RepresentativeNote({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <p className={`flex items-start gap-2 text-sm ${tone === "dark" ? "text-mist" : "text-ink-soft"} ${className}`}>
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{REPRESENTATIVE_NOTE}</span>
    </p>
  );
}
