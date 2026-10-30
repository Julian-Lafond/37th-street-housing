import "server-only";
import { createHash } from "node:crypto";
import { clientIp } from "@/lib/client-ip";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/service";

/**
 * Admin login lockout. Sign-in runs on the website's server, so Supabase's own
 * per-IP limit sees the host's IP rather than the visitor's; this adds a limit
 * per account and per visitor. Counts failed attempts in housing.rate_limits
 * (salted hashes only, never the raw email or IP) through the service role.
 */
export const MAX_FAILURES_PER_ACCOUNT = 5;
export const MAX_FAILURES_PER_IP = 20;
export const LOCKOUT_SECONDS = 15 * 60;

const hash = (value: string) => createHash("sha256").update((process.env.RATE_LIMIT_SALT ?? "") + value).digest("hex");

async function keys(email: string) {
  return {
    account: `login:account:${hash(email.toLowerCase())}`,
    ip: `login:ip:${hash(await clientIp())}`,
  };
}

/** True when this account or this visitor has too many recent failed logins. */
export async function isLockedOut(email: string): Promise<boolean> {
  if (!isServiceConfigured()) return false;
  const { account, ip } = await keys(email);
  const since = new Date(Date.now() - LOCKOUT_SECONDS * 1000).toISOString();
  const { data, error } = await createServiceClient()
    .from("rate_limits")
    .select("key, hits")
    .in("key", [account, ip])
    .gt("window_start", since);
  // If the check itself fails, refuse rather than allow unlimited guessing.
  if (error) return true;
  return (data ?? []).some((row) => row.hits >= (row.key === account ? MAX_FAILURES_PER_ACCOUNT : MAX_FAILURES_PER_IP));
}

export async function recordFailedLogin(email: string): Promise<void> {
  if (!isServiceConfigured()) return;
  const { account, ip } = await keys(email);
  const db = createServiceClient();
  await Promise.all([
    db.rpc("hit_rate_limit", { limit_key: account, max_hits: MAX_FAILURES_PER_ACCOUNT, window_seconds: LOCKOUT_SECONDS }),
    db.rpc("hit_rate_limit", { limit_key: ip, max_hits: MAX_FAILURES_PER_IP, window_seconds: LOCKOUT_SECONDS }),
  ]);
}

/** A successful login clears that account's failure count. */
export async function clearFailedLogins(email: string): Promise<void> {
  if (!isServiceConfigured()) return;
  const { account } = await keys(email);
  await createServiceClient().from("rate_limits").delete().eq("key", account);
}
