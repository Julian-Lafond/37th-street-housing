import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SCHEMA, supabaseEnv } from "./env";

/**
 * Service-role client: bypasses RLS. Server only, used solely to insert
 * inquiries (after validation, spam check and rate limit) and to purge old ones.
 */
export function createServiceClient() {
  const env = supabaseEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env || !key) throw new Error("Supabase service role is not configured");
  return createClient(env.url, key, {
    db: { schema: SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const isServiceConfigured = () => Boolean(supabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY);
