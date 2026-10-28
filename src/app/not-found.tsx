import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/site-chrome";
import { SplitHeadline } from "@/components/motion/split-headline";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <section aria-labelledby="nf-heading" className="bg-golden relative overflow-hidden">
        <div className="container-site relative flex min-h-[70dvh] flex-col justify-center py-24">
          <p className="eyebrow text-ink">Error 404</p>
          <SplitHeadline
            id="nf-heading"
            className="mt-4 max-w-4xl text-hero"
            segments={[{ text: "This page wandered off campus." }]}
          />
          <p className="mt-6 max-w-[48ch] text-lede text-ink">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. Try one of these instead.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/" variant="ink" size="lg">
              Back to home
            </ButtonLink>
            <ButtonLink href="/residences" variant="secondary" size="lg">
              View residences
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg">
              Contact us
            </ButtonLink>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
