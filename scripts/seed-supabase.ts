/**
 * One-time import of the current site content into the Supabase "housing" schema.
 *   npm run db:seed            refuses if housing.units already has rows
 *   npm run db:seed -- --force overwrites rows with the same ids (owner edits would be lost)
 * Touches only housing.* tables. Photos keep their /media/... paths (served by the site);
 * new photos uploaded in /admin go to the housing-media bucket.
 */
import { createClient } from "@supabase/supabase-js";
import { faqs } from "../src/content/faqs";
import { homePage } from "../src/content/home";
import { media } from "../src/content/media";
import { siteSettings } from "../src/content/site";
import { units } from "../src/content/units";
import { faqToRow, mediaToRow, unitToRow } from "../src/lib/supabase/mappers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");

const db = createClient(url, key, { db: { schema: "housing" }, auth: { persistSession: false } });
const force = process.argv.includes("--force");

async function run() {
  const { count, error } = await db.from("units").select("slug", { count: "exact", head: true });
  if (error) throw error;
  if (count && !force) {
    console.log(`housing.units already has ${count} rows. Nothing changed. Use --force to overwrite.`);
    return;
  }
  const steps: [string, PromiseLike<{ error: unknown }>][] = [
    ["units", db.from("units").upsert(units.map((u) => unitToRow(u)))],
    ["site_settings", db.from("site_settings").upsert({ id: 1, content: siteSettings })],
    ["home_page", db.from("home_page").upsert({ id: 1, content: homePage })],
    ["faqs", db.from("faqs").upsert(faqs.map(faqToRow))],
  ];
  for (const [name, step] of steps) {
    const { error } = await step;
    if (error) throw new Error(`${name}: ${JSON.stringify(error)}`);
    console.log(`✓ ${name}`);
  }
  // Media references units, so it goes last.
  const { error: mediaError } = await db.from("media").upsert(media.map((m) => mediaToRow(m)));
  if (mediaError) throw new Error(`media: ${JSON.stringify(mediaError)}`);
  console.log("✓ media");
  console.log(`Seeded ${units.length} units, ${media.length} photos, ${faqs.length} FAQs, site settings and home page.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
