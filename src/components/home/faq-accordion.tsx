"use client";

import { Plus } from "lucide-react";
import { useId, useState } from "react";
import type { Faq } from "@/content/types";

/** WAI-ARIA APG accordion: heading > button[aria-expanded] controlling a labelled region. */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const base = useId();

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="divide-y divide-ink/12 border-y border-ink/12">
      {faqs.map((faq) => {
        const expanded = open.has(faq.id);
        const buttonId = `${base}-${faq.id}-button`;
        const panelId = `${base}-${faq.id}-panel`;
        return (
          <div key={faq.id}>
            <h3 className="font-sans" style={{ fontVariationSettings: "normal" }}>
              <button
                id={buttonId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(faq.id)}
                className="group flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left text-lg font-bold"
              >
                {faq.question}
                <span
                  aria-hidden="true"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-ink/20 transition-[transform,background-color] duration-(--dur-micro) group-hover:bg-sand group-aria-expanded:rotate-45"
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!expanded} className="pb-6 pr-14">
              <p className="max-w-[64ch] text-ink-soft">{faq.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
