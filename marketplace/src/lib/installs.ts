import 'server-only';

export type InstallSource = 'marketplace' | 'vscode' | 'cli' | 'x-intent' | 'copy';

export interface InstallEvent {
  agentId: string;
  timestamp: number;
  source: InstallSource;
  anonId?: string;
}

export interface InstallCounts {
  total: number;
  last7d: number;
  last24h: number;
}

export interface DailyCount {
  date: string; // YYYY-MM-DD (UTC)
  count: number;
}

const MS_24H = 24 * 60 * 60 * 1000;
const MS_7D = 7 * MS_24H;
const MS_30D = 30 * MS_24H;
const RECENT_WINDOW_MS = MS_30D;
const MAX_RECENT_EVENTS = 2000;

interface Backend {
  kind: 'kv' | 'memory';
  incr: (agentId: string) => Promise<number>;
  pushRecent: (evt: InstallEvent) => Promise<void>;
  getTotal: (agentId: string) => Promise<number>;
  getRecent: (agentId: string, sinceMs: number) => Promise<number>;
  getTimestamps: (agentId: string, sinceMs: number) => Promise<number[]>;
  getAllTotals: () => Promise<Map<string, number>>;
}

function memoryBackend(): Backend {
  const totals = new Map<string, number>();
  const recent = new Map<string, InstallEvent[]>();
  return {
    kind: 'memory',
    async incr(agentId) {
      const next = (totals.get(agentId) ?? 0) + 1;
      totals.set(agentId, next);
      return next;
    },
    async pushRecent(evt) {
      const list = recent.get(evt.agentId) ?? [];
      list.push(evt);
      const cutoff = Date.now() - RECENT_WINDOW_MS;
      const trimmed = list.filter((e) => e.timestamp >= cutoff).slice(-MAX_RECENT_EVENTS);
      recent.set(evt.agentId, trimmed);
    },
    async getTotal(agentId) {
      return totals.get(agentId) ?? 0;
    },
    async getRecent(agentId, sinceMs) {
      const list = recent.get(agentId) ?? [];
      return list.filter((e) => e.timestamp >= sinceMs).length;
    },
    async getTimestamps(agentId, sinceMs) {
      const list = recent.get(agentId) ?? [];
      return list.filter((e) => e.timestamp >= sinceMs).map((e) => e.timestamp);
    },
    async getAllTotals() {
      return new Map(totals);
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
      async incr(agentId) {
        return (await kv.incr(`install:total:${agentId}`)) as number;
      },
      async pushRecent(evt) {
        await kv.zadd(`install:recent:${evt.agentId}`, {
          score: evt.timestamp,
          member: `${evt.timestamp}:${evt.source}:${evt.anonId ?? 'anon'}`,
        });
        const cutoff = Date.now() - RECENT_WINDOW_MS;
        await kv.zremrangebyscore(`install:recent:${evt.agentId}`, 0, cutoff);
      },
      async getTotal(agentId) {
        const raw = await kv.get<number>(`install:total:${agentId}`);
        return raw ?? 0;
      },
      async getRecent(agentId, sinceMs) {
        const count = await kv.zcount(`install:recent:${agentId}`, sinceMs, '+inf');
        return (count as number) ?? 0;
      },
      async getTimestamps(agentId, sinceMs) {
        const raw = (await kv.zrange(`install:recent:${agentId}`, sinceMs, '+inf', {
          byScore: true,
          withScores: true,
        })) as unknown as (string | number)[];
        // Redis-like `withScores` interleaves member, score, member, score, …
        const out: number[] = [];
        for (let i = 1; i < raw.length; i += 2) {
          const s = raw[i];
          const n = typeof s === 'number' ? s : Number(s);
          if (Number.isFinite(n)) out.push(n);
        }
        return out;
      },
      async getAllTotals() {
        const keys: string[] = [];
        let cursor: string | number = 0;
        do {
          const result = (await kv.scan(cursor, {
            match: 'install:total:*',
            count: 200,
          })) as unknown as [string | number, string[]];
          const [next, batch] = result;
          keys.push(...batch);
          cursor = next;
        } while (cursor !== 0 && cursor !== '0');
        if (!keys.length) return new Map();
        const values = (await kv.mget(...keys)) as (number | null)[];
        const out = new Map<string, number>();
        keys.forEach((k, i) => out.set(k.replace('install:total:', ''), values[i] ?? 0));
        return out;
      },
    };
    return kvBackendCache;
  } catch {
    return null;
  }
}

let singletonBackend: Backend | null = null;
const memSingleton = memoryBackend();

async function backend(): Promise<Backend> {
  if (singletonBackend) return singletonBackend;
  const kv = await kvBackend();
  singletonBackend = kv ?? memSingleton;
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[installs] backend=${singletonBackend.kind}`);
  }
  return singletonBackend;
}

export async function recordInstall(evt: InstallEvent): Promise<number> {
  const b = await backend();
  const [total] = await Promise.all([b.incr(evt.agentId), b.pushRecent(evt)]);
  return total;
}

export async function getCounts(agentId: string): Promise<InstallCounts> {
  const b = await backend();
  const now = Date.now();
  const [total, last7d, last24h] = await Promise.all([
    b.getTotal(agentId),
    b.getRecent(agentId, now - MS_7D),
    b.getRecent(agentId, now - MS_24H),
  ]);
  return { total, last7d, last24h };
}

export async function getAllTotals(): Promise<Map<string, number>> {
  const b = await backend();
  return b.getAllTotals();
}

function isoDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/**
 * Returns an ordered series of per-day install counts for `days` calendar
 * days ending today (UTC). Missing days are filled with 0 so charts get a
 * dense x-axis.
 */
export async function getDailyCounts(agentId: string, days = 30): Promise<DailyCount[]> {
  const b = await backend();
  const now = Date.now();
  const since = now - (days - 1) * MS_24H;
  const sinceDayStart = Date.UTC(
    new Date(since).getUTCFullYear(),
    new Date(since).getUTCMonth(),
    new Date(since).getUTCDate()
  );
  const timestamps = await b.getTimestamps(agentId, sinceDayStart);
  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const ts = sinceDayStart + i * MS_24H;
    buckets.set(isoDay(ts), 0);
  }
  for (const t of timestamps) {
    const key = isoDay(t);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()]
    .sort(([a], [b2]) => (a < b2 ? -1 : 1))
    .map(([date, count]) => ({ date, count }));
}
