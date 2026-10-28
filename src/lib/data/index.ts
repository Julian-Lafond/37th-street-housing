/**
 * Repository layer. Components read content only through these functions.
 *
 * Source: the Supabase "housing" schema when NEXT_PUBLIC_SUPABASE_URL/ANON_KEY
 * are set, otherwise the local files in src/content (CI, tests, first setup).
 * All public content is fetched in one cached read tagged CONTENT_TAG; admin
 * saves call updateTag(CONTENT_TAG) so pages refresh within seconds.
 */
import { cacheLife, cacheTag } from "next/cache";
import { faqs as localFaqs } from "@/content/faqs";
import { homePage as localHome } from "@/content/home";
import { legalPages } from "@/content/legal";
import { media as localMedia } from "@/content/media";
import { siteSettings as localSite } from "@/content/site";
import type {
  Faq,
  HomePageContent,
  LegalPageMeta,
  LegalSlug,
  MediaItem,
  SiteSettings,
  Unit,
  UnitSlug,
} from "@/content/types";
import { units as localUnits } from "@/content/units";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { faqFromRow, mediaFromRow, unitFromRow, type FaqRow, type MediaRow, type UnitRow } from "@/lib/supabase/mappers";
import { createPublicClient } from "@/lib/supabase/public";
import { selectCover, selectForUnit, selectShared } from "./media-selectors";

export const CONTENT_TAG = "housing-content";

interface Content {
  site: SiteSettings;
  home: HomePageContent;
  units: Unit[];
  media: MediaItem[];
  faqs: Faq[];
}

const localContent: Content = {
  site: localSite,
  home: localHome,
  units: localUnits,
  media: localMedia,
  faqs: localFaqs,
};

async function loadContent(): Promise<Content> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");

  if (!isSupabaseConfigured()) return localContent;

  const db = createPublicClient();
  const [site, home, units, media, faqs] = await Promise.all([
    db.from("site_settings").select("content").eq("id", 1).maybeSingle(),
    db.from("home_page").select("content").eq("id", 1).maybeSingle(),
    db.from("units").select("*").order("sort_order"),
    db.from("media").select("*").order("sort_order"),
    db.from("faqs").select("*").order("sort_order"),
  ]);
  const failed = [site, home, units, media, faqs].find((r) => r.error);
  if (failed?.error) throw new Error(`Supabase content load failed: ${failed.error.message}`);

  // Not seeded yet: keep serving the local content rather than an empty site.
  if (!site.data || !home.data) {
    console.warn("Supabase housing tables are empty; using local content. Run `npm run db:seed`.");
    return localContent;
  }

  return {
    site: site.data.content as SiteSettings,
    home: home.data.content as HomePageContent,
    units: (units.data as UnitRow[]).map(unitFromRow),
    media: (media.data as MediaRow[]).map(mediaFromRow),
    faqs: (faqs.data as FaqRow[]).map(faqFromRow),
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return (await loadContent()).site;
}

export async function getHomePage(): Promise<HomePageContent> {
  return (await loadContent()).home;
}

export async function getUnits(): Promise<Unit[]> {
  return [...(await loadContent()).units].sort((a, b) => a.order - b.order);
}

export async function getUnit(slug: string): Promise<Unit | null> {
  return (await getUnits()).find((u) => u.slug === slug) ?? null;
}

export async function getUnitSlugs(): Promise<UnitSlug[]> {
  return (await getUnits()).map((u) => u.slug);
}

export async function getMedia(): Promise<MediaItem[]> {
  return [...(await loadContent()).media].sort((a, b) => a.order - b.order);
}

/** Resolve media IDs referenced by page content, preserving the given order. */
export async function getMediaByIds(ids: string[]): Promise<MediaItem[]> {
  const all = await getMedia();
  return ids.flatMap((id) => all.find((m) => m.id === id) ?? []);
}

export async function getSharedMedia(): Promise<MediaItem[]> {
  return selectShared(await getMedia());
}

export async function getUnitMedia(slug: UnitSlug): Promise<MediaItem[]> {
  return selectForUnit(await getMedia(), slug);
}

export async function getUnitCover(slug: UnitSlug): Promise<MediaItem | null> {
  return selectCover(await getMedia(), slug);
}

export async function getFaqs(): Promise<Faq[]> {
  return (await loadContent()).faqs.filter((f) => f.published).sort((a, b) => a.order - b.order);
}

/** Legal pages stay in reviewed MDX files (src/content/legal); not editable in the admin. */
export async function getLegalPage(slug: LegalSlug): Promise<LegalPageMeta> {
  const page = legalPages.find((p) => p.slug === slug);
  if (!page) throw new Error(`Unknown legal page: ${slug}`);
  return page;
}
