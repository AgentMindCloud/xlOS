import 'server-only';
import { Octokit } from '@octokit/rest';
import { parseRepo } from './utils';

const TTL_MS = 60 * 60 * 1000; // 1 hour
type Entry = { stars: number; at: number; stale?: boolean };
const cache = new Map<string, Entry>();

let octokit: Octokit | null = null;
function client(): Octokit {
  if (octokit) return octokit;
  octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: 'grok-agents-marketplace (grokagents.dev)',
  });
  return octokit;
}

async function fetchOne(repo: string): Promise<number | null> {
  const parsed = parseRepo(repo);
  if (!parsed) return null;
  try {
    const res = await client().repos.get({ owner: parsed.owner, repo: parsed.name });
    return res.data.stargazers_count ?? 0;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[github] ${repo} star fetch failed:`, (err as Error).message);
    }
    return null;
  }
}

/**
 * Returns a map of repo → star count for a batch of repos, served from an
 * in-memory 1-hour cache. On fetch failure the stale cached value is
 * returned (marked stale). Runs fetches in parallel.
 */
export async function getStarCounts(repos: string[]): Promise<Map<string, Entry>> {
  const out = new Map<string, Entry>();
  const now = Date.now();
  const toFetch: string[] = [];

  for (const r of repos) {
    const hit = cache.get(r);
    if (hit && now - hit.at < TTL_MS) {
      out.set(r, hit);
    } else {
      toFetch.push(r);
    }
  }

  const results = await Promise.all(toFetch.map(async (r) => [r, await fetchOne(r)] as const));
  for (const [repo, stars] of results) {
    if (stars === null) {
      const stale = cache.get(repo);
      if (stale) {
        const entry: Entry = { ...stale, stale: true };
        out.set(repo, entry);
      } else {
        out.set(repo, { stars: 0, at: now, stale: true });
      }
    } else {
      const entry: Entry = { stars, at: now };
      cache.set(repo, entry);
      out.set(repo, entry);
    }
  }

  return out;
}
