import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";

export function CtaBand({ heading, body }: { heading: string; body: string }) {
  return (
    <section aria-labelledby="cta-heading" className="bg-golden section-y relative overflow-hidden">
      <div className="container-site relative">
        <Reveal className="max-w-3xl">
          <p className="eyebrow text-ink">Leasing</p>
          <h2 id="cta-heading" data-split className="mt-4 text-display">
            {heading}
          </h2>
          <p className="mt-5 max-w-[52ch] text-lede text-ink">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <ButtonLink href="/contact" size="lg" variant="ink">
                Inquire
              </ButtonLink>
            </Magnetic>
            <ButtonLink href="/residences" size="lg" variant="secondary">
              Compare residences
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
