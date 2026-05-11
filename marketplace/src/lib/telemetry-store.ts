import 'server-only';
import type { StoredTelemetryEvent, TelemetryPayload } from './telemetry-schema';

const MS_24H = 24 * 60 * 60 * 1000;
const RETENTION_MS = 90 * MS_24H;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetMs: number;
}

interface Backend {
  kind: 'kv' | 'memory';
  push: (evt: StoredTelemetryEvent) => Promise<void>;
  range: (sinceMs: number) => Promise<StoredTelemetryEvent[]>;
  rateLimit: (anonId: string) => Promise<RateLimitResult>;
}

function memoryBackend(): Backend {
  const events: StoredTelemetryEvent[] = [];
  const buckets = new Map<string, { count: number; windowStart: number }>();

  return {
    kind: 'memory',
    async push(evt) {
      events.push(evt);
      const cutoff = Date.now() - RETENTION_MS;
      while (events.length && new Date(events[0]!.received_at).getTime() < cutoff) {
        events.shift();
      }
    },
    async range(sinceMs) {
      return events.filter((e) => new Date(e.received_at).getTime() >= sinceMs);
    },
    async rateLimit(anonId) {
      const now = Date.now();
      const b = buckets.get(anonId);
      if (!b || now - b.windowStart >= RATE_LIMIT_WINDOW_MS) {
        buckets.set(anonId, { count: 1, windowStart: now });
        return { ok: true, remaining: RATE_LIMIT_MAX - 1, resetMs: RATE_LIMIT_WINDOW_MS };
      }
      if (b.count >= RATE_LIMIT_MAX) {
        return {
          ok: false,
          remaining: 0,
          resetMs: RATE_LIMIT_WINDOW_MS - (now - b.windowStart),
        };
      }
      b.count += 1;
      return {
        ok: true,
        remaining: RATE_LIMIT_MAX - b.count,
        resetMs: RATE_LIMIT_WINDOW_MS - (now - b.windowStart),
      };
    },
  };
}

let kvBackendCache: Backend | null = null;
async function kvBackend(): Promise<Backend | null> {
  if (kvBackendCache) return kvBackendCache;
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
  try {
    const { kv } = await import('@vercel/kv');
    kvBackendCache = {
      kind: 'kv',
      async push(evt) {
        const score = new Date(evt.received_at).getTime();
        await kv.zadd('telemetry:events', { score, member: JSON.stringify(evt) });
        const cutoff = Date.now() - RETENTION_MS;
        await kv.zremrangebyscore('telemetry:events', 0, cutoff);
      },
      async range(sinceMs) {
        const raw = (await kv.zrange('telemetry:events', sinceMs, '+inf', {
          byScore: true,
        })) as unknown as string[];
        const out: StoredTelemetryEvent[] = [];
        for (const r of raw) {
          try {
            out.push(JSON.parse(r) as StoredTelemetryEvent);
          } catch {
            /* skip malformed */
          }
        }
        return out;
      },
      async rateLimit(anonId) {
        const key = `telemetry:rl:${anonId}`;
        const count = (await kv.incr(key)) as number;
        if (count === 1) {
          await kv.pexpire(key, RATE_LIMIT_WINDOW_MS);
        }
        if (count > RATE_LIMIT_MAX) {
          const ttl = ((await kv.pttl(key)) as number) ?? RATE_LIMIT_WINDOW_MS;
          return { ok: false, remaining: 0, resetMs: ttl };
        }
        return {
          ok: true,
          remaining: RATE_LIMIT_MAX - count,
          resetMs: RATE_LIMIT_WINDOW_MS,
        };
      },
    };
    return kvBackendCache;
  } catch {
    return null;
  }
}

let singleton: Backend | null = null;
const memSingleton = memoryBackend();

async function backend(): Promise<Backend> {
  if (singleton) return singleton;
  const kv = await kvBackend();
  singleton = kv ?? memSingleton;
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[telemetry] backend=${singleton.kind}`);
  }
  return singleton;
}

export async function recordTelemetry(payload: TelemetryPayload): Promise<void> {
  const b = await backend();
  await b.push({ ...payload, received_at: new Date().toISOString() });
}

export async function getTelemetryEvents(sinceMs: number): Promise<StoredTelemetryEvent[]> {
  const b = await backend();
  return b.range(sinceMs);
}

export async function checkRateLimit(anonId: string): Promise<RateLimitResult> {
  const b = await backend();
  return b.rateLimit(anonId);
}

/**
 * Per-IP rate limit for the public stats API. Reuses the same backend
 * mechanism as the per-anon telemetry limiter.
 */
export async function checkIpRateLimit(ip: string): Promise<RateLimitResult> {
  return checkRateLimit(`ip:${ip}`);
}

export const TELEMETRY_CONSTANTS = {
  RETENTION_MS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  MS_24H,
} as const;
