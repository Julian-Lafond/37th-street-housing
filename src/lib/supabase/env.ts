/** Supabase is optional at build time: without these variables the site falls back to the local content files. */
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export const isSupabaseConfigured = () => supabaseEnv() !== null;

/** Public URL of a file in the housing-media bucket; /media/... paths are served by the site itself. */
export function mediaUrl(src: string): string {
  if (src.startsWith("/") || src.startsWith("http")) return src;
  const env = supabaseEnv();
  return env ? `${env.url}/storage/v1/object/public/housing-media/${src}` : src;
}

export const SCHEMA = "housing";
export const BUCKET = "housing-media";
