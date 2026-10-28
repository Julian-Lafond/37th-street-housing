import type { MetadataRoute } from "next";
import { getSiteSettings, getUnits } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, units] = await Promise.all([getSiteSettings(), getUnits()]);
  const lastModified = site.contentUpdatedAt;
  const pages = ["/", "/residences", "/gallery", "/contact", "/privacy", "/terms", "/accessibility", "/fair-housing"];
  return [
    ...pages.map((path) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : path === "/residences" ? 0.9 : 0.5,
    })),
    ...units.map((u) => ({
      url: absoluteUrl(`/residences/${u.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
