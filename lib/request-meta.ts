import "server-only";
import { createHash } from "node:crypto";

/**
 * Hashes a client IP with a server-side pepper. Stored instead of the raw
 * address: enough to rate-limit and to spot a flood from one source, not
 * enough to be a standalone identifier if the table ever leaks.
 */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const pepper = process.env.IP_HASH_PEPPER ?? process.env.ADMIN_SESSION_SECRET ?? "";
  if (!pepper) return null;
  return createHash("sha256").update(`${pepper}:${ip}`).digest("hex");
}

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(request: Request): string | null {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip");
}
