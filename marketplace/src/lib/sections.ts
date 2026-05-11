import 'server-only';
import { getAgents } from './agents';
import { getAllTotals } from './installs';
import type { Agent, Certification } from './types';

export type SectionSlug = 'trending' | 'voice' | 'swarm' | 'new' | 'beginner';

export interface SectionMeta {
  slug: SectionSlug;
  title: string;
  eyebrow: string;
  description: string;
}

export const SECTIONS: Record<SectionSlug, SectionMeta> = {
  trending: {
    slug: 'trending',
    title: 'Trending this week',
    eyebrow: 'Trending',
    description: 'Agents getting the most install intents over the last 7 days.',
  },
  voice: {
    slug: 'voice',
    title: 'Voice-ready agents',
    eyebrow: 'Voice',
    description:
      'Hands-free agents shipping the Voice-Ready v1.2 spec — wake-word, barge-in, structured commands.',
  },
  swarm: {
    slug: 'swarm',
    title: 'Swarm-ready agents',
    eyebrow: 'Swarm',
    description: 'Multi-agent deployments coordinated via the Swarm-Ready v1 spec.',
  },
  new: {
    slug: 'new',
    title: 'New this month',
    eyebrow: 'New',
    description: 'Freshly shipped agents — the newest of the new.',
  },
  beginner: {
    slug: 'beginner',
    title: 'Beginner-friendly',
    eyebrow: 'Start here',
    description:
      'Low-friction picks for your first install on X. Tagged #beginner-friendly by their creators.',
  },
};

const MS_DAY = 24 * 60 * 60 * 1000;

function hasCert(a: Agent, c: Certification) {
  return a.certifications.includes(c);
}

async function fetchTrendingManifest(): Promise<string[] | null> {
  const url =
    'https://raw.githubusercontent.com/AgentMindCloud/awesome-grok-agents/main/trending.json';
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (Array.isArray(data) && data.every((x) => typeof x === 'string')) {
      return data as string[];
    }
    if (
      data &&
      typeof data === 'object' &&
      'agents' in (data as Record<string, unknown>) &&
      Array.isArray((data as { agents?: unknown[] }).agents)
    ) {
      return (data as { agents: unknown[] }).agents.filter(
        (x): x is string => typeof x === 'string'
      );
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSectionAgents(slug: SectionSlug): Promise<Agent[]> {
  const all = await getAgents();
  if (slug === 'trending') {
    const manifest = await fetchTrendingManifest();
    if (manifest?.length) {
      const order = new Map(manifest.map((id, i) => [id, i]));
      return all
        .filter((a) => order.has(a.id))
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    }
    // Fallback: merge live install counts with static count, rank by (installs + stars*2)
    const totals = await getAllTotals();
    return [...all]
      .map((a) => ({ ...a, installs: Math.max(a.installs ?? 0, totals.get(a.id) ?? 0) }))
      .sort((a, b) => b.installs - a.installs);
  }

  if (slug === 'voice') return all.filter((a) => hasCert(a, 'voice-ready'));
  if (slug === 'swarm') return all.filter((a) => hasCert(a, 'swarm-ready'));

  if (slug === 'new') {
    const cutoff = Date.now() - 30 * MS_DAY;
    const within = all
      .filter((a) => new Date(a.created_at).getTime() >= cutoff)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (within.length) return within;
    return [...all]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);
  }

  if (slug === 'beginner') {
    return all.filter((a) => a.tags.includes('beginner-friendly'));
  }

  return all;
}
