"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

/**
 * Click-to-load map. Google Maps (and its cookies) only loads after the visitor
 * asks for it, so the site sets no third-party cookies by default.
 */
export function MapFacade({
  embedUrl,
  mapsUrl,
  addressLine,
  tone = "light",
  className = "",
}: {
  embedUrl: string;
  mapsUrl: string;
  addressLine: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const dark = tone === "dark";
  // Google Maps directions to the same place the map link searches for.
  const place = new URL(mapsUrl).searchParams.get("query");
  const directionsUrl = place ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place)}` : null;
  const linkClassName = `inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold ${dark ? "text-plaster" : "text-terracotta"}`;

  return (
    <div className={className}>
      <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl border ${dark ? "border-plaster/20 bg-dusk-deep" : "border-ink/10 bg-sand"}`}>
        {loaded ? (
          <iframe
            src={embedUrl}
            title={`Map showing ${addressLine}`}
            className="absolute inset-0 size-full border-0"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <MapPin aria-hidden="true" className={`size-8 ${dark ? "text-sunset" : "text-terracotta"}`} />
            <p className={`max-w-xs text-sm ${dark ? "text-mist" : "text-ink-soft"}`}>
              The interactive map is provided by Google and may set cookies. It loads only if you choose.
            </p>
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className={`min-h-11 rounded-full px-5 font-semibold transition-colors ${
                dark ? "bg-sunset text-ink hover:bg-peach" : "bg-ink text-plaster hover:bg-terracotta"
              }`}
            >
              Load interactive map
            </button>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6">
        {directionsUrl && (
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className={linkClassName}>
            <span className="link-underline">Get directions</span>
            <span className="sr-only"> (opens Google Maps in a new tab)</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={linkClassName}>
          <span className="link-underline">Open in Google Maps</span>
          <span className="sr-only"> (opens in a new tab)</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
