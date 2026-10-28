import type { Unit } from "@/content/types";

/**
 * Renders a unit name with fraction glyphs visually ("1158 ¾") and a clear
 * spoken name for screen readers ("Apartment 1158 and three quarters").
 * Uses a visually-hidden span rather than aria-label, which many screen
 * readers ignore on non-interactive elements.
 */
export function UnitName({
  unit,
  variant = "display",
  className = "",
}: {
  unit: Pick<Unit, "displayName" | "shortName" | "accessibleName">;
  /** "display" = "Apt 1158 ¾", "short" = "1158 ¾" */
  variant?: "display" | "short";
  className?: string;
}) {
  const visual = variant === "short" ? unit.shortName : unit.displayName;
  return (
    <span className={className}>
      <span aria-hidden="true">{visual}</span>
      <span className="sr-only">{unit.accessibleName}</span>
    </span>
  );
}
