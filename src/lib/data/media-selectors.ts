import type { MediaItem, UnitSlug } from "@/content/types";

// Pure selection rules for the photo-assignment model, kept separate from data
// loading so they're unit-testable and survive the Phase 2 CMS swap unchanged.

const byOrder = (a: MediaItem, b: MediaItem) => a.order - b.order;

/** Photos that belong to the building-wide gallery. */
export function selectShared(items: MediaItem[]): MediaItem[] {
  return items.filter((m) => m.assignedTo === "shared").sort(byOrder);
}

/** Photos the owner has explicitly assigned to one apartment. */
export function selectForUnit(items: MediaItem[], slug: UnitSlug): MediaItem[] {
  return items.filter((m) => m.assignedTo === slug && m.kind === "image").sort(byOrder);
}

/** The unit's cover: the item flagged isCover, else its first assigned photo, else null. */
export function selectCover(items: MediaItem[], slug: UnitSlug): MediaItem | null {
  const assigned = selectForUnit(items, slug);
  return assigned.find((m) => m.isCover) ?? assigned[0] ?? null;
}
