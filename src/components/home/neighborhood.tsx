import { Bike, Car, Footprints, TrainFront } from "lucide-react";
import type { HomePageContent, LocationHighlight, SiteSettings } from "@/content/types";
import { MapFacade } from "@/components/map/map-facade";
import { Reveal } from "@/components/motion/reveal";
import { MapIllustration } from "./map-illustration";

const modes: Record<LocationHighlight["mode"], { label: string; Icon: typeof Footprints }> = {
  walk: { label: "walk", Icon: Footprints },
  bike: { label: "bike ride", Icon: Bike },
  transit: { label: "by Metro", Icon: TrainFront },
  drive: { label: "drive", Icon: Car },
};

export function Neighborhood({ content, site }: { content: HomePageContent["neighborhood"]; site: SiteSettings }) {
  const addressLine = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;
  return (
    <section id="neighborhood" aria-labelledby="neighborhood-heading" className="section-y on-dark bg-dusk text-plaster">
      <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="eyebrow text-sunset">{content.eyebrow}</p>
            <h2 id="neighborhood-heading" data-split className="mt-4 text-display">
              {content.heading}
            </h2>
            <p className="mt-5 max-w-[56ch] text-lede text-mist">{content.body}</p>
          </Reveal>

          <ul className="mt-10 divide-y divide-plaster/15 border-y border-plaster/15">
            {content.highlights.map((h, i) => {
              const { label, Icon } = modes[h.mode];
              return (
                <Reveal as="li" key={h.place} delay={i * 0.05} className="flex items-center justify-between gap-4 py-4">
                  <span className="flex items-center gap-3">
                    <Icon aria-hidden="true" className="size-5 shrink-0 text-sunset" />
                    <span className="font-semibold">{h.place}</span>
                  </span>
                  <span className="shrink-0 text-right text-mist">
                    <span className="font-display text-2xl text-plaster">{h.minutes}</span> min {label}
                  </span>
                </Reveal>
              );
            })}
          </ul>
          <p className="mt-3 text-sm text-mist">{content.disclaimer}</p>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <Reveal>
            <figure>
              <MapIllustration className="w-full" />
              <figcaption className="mt-2 text-xs text-mist">Illustration, not to scale.</figcaption>
            </figure>
          </Reveal>
          <MapFacade
            className="mt-8"
            tone="dark"
            embedUrl={site.mapEmbedUrl}
            mapsUrl={site.googleMapsUrl}
            addressLine={addressLine}
          />
        </div>
      </div>
    </section>
  );
}
