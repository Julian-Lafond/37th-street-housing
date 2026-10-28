import Image from "next/image";
import { Bath, CalendarDays, Car, PawPrint, Sofa, WashingMachine, Wifi } from "lucide-react";
import type { FeatureIcon, HomePageContent, MediaItem } from "@/content/types";
import { Reveal } from "@/components/motion/reveal";
import { RepresentativeNote } from "@/components/ui/representative-note";

const icons: Record<FeatureIcon, typeof Sofa> = {
  sofa: Sofa,
  washer: WashingMachine,
  bath: Bath,
  calendar: CalendarDays,
  wifi: Wifi,
  car: Car,
  paw: PawPrint,
};

export function Features({ content, media }: { content: HomePageContent["features"]; media: MediaItem[] }) {
  const items = content.items.filter((f) => f.confirmed);
  const [main, ...rest] = media;

  return (
    <section aria-labelledby="features-heading" className="section-y">
      <div className="container-site grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className="lg:order-2 lg:col-span-6 lg:col-start-7">
          <Reveal>
            <p className="eyebrow text-terracotta">{content.eyebrow}</p>
            <h2 id="features-heading" data-split className="mt-4 text-display">
              {content.heading}
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {items.map((f, i) => {
              const Icon = icons[f.icon];
              return (
                <Reveal as="li" key={f.title} delay={i * 0.07}>
                  <span className="inline-flex size-12 items-center justify-center rounded-full bg-eucalyptus/15">
                    <Icon aria-hidden="true" className="size-6 text-eucalyptus-ink" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-4 font-sans text-lg font-bold" style={{ fontVariationSettings: "normal" }}>
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-ink-soft">{f.body}</p>
                </Reveal>
              );
            })}
          </ul>
        </div>

        {main && (
          <div className="lg:order-1 lg:col-span-6">
            <div className="grid grid-cols-5 gap-3 md:gap-4">
              <div
                data-image-reveal
                className="relative col-span-5 aspect-[4/3] overflow-hidden rounded-2xl bg-sand sm:col-span-3 sm:row-span-2 sm:aspect-auto"
              >
                <div data-parallax="7" className="absolute -inset-y-[9%] inset-x-0">
                  <Image
                    src={main.src}
                    alt={main.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 60vw, 100vw"
                    quality={70}
                    placeholder="blur"
                    blurDataURL={main.blurDataURL}
                    className="object-cover"
                    style={{ objectPosition: `${main.focalPoint.x}% ${main.focalPoint.y}%` }}
                  />
                </div>
              </div>
              {rest.slice(0, 2).map((m) => (
                <div
                  key={m.id}
                  data-image-reveal
                  className="relative col-span-5 aspect-[4/3] overflow-hidden rounded-2xl bg-sand sm:col-span-2 sm:aspect-[4/5]"
                >
                  <Image
                    src={m.src}
                    alt={m.alt}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 100vw"
                    quality={70}
                    placeholder="blur"
                    blurDataURL={m.blurDataURL}
                    className="object-cover"
                    style={{ objectPosition: `${m.focalPoint.x}% ${m.focalPoint.y}%` }}
                  />
                </div>
              ))}
            </div>
            <RepresentativeNote className="mt-4" />
          </div>
        )}
      </div>
    </section>
  );
}
