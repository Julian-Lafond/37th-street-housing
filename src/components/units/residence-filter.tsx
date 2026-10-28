"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Filter = "all" | number;

const FilterContext = createContext<Filter>("all");

/**
 * Bedroom filter chips (toggle buttons with aria-pressed) plus a live result
 * count. Cards are server-rendered and wrapped in <FilterableItem>.
 */
export function ResidenceFilter({
  bedroomCounts,
  total,
  children,
}: {
  /** Distinct bedroom counts, descending, e.g. [5, 4, 3]. */
  bedroomCounts: number[];
  /** Number of units per bedroom count, keyed by count. */
  total: Record<number, number>;
  children: ReactNode;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const all = Object.values(total).reduce((a, b) => a + b, 0);
  const shown = filter === "all" ? all : (total[filter] ?? 0);
  const options: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    ...bedroomCounts.map((n) => ({ value: n, label: `${n} bed` })),
  ];

  return (
    <FilterContext.Provider value={filter}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filter by bedrooms" className="flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={filter === o.value}
              onClick={() => setFilter(o.value)}
              className="min-h-11 rounded-full border border-ink/25 px-5 text-[0.9375rem] font-semibold transition-colors duration-(--dur-micro) hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-plaster"
            >
              {o.label}
            </button>
          ))}
        </div>
        <p role="status" className="text-sm font-semibold text-ink-soft">
          Showing {shown} of {all} residences
        </p>
      </div>
      {children}
    </FilterContext.Provider>
  );
}

export function FilterableItem({ bedrooms, children, className }: { bedrooms: number; children: ReactNode; className?: string }) {
  const filter = useContext(FilterContext);
  const hidden = filter !== "all" && filter !== bedrooms;
  return (
    <li className={className} hidden={hidden}>
      {children}
    </li>
  );
}
