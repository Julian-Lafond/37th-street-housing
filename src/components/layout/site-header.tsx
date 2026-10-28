"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonClasses } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { NAV_ITEMS } from "./nav";

/**
 * Sticky header: hides while scrolling down, returns on any scroll up, and
 * frosts once the page has moved. A single indicator slides between nav items
 * (following hover, resting on the current page). When the header is hidden
 * on desktop, a floating Inquire pill keeps the main action on screen.
 */
export function SiteHeader({
  wordmark,
  descriptor,
  addressLine,
}: {
  wordmark: string;
  descriptor: string;
  addressLine: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = useState<{ x: number; w: number; visible: boolean }>({
    x: 0,
    w: 0,
    visible: false,
  });

  const isCurrent = useCallback(
    (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`)),
    [pathname],
  );

  // Hide on scroll down, show on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const delta = y - last;
      if (Math.abs(delta) > 6) {
        const focusInside = headerRef.current?.contains(document.activeElement);
        setHidden(delta > 0 && y > 160 && !focusInside);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu and reveal the header after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setHidden(false);
    if (menuOpen) setMenuOpen(false);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  // Sliding nav indicator.
  const moveIndicator = useCallback((target: HTMLElement | null) => {
    const list = navRef.current;
    if (!list) return;
    const el = target ?? list.querySelector<HTMLElement>("[aria-current='page']");
    if (!el) return setIndicator((s) => ({ ...s, visible: false }));
    const box = list.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setIndicator({ x: r.left - box.left + 12, w: r.width - 24, visible: true });
  }, []);
  useLayoutEffect(() => {
    moveIndicator(null);
    const onResize = () => moveIndicator(null);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [pathname, moveIndicator]);

  const showHeader = !hidden || menuOpen;

  return (
    <>
      <header
        ref={headerRef}
        onFocus={() => setHidden(false)}
        className={`sticky top-0 z-40 border-b transition-[transform,background-color,border-color] duration-(--dur-ui) ease-(--ease-transition) ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        } ${scrolled ? "border-ink/10 bg-plaster/80 backdrop-blur-md backdrop-saturate-150" : "border-transparent bg-plaster/0"}`}
      >
        <div className="container-site flex h-20 items-center justify-between gap-6">
          <Link
            href="/"
            className="rounded-md transition-opacity duration-(--dur-micro) hover:opacity-80"
            aria-label="37th Street Housing, home"
          >
            <Wordmark wordmark={wordmark} descriptor={descriptor} />
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <div className="relative" onPointerLeave={() => moveIndicator(null)}>
              <ul ref={navRef} className="flex items-center gap-1 lg:gap-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isCurrent(item.href) ? "page" : undefined}
                      onPointerEnter={(e) => moveIndicator(e.currentTarget)}
                      onFocus={(e) => moveIndicator(e.currentTarget)}
                      onBlur={() => moveIndicator(null)}
                      className="relative inline-flex min-h-11 items-center px-3 text-[0.9375rem] font-semibold text-ink-soft transition-colors duration-(--dur-micro) ease-(--ease-transition) hover:text-ink aria-[current=page]:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 left-0 h-px w-px origin-left bg-terracotta transition-[transform,opacity] duration-(--dur-ui) ease-(--ease-transition)"
                style={
                  {
                    transform: `translateX(${indicator.x}px) scaleX(${indicator.w})`,
                    opacity: indicator.visible ? 1 : 0,
                  } as CSSProperties
                }
              />
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <Magnetic>
                <Link href="/contact" className={buttonClasses("primary", "md")}>
                  Inquire
                </Link>
              </Magnetic>
            </div>
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-ink/20 px-4 text-[0.9375rem] font-semibold transition-[background-color,transform] duration-(--dur-micro) ease-(--ease-transition) hover:bg-sand active:scale-[0.97] md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu aria-hidden="true" className="size-5" />
              Menu
            </button>
          </div>
        </div>

        <dialog
          ref={dialogRef}
          id="mobile-menu"
          aria-label="Site menu"
          onClose={() => {
            setMenuOpen(false);
            // Safari doesn't focus buttons on tap, so return focus explicitly.
            menuButtonRef.current?.focus();
          }}
          className="m-0 h-dvh max-h-none w-full max-w-none bg-plaster p-0 text-ink backdrop:bg-ink/40 open:animate-[menu-in_400ms_var(--ease-entrance)]"
        >
          <div className="container-site flex h-full flex-col">
            <div className="flex h-20 items-center justify-between">
              <Wordmark wordmark={wordmark} descriptor={descriptor} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/20 px-4 text-[0.9375rem] font-semibold active:scale-[0.97]"
              >
                <X aria-hidden="true" className="size-5" />
                Close
              </button>
            </div>
            <nav aria-label="Primary" className="mt-8 flex-1">
              <ul className="menu-stagger divide-y divide-ink/10 border-y border-ink/10">
                {[{ href: "/", label: "Home" }, ...NAV_ITEMS].map((item, i) => (
                  <li key={item.href} style={{ "--d": i } as CSSProperties}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={
                        item.href === "/"
                          ? pathname === "/"
                            ? "page"
                            : undefined
                          : isCurrent(item.href)
                            ? "page"
                            : undefined
                      }
                      className="group flex min-h-18 items-center justify-between font-display text-[clamp(2rem,1.5rem+3vw,2.75rem)] leading-none tracking-[-0.02em] aria-[current=page]:text-terracotta"
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className="text-xl text-ink-soft transition-transform duration-(--dur-micro) ease-(--ease-transition) group-active:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="menu-stagger pb-[max(2rem,env(safe-area-inset-bottom))]">
              <p className="mb-4 text-sm text-ink-soft" style={{ "--d": 6 } as CSSProperties}>
                {addressLine}
              </p>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className={buttonClasses("primary", "lg", "w-full")}
                style={{ "--d": 7 } as CSSProperties}
              >
                Inquire
              </Link>
            </div>
          </div>
        </dialog>
      </header>

      {/* Desktop: keep the main action on screen while the header is tucked away. */}
      <div
        className={`fixed bottom-6 right-6 z-30 hidden transition-[transform,opacity] duration-(--dur-ui) ease-(--ease-transition) md:block ${
          showHeader || pathname === "/contact"
            ? "pointer-events-none translate-y-4 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <Magnetic>
          <Link
            href="/contact"
            tabIndex={showHeader ? -1 : undefined}
            aria-hidden={showHeader ? true : undefined}
            className={buttonClasses("primary", "lg", "shadow-[0_18px_40px_-18px_rgba(27,31,29,0.55)]")}
          >
            Inquire
          </Link>
        </Magnetic>
      </div>
    </>
  );
}
