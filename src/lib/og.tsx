import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Static (non-variable) WOFF files: the OG renderer doesn't support WOFF2 or variable fonts.
const fontDir = join(process.cwd(), "src/assets/og-fonts");

export const OG_SIZE = { width: 1200, height: 630 };

// Read once at module load (static assets, not request data) so OG images prerender at build time.
const [display, sans, exterior] = await Promise.all([
  readFile(join(fontDir, "fraunces-latin-400-normal.woff")),
  readFile(join(fontDir, "manrope-latin-600-normal.woff")),
  readFile(join(process.cwd(), "public/media/exterior-front-day.jpg")),
]);

export const OG_FONTS = [
  { name: "Fraunces", data: display, style: "normal" as const, weight: 400 as const },
  { name: "Manrope", data: sans, style: "normal" as const, weight: 600 as const },
];

export const OG_EXTERIOR = `data:image/jpeg;base64,${exterior.toString("base64")}`;

export const GOLDEN = "linear-gradient(115deg, #f6a88f 0%, #f8d2bd 45%, #c2bbe6 100%)";
