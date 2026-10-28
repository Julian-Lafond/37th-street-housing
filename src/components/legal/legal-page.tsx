import type { ComponentType } from "react";
import type { LegalSlug } from "@/content/types";
import { SplitHeadline } from "@/components/motion/split-headline";
import { getLegalPage } from "@/lib/data";
import { formatLongDate } from "@/lib/pricing";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";

export async function LegalPage({ slug, Content }: { slug: LegalSlug; Content: ComponentType }) {
  const page = await getLegalPage(slug);
  const dateLabel = slug === "accessibility" ? "Last reviewed" : "Effective";
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: page.title, path: `/${slug}` }])} />
      <article className="container-site pb-[var(--space-section)] pt-14 md:pt-24">
        <header className="max-w-3xl border-b border-ink/10 pb-10">
          <p className="eyebrow text-terracotta">Legal</p>
          <SplitHeadline className="mt-4 text-display" segments={[{ text: page.title }]} />
          <p className="mt-4 text-sm text-ink-soft">
            {dateLabel}: <time dateTime={page.updatedAt}>{formatLongDate(page.updatedAt)}</time>
          </p>
        </header>
        <div className="prose-legal mt-10">
          <Content />
        </div>
      </article>
    </>
  );
}
