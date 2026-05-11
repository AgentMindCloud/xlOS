import 'server-only';

/**
 * Thin wrapper over the Plausible Stats API. Returns `null` whenever
 * PLAUSIBLE_API_KEY or NEXT_PUBLIC_PLAUSIBLE_DOMAIN are missing, so callers
 * can degrade gracefully. Results cached 60s via fetch's Next.js integration.
 */

const BASE = 'https://plausible.io';

function configured(): { site: string; key: string; host: string } | null {
  const site = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const key = process.env.PLAUSIBLE_API_KEY;
  const host = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST ?? BASE;
  if (!site || !key) return null;
  return { site, key, host };
}

async function call<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const cfg = configured();
  if (!cfg) return null;
  const url = new URL(`${cfg.host}/api/v1/stats/${path}`);
  url.searchParams.set('site_id', cfg.site);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${cfg.key}` },
      next: { revalidate: 60, tags: ['plausible'] },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface PlausibleResults<T> {
  results: T[];
}

export async function getTopReferrers(period = '30d', limit = 6) {
  const data = await call<PlausibleResults<{ source: string; visitors: number }>>('breakdown', {
    period,
    property: 'visit:source',
    metrics: 'visitors',
    limit: String(limit),
  });
  return data?.results ?? [];
}

export async function getTopSearchQueries(period = '30d', limit = 6) {
  const data = await call<PlausibleResults<{ q: string; events: number }>>('breakdown', {
    period,
    property: 'event:props:q',
    filters: 'event:name==search_used',
    metrics: 'events',
    limit: String(limit),
  });
  return data?.results ?? [];
}

export async function getSectionFunnel(period = '30d') {
  const events = ['pageview', 'agent_viewed', 'install_clicked'] as const;
  const rows = await Promise.all(
    events.map(async (name) => {
      const data = await call<{ results: { events: number } }>('aggregate', {
        period,
        metrics: 'events',
        filters: name === 'pageview' ? '' : `event:name==${name}`,
      });
      return { name, count: data?.results?.events ?? 0 };
    })
  );
  return rows;
}

export function plausibleConfigured(): boolean {
  return configured() !== null;
}
