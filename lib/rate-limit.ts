/**
 * In-memory rate limiter for API routes. Best-effort per serverless instance.
 * For strict cross-instance limits, use Vercel KV or Upstash Redis.
 */
const windowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 60;
const store = new Map<string, { count: number; resetAt: number }>();

function prune(): void {
  const now = Date.now();
  for (const [key, v] of store.entries()) {
    if (v.resetAt <= now) store.delete(key);
  }
}

export function checkRateLimit(identifier: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  if (store.size > 10000) prune();

  let entry = store.get(identifier);
  if (!entry) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(identifier, entry);
    return { ok: true };
  }
  if (entry.resetAt <= now) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
    return { ok: true };
  }
  entry.count += 1;
  if (entry.count > maxRequestsPerWindow) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]?.trim() : null;
  return ip || "unknown";
}
