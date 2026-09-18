import "server-only";

/**
 * In-memory rate limiter for public form endpoints.
 *
 * Deliberately simple: a fixed window per key, held in the process. On Vercel
 * each instance keeps its own counter, so this is a speed bump against casual
 * abuse and accidental double-submits, not a distributed quota. Better Auth
 * handles its own limiting for credential endpoints. If VoltFM ever needs a
 * hard global limit, this is the seam to swap for Redis or Upstash.
 */

type Entry = { count: number; resetAt: number };

declare global {
  var __voltfmRateLimit: Map<string, Entry> | undefined;
}

const buckets = (global.__voltfmRateLimit ??= new Map<string, Entry>());

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);

  if (entry.count > limit) {
    return { ok: false, remaining: 0, retryAfterSeconds };
  }

  return { ok: true, remaining: limit - entry.count, retryAfterSeconds };
}

/**
 * Best-effort client identity from proxy headers. Spoofable, which is fine for
 * the purpose above — it is not used for anything security-critical.
 */
export function clientKey(headers: Headers, scope: string): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
