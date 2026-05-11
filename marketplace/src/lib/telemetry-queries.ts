import 'server-only';
import { unstable_cache } from 'next/cache';
import { getAgents } from './agents';
import type { StoredTelemetryEvent } from './telemetry-schema';
import { getTelemetryEvents } from './telemetry-store';

const MS_DAY = 24 * 60 * 60 * 1000;
const MS_7D = 7 * MS_DAY;
const MS_30D = 30 * MS_DAY;
const MS_90D = 90 * MS_DAY;

// Rough dollar cost of a standard Grok API round-trip used for the
// "API calls saved" estimate when Pro Mode batches or caches calls. Tuned
// quarterly against xAI's published rates.
const API_CALL_SAVINGS_PER_PRO_DEPLOY = 6;

export type Period = '7d' | '30d' | '90d';
const PERIOD_MS: Record<Period, number> = { '7d': MS_7D, '30d': MS_30D, '90d': MS_90D };

function distinct(events: StoredTelemetryEvent[], key: keyof StoredTelemetryEvent): number {
  const seen = new Set<string>();
  for (const e of events) {
    const v = e[key];
    if (typeof v === 'string') seen.add(v);
  }
  return seen.size;
}

function isoDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export const getTotalAgentsInstalled = unstable_cache(
  async (): Promise<number> => {
    const events = await getTelemetryEvents(0);
    const deploys = events.filter((e) => e.event === 'deploy' && e.success === true);
    return distinct(deploys, 'anon_install_id');
  },
  ['telemetry:total-agents'],
  { revalidate: 30, tags: ['telemetry'] }
);

export const getXPostsGenerated = unstable_cache(
  async (): Promise<number> => {
    const events = await getTelemetryEvents(0);
    return events.filter((e) => e.event === 'post').length;
  },
  ['telemetry:posts'],
  { revalidate: 30, tags: ['telemetry'] }
);

export const getApiCallsSaved = unstable_cache(
  async (): Promise<number> => {
    const events = await getTelemetryEvents(0);
    const proDeploys = events.filter(
      (e) => e.event === 'deploy' && e.used_pro_mode === true && e.success === true
    );
    return proDeploys.length * API_CALL_SAVINGS_PER_PRO_DEPLOY;
  },
  ['telemetry:api-saved'],
  { revalidate: 30, tags: ['telemetry'] }
);

export const getActiveAgents7d = unstable_cache(
  async (): Promise<number> => {
    const events = await getTelemetryEvents(Date.now() - MS_7D);
    return distinct(events, 'anon_install_id');
  },
  ['telemetry:active-7d'],
  { revalidate: 30, tags: ['telemetry'] }
);

export const getTotalCreators = unstable_cache(
  async (): Promise<number> => {
    const agents = await getAgents();
    return new Set(agents.map((a) => a.creator.handle)).size;
  },
  ['telemetry:creators'],
  { revalidate: 300, tags: ['agents'] }
);

export async function getGrowthSeries(
  period: Period,
  metric: 'installs' | 'posts' | 'savings'
): Promise<{ date: string; value: number }[]> {
  const rangeMs = PERIOD_MS[period];
  const now = Date.now();
  const since = now - rangeMs;
  const events = await getTelemetryEvents(since);
  const days = Math.ceil(rangeMs / MS_DAY);
  const start = Date.UTC(
    new Date(since).getUTCFullYear(),
    new Date(since).getUTCMonth(),
    new Date(since).getUTCDate()
  );
  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) buckets.set(isoDay(start + i * MS_DAY), 0);

  for (const e of events) {
    const d = isoDay(new Date(e.received_at).getTime());
    if (!buckets.has(d)) continue;
    let value = 0;
    if (metric === 'installs' && e.event === 'deploy' && e.success) value = 1;
    else if (metric === 'posts' && e.event === 'post') value = 1;
    else if (metric === 'savings' && e.event === 'deploy' && e.success && e.used_pro_mode)
      value = API_CALL_SAVINGS_PER_PRO_DEPLOY;
    if (value) buckets.set(d, (buckets.get(d) ?? 0) + value);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, value]) => ({ date, value }));
}

export async function getProVsStandardSeries(
  period: Period
): Promise<{ date: string; pro: number; standard: number }[]> {
  const rangeMs = PERIOD_MS[period];
  const now = Date.now();
  const since = now - rangeMs;
  const events = await getTelemetryEvents(since);
  const days = Math.ceil(rangeMs / MS_DAY);
  const start = Date.UTC(
    new Date(since).getUTCFullYear(),
    new Date(since).getUTCMonth(),
    new Date(since).getUTCDate()
  );
  const buckets = new Map<string, { pro: number; standard: number }>();
  for (let i = 0; i < days; i++) buckets.set(isoDay(start + i * MS_DAY), { pro: 0, standard: 0 });

  for (const e of events) {
    if (e.event !== 'deploy' || !e.success) continue;
    const d = isoDay(new Date(e.received_at).getTime());
    const b = buckets.get(d);
    if (!b) continue;
    if (e.used_pro_mode) b.pro += 1;
    else b.standard += 1;
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, v]) => ({ date, pro: v.pro, standard: v.standard }));
}

export async function getCategoryBreakdown(): Promise<{ category: string; count: number }[]> {
  const events = await getTelemetryEvents(Date.now() - MS_30D);
  const counts = new Map<string, number>();
  for (const e of events) {
    if (e.event !== 'deploy' || !e.success) continue;
    const key = e.agent_category ?? 'other';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getHeatmapData(): Promise<{ dow: number; hour: number; count: number }[]> {
  const events = await getTelemetryEvents(Date.now() - MS_30D);
  const buckets = new Array(7 * 24).fill(0) as number[];
  for (const e of events) {
    if (e.event !== 'deploy' || !e.success) continue;
    const d = new Date(e.timestamp);
    const dow = d.getUTCDay();
    const hour = d.getUTCHours();
    const idx = dow * 24 + hour;
    buckets[idx] = (buckets[idx] ?? 0) + 1;
  }
  const out: { dow: number; hour: number; count: number }[] = [];
  for (let dow = 0; dow < 7; dow++) {
    for (let hour = 0; hour < 24; hour++) {
      const count = buckets[dow * 24 + hour] ?? 0;
      out.push({ dow, hour, count });
    }
  }
  return out;
}

export async function getHeadline() {
  const [totalAgents, posts, apiSaved, active7d, creators] = await Promise.all([
    getTotalAgentsInstalled(),
    getXPostsGenerated(),
    getApiCallsSaved(),
    getActiveAgents7d(),
    getTotalCreators(),
  ]);
  return { totalAgents, posts, apiSaved, active7d, creators };
}

export { API_CALL_SAVINGS_PER_PRO_DEPLOY };
