"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/apartments", label: "Apartments" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/text", label: "Homepage text" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/settings", label: "Contact & settings" },
];

export function AdminNav() {
  return <AdminNavLinks pathname={usePathname()} />;
}

/** Same links without the current-page highlight (Suspense fallback). */
export function AdminNavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="Admin" className="container-site overflow-x-auto">
      <ul className="flex gap-1">
        {ITEMS.map((item) => {
          const current = pathname !== null && (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className="inline-flex min-h-11 items-center whitespace-nowrap border-b-2 border-transparent px-3 text-sm font-semibold text-ink-soft hover:text-ink aria-[current=page]:border-terracotta aria-[current=page]:text-ink"
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
