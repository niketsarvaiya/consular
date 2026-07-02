import IORedis from "ioredis";

/**
 * Lightweight fixed-window rate limiter backed by the existing Upstash Redis
 * (reuses REDIS_URL — no extra credentials needed).
 *
 * Fail-OPEN by design: if Redis is unreachable we allow the request rather than
 * lock legitimate users out. This trades a little brute-force resistance for
 * availability; brute-force is still bounded when Redis is healthy.
 */

let client: IORedis | null = null;
let disabled = false;

function getClient(): IORedis | null {
  if (disabled) return null;
  if (client) return client;
  if (!process.env.REDIS_URL) {
    disabled = true;
    return null;
  }
  client = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    enableOfflineQueue: false,
  });
  client.on("error", () => {}); // swallow — we fail open
  return client;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  limit: number;
}

/**
 * @param key       unique bucket (e.g. `login:email@x.com` or `upload:userId`)
 * @param limit     max requests allowed in the window
 * @param windowSec window length in seconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const c = getClient();
  if (!c) return { ok: true, remaining: limit, limit };

  try {
    const redisKey = `rl:${key}`;
    const count = await c.incr(redisKey);
    if (count === 1) await c.expire(redisKey, windowSec);
    return { ok: count <= limit, remaining: Math.max(0, limit - count), limit };
  } catch {
    return { ok: true, remaining: limit, limit }; // fail open
  }
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/** Standard 429 response body. */
export function tooManyRequests(message = "Too many requests. Please try again shortly.") {
  return { success: false, error: message };
}
