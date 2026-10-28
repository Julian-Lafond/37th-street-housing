"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Expand } from "lucide-react";
import { useState } from "react";
import type { MediaItem } from "@/content/types";
import { REPRESENTATIVE_NOTE } from "@/lib/copy";
// Loaded on first open so pages don't ship the viewer until someone uses it.
const Lightbox = dynamic(() => import("./lightbox").then((m) => m.Lightbox), { ssr: false });

// Repeating asymmetric rhythm on a 12-column grid: rows of 2, 3 and 2 photos.
// Aspect ratios are fixed per slot so nothing shifts while images load.
const ROWS = [
  ["md:col-span-7 aspect-[4/3]", "md:col-span-5 aspect-[4/3] md:aspect-auto"],
  ["md:col-span-4 aspect-[4/5]", "md:col-span-4 aspect-[4/5]", "md:col-span-4 aspect-[4/5]"],
  ["md:col-span-5 aspect-[4/3] md:aspect-auto", "md:col-span-7 aspect-[4/3]"],
];

/** Desktop slot classes; a short final row stretches to fill the grid instead of leaving a gap. */
function editorialSlots(count: number): string[] {
  if (count === 1) return ["md:col-span-8 aspect-[4/3]"];
  const slots: string[] = [];
  let row = 0;
  while (slots.length < count) {
    const pattern = ROWS[row % ROWS.length];
    const remaining = count - slots.length;
    if (remaining >= pattern.length) slots.push(...pattern);
    else if (remaining === 1) slots.push("md:col-span-12 aspect-[4/3] md:aspect-[16/7]");
    else slots.push(...Array.from({ length: remaining }, () => "md:col-span-6 aspect-[4/3]"));
    row++;
  }
  return slots;
}


export function GalleryGrid({
  items,
  label,
}: {
  items: MediaItem[];
  /** Accessible name for the list, e.g. "Interior photos". */
  label: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  // Stays mounted after the first open so closing can return focus to the thumbnail.
  const [opened, setOpened] = useState(false);
  const slots = editorialSlots(items.length);
  const isInterior = items.some((i) => i.category === "interior");

  return (
    <>
      <ul aria-label={label} className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4">
        {items.map((item, i) => {
          const slot = slots[i % slots.length];
          // On phones, every third photo spans both columns, and so does a last photo left without a partner.
          const mobileSpan = i % 3 === 0 || (i === items.length - 1 && i % 3 === 1) ? "col-span-2" : "";
          return (
            <li key={item.id} className={`relative ${mobileSpan} ${slot}`}>
              <button
                type="button"
                onClick={() => {
                  setOpened(true);
                  setIndex(i);
                }}
                aria-haspopup="dialog"
                data-image-reveal
                className="group absolute inset-0 overflow-hidden rounded-xl bg-sand"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 768px) 40vw, 50vw"
                  quality={70}
                  placeholder="blur"
                  blurDataURL={item.blurDataURL}
                  className="object-cover transition-transform duration-(--dur-reveal) ease-(--ease-entrance) group-hover:scale-[1.04]"
                  style={{ objectPosition: `${item.focalPoint.x}% ${item.focalPoint.y}%` }}
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-ink/70 to-transparent p-3 pt-10 text-left text-sm font-semibold text-plaster opacity-0 transition-opacity duration-(--dur-micro) group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100">
                  <span aria-hidden="true">{item.caption}</span>
                  <Expand aria-hidden="true" className="size-4 shrink-0" />
                </span>
                <span className="sr-only">, open larger view</span>
              </button>
            </li>
          );
        })}
      </ul>
      {opened && (
        <Lightbox
          items={items}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setIndex(null)}
          note={isInterior ? REPRESENTATIVE_NOTE : undefined}
        />
      )}
    </>
  );
}
