"use client";

import Image from "next/image";
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { MediaItem } from "@/content/types";

/**
 * Modal image viewer on a native <dialog>: the rest of the page is inert,
 * focus starts on Close, Esc closes, arrow keys and swipes navigate, and focus
 * returns to the thumbnail that opened it.
 */
export function Lightbox({
  items,
  index,
  onIndexChange,
  onClose,
  note,
}: {
  items: MediaItem[];
  /** null = closed */
  index: number | null;
  onIndexChange: (i: number) => void;
  onClose: () => void;
  note?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const pointerStart = useRef<number | null>(null);
  const [direction, setDirection] = useState(0);
  const reduce = useReducedMotion();
  const open = index !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const go = (delta: number) => {
    if (index === null) return;
    setDirection(delta);
    onIndexChange((index + delta + items.length) % items.length);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") pointerStart.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (pointerStart.current === null) return;
    const dx = e.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  const item = index !== null ? items[index] : null;
  const offset = reduce ? 0 : 48;
  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * offset }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -offset }),
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <dialog
          ref={dialogRef}
          aria-label="Photo viewer"
          onClose={() => {
            onClose();
            returnFocusRef.current?.focus();
          }}
          onKeyDown={onKeyDown}
          className="on-dark m-0 h-dvh max-h-none w-full max-w-none bg-ink/95 p-0 text-plaster backdrop:bg-ink/80 open:animate-[menu-in_300ms_var(--ease-soft)]"
        >
          {item && index !== null && (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <p className="text-sm font-semibold tabular-nums" aria-live="polite" aria-atomic="true">
                  <span className="sr-only">Photo </span>
                  {index + 1} of {items.length}
                  <span className="sr-only">: {item.alt}</span>
                </p>
                <button
                  type="button"
                  autoFocus
                  onClick={() => dialogRef.current?.close()}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-plaster/40 px-4 text-[0.9375rem] font-semibold hover:bg-plaster hover:text-ink"
                >
                  <X aria-hidden="true" className="size-5" />
                  Close
                </button>
              </div>

              <div
                className="relative flex-1 touch-pan-y select-none overflow-hidden"
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
              >
                <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                  <m.figure
                    key={item.id}
                    className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-20"
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="relative h-full max-h-[78dvh] w-full">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="100vw"
                        quality={80}
                        placeholder="blur"
                        blurDataURL={item.blurDataURL}
                        className="object-contain"
                      />
                    </div>
                    {item.caption && (
                      <figcaption className="mt-3 text-center text-sm text-mist">{item.caption}</figcaption>
                    )}
                  </m.figure>
                </AnimatePresence>

                {items.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      className="absolute left-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 hover:bg-plaster hover:text-ink sm:left-4"
                    >
                      <ChevronLeft aria-hidden="true" className="size-6" />
                      <span className="sr-only">Previous photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      className="absolute right-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 hover:bg-plaster hover:text-ink sm:right-4"
                    >
                      <ChevronRight aria-hidden="true" className="size-6" />
                      <span className="sr-only">Next photo</span>
                    </button>
                  </>
                )}
              </div>

              {note && (
                <p className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 text-center text-xs text-mist">
                  {note}
                </p>
              )}
            </div>
          )}
        </dialog>
      </MotionConfig>
    </LazyMotion>
  );
}
