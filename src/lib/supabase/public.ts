import { createClient } from "@supabase/supabase-js";
import { SCHEMA, supabaseEnv } from "./env";

/** Anonymous, read-only client used to build public pages. RLS only exposes published rows. */
export function createPublicClient() {
  const env = supabaseEnv();
  if (!env) throw new Error("Supabase is not configured");
  return createClient(env.url, env.anonKey, {
    db: { schema: SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
