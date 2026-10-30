"use client";

import Link from "next/link";
import { useSyncExternalStore, type CSSProperties } from "react";
import { buttonClasses } from "@/components/ui/button";

export const COOKIE_NOTICE_KEY = "cookie-notice-dismissed";

const listeners = new Set<() => void>();
// Fallback for browsers that block storage, so "Got it" still closes the notice.
let dismissedThisPage = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isDismissed() {
  if (dismissedThisPage) return true;
  try {
    return localStorage.getItem(COOKIE_NOTICE_KEY) === "1";
  } catch {
    return false;
  }
}

function dismiss() {
  dismissedThisPage = true;
  try {
    localStorage.setItem(COOKIE_NOTICE_KEY, "1");
  } catch {}
  listeners.forEach((listener) => listener());
}

/**
 * Informational cookie notice on the home page, shown until dismissed.
 * The site sets no cookies for visitors, so this asks for nothing: it states
 * what the Privacy Policy says. Non-modal, so it never blocks the page.
 * Rendered after hydration only, so the prerendered HTML never includes it.
 * Sits above the mobile Inquire bar and between the desktop Inquire pill
 * (bottom-left) and the host's badge (bottom-right).
 */
export function CookieNotice() {
  // The server snapshot counts as dismissed, so the notice only renders in the browser.
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true);
  if (dismissed) return null;

  return (
    <aside
      aria-label="Cookie notice"
      style={{ "--d": 12 } as CSSProperties}
      className="load-rise fixed inset-x-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-2xl bg-ink p-5 text-plaster shadow-[0_18px_40px_-18px_rgba(27,31,29,0.55)] md:bottom-6"
    >
      <p className="text-sm leading-relaxed text-pretty">
        We don’t use advertising or tracking cookies. Google Maps may set cookies only if you choose to load the
        map.{" "}
        <Link href="/privacy" className="font-semibold underline underline-offset-2 hover:text-peach">
          Privacy Policy
        </Link>
      </p>
      <button type="button" onClick={dismiss} className={buttonClasses("primary-dark", "md", "mt-4")}>
        Got it
      </button>
    </aside>
  );
}
