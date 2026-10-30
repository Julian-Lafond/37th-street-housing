import "server-only";
import { headers } from "next/headers";

/**
 * The visitor's IP address, for rate limiting only (callers hash it; it is
 * never stored raw). Netlify sets x-nf-client-connection-ip itself, so it
 * can't be faked. The first X-Forwarded-For entry can be sent by the visitor,
 * so it's only a fallback for other hosts.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-nf-client-connection-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
