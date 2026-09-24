import "server-only";

/**
 * In-memory fixed-window limiter.
 *
 * Deliberately simple, and deliberately documented as partial: serverless
 * instances do not share this map, so a determined attacker spread across
 * enough cold starts gets more attempts than the nominal limit. It still stops
 * the realistic case (one client hammering one instance) and costs nothing.
 * If the admin ever holds more than this, move to Upstash or Vercel KV.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

/** Drops expired buckets so the map cannot grow without bound. */
export function sweepRateLimits(): void {
  const now = Date.now();
  // forEach rather than for..of: the project targets a pre-ES2015 lib, where
  // iterating a Map directly needs --downlevelIteration.
  const expired: string[] = [];
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) expired.push(key);
  });
  expired.forEach((key) => buckets.delete(key));
}
