"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <section aria-labelledby="error-heading" className="container-site flex min-h-[60dvh] flex-col justify-center py-24">
      <p className="eyebrow text-terracotta">Something went wrong</p>
      <h1 id="error-heading" className="mt-4 max-w-3xl text-display">
        Sorry, this page didn&rsquo;t load properly.
      </h1>
      <p className="mt-5 max-w-[52ch] text-lede text-ink-soft">Please try again. If it keeps happening, head back home.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className={buttonClasses("primary", "lg")}>
          Try again
        </button>
        <Link href="/" className={buttonClasses("secondary", "lg")}>
          Back to home
        </Link>
      </div>
    </section>
  );
}
