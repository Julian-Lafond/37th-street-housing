// Writes width, height and a tiny blurDataURL for every image in public/media
// to src/content/media-meta.generated.json. Run `npm run media:meta` after adding
// or replacing photos. Phase 2: the CMS stores these on each Media document instead.
import sharp from "sharp";
import { readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dir = join(process.cwd(), "public/media");
const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)).sort();
const out = {};
for (const file of files) {
  const img = sharp(join(dir, file));
  const { width, height } = await img.metadata();
  const blur = await img.clone().resize(12).jpeg({ quality: 50 }).toBuffer();
  out[file] = { width, height, blurDataURL: `data:image/jpeg;base64,${blur.toString("base64")}` };
}
const target = join(process.cwd(), "src/content/media-meta.generated.json");
await writeFile(target, JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${files.length} entries to ${target}`);
