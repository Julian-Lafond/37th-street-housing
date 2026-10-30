"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClasses } from "@/components/ui/button";

/**
 * Sticky bottom bar on small screens so "Inquire" is always one tap away.
 * The button sits on the left and the text stops short of the bottom-right
 * corner, where the host's badge is drawn.
 */
export function MobileInquireBar({ leasingText }: { leasingText: string }) {
  const pathname = usePathname();
  if (pathname === "/contact") return null;

  return (
    <aside aria-label="Leasing" className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-plaster/90 backdrop-blur-md md:hidden">
      <div className="container-site flex items-center gap-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Link href="/contact" className={buttonClasses("primary", "md", "shrink-0")}>
          Inquire
        </Link>
        <p className="line-clamp-2 min-w-0 flex-1 pr-(--badge-clearance) text-sm font-semibold leading-tight text-ink max-[359px]:hidden">
          {leasingText}
        </p>
      </div>
    </aside>
  );
}
