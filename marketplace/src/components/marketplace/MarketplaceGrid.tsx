'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { AccentButton } from '@/components/ui/AccentButton';
import { trackFilter, trackSearch } from '@/lib/tracking';
import type { AgentWithStats, Category, Certification, SortKey } from '@/lib/types';
import { debounce, fuzzyMatch } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { AgentCard } from './AgentCard';
import { FilterPills } from './FilterPills';
import { SearchBar } from './SearchBar';

const VALID_SORT: SortKey[] = ['trending', 'newest', 'most-installed'];

function parseList<T extends string>(raw: string | null, all: readonly T[]): T[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is T => (all as readonly string[]).includes(s));
}

const ALL_CATEGORIES: Category[] = [
  'productivity',
  'research',
  'content',
  'developer',
  'voice',
  'swarm',
  'analytics',
  'marketing',
  'education',
];

const ALL_CERTS: Certification[] = [
  'grok-native',
  'safety-max',
  'voice-ready',
  'swarm-ready',
  'action-certified',
  'vscode-verified',
];

export function MarketplaceGrid({ agents }: { agents: AgentWithStats[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(params.get('q') ?? '');
  const [categories, setCategories] = useState<Category[]>(
    parseList<Category>(params.get('cat'), ALL_CATEGORIES)
  );
  const [certifications, setCertifications] = useState<Certification[]>(
    parseList<Certification>(params.get('cert'), ALL_CERTS)
  );
  const [sort, setSort] = useState<SortKey>(() => {
    const s = params.get('sort');
    return VALID_SORT.includes(s as SortKey) ? (s as SortKey) : 'trending';
  });

  // Sync state to URL (debounced-ish via transition)
  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (categories.length) sp.set('cat', categories.join(','));
    if (certifications.length) sp.set('cert', certifications.join(','));
    if (sort !== 'trending') sp.set('sort', sort);
    const qs = sp.toString();
    startTransition(() => {
      router.replace(`/marketplace${qs ? `?${qs}` : ''}` as never, { scroll: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categories, certifications, sort]);

  const visible = useMemo(() => {
    let list = agents;
    if (q.trim()) {
      list = list.filter((a) =>
        fuzzyMatch([a.name, a.tagline, a.creator.handle, ...a.tags].join(' '), q)
      );
    }
    if (categories.length) list = list.filter((a) => categories.includes(a.category));
    if (certifications.length) {
      list = list.filter((a) => certifications.every((c) => a.certifications.includes(c)));
    }
    const sorted = [...list];
    if (sort === 'newest') {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'most-installed') {
      sorted.sort((a, b) => b.installs - a.installs);
    } else {
      // trending = weighted installs + stars recency
      sorted.sort((a, b) => b.installs + b.stars * 2 - (a.installs + a.stars * 2));
    }
    return sorted;
  }, [agents, q, categories, certifications, sort]);

  const toggleCategory = (c: Category) => {
    setCategories((xs) => (xs.includes(c) ? xs.filter((x) => x !== c) : [...xs, c]));
    trackFilter('category', c);
  };
  const toggleCert = (c: Certification) => {
    setCertifications((xs) => (xs.includes(c) ? xs.filter((x) => x !== c) : [...xs, c]));
    trackFilter('certification', c);
  };
  const onSortChange = (s: SortKey) => {
    setSort(s);
    trackFilter('sort', s);
  };
  const clearAll = () => {
    setQ('');
    setCategories([]);
    setCertifications([]);
    setSort('trending');
  };

  const searchDebounceRef = useRef<((q: string) => void) | null>(null);
  if (!searchDebounceRef.current) {
    searchDebounceRef.current = debounce((next: string) => trackSearch(next), 600);
  }
  const onSearchChange = (next: string) => {
    setQ(next);
    searchDebounceRef.current?.(next);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <SearchBar value={q} onChange={onSearchChange} />
        <FilterPills
          categories={categories}
          certifications={certifications}
          sort={sort}
          onToggleCategory={toggleCategory}
          onToggleCertification={toggleCert}
          onSort={onSortChange}
          onClear={clearAll}
        />
      </aside>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-mono text-xs text-ink-600">
            Showing <span className="text-ink-900 tabular-nums">{visible.length}</span> of{' '}
            <span className="text-ink-900 tabular-nums">{agents.length}</span> agents
          </span>
        </div>

        {visible.length === 0 ? (
          <GlassCard
            elevation="lifted"
            padding="lg"
            className="flex flex-col items-center gap-3 py-16 text-center"
          >
            <p className="font-display text-2xl font-semibold cinnabar-text">
              No agents match those filters.
            </p>
            <p className="text-sm text-ink-700 max-w-md leading-relaxed">
              Try clearing a filter — or help us grow the gallery by submitting yours.
            </p>
            <div className="flex gap-2 pt-2">
              <AccentButton variant="secondary" size="sm" onClick={clearAll}>
                Clear filters
              </AccentButton>
              <AccentButton variant="primary" size="sm" href="/submit">
                Submit an agent
              </AccentButton>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 lg:gap-7">
            {visible.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}

        <GlassCard
          as="section"
          elevation="lifted"
          padding="lg"
          className="relative mt-6 overflow-hidden flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="absolute inset-x-0 top-0 plate-divider" aria-hidden />
          <div>
            <h3 className="font-display text-xl font-semibold text-ink-900">
              Shipping a <span className="cinnabar-text">Grok-native</span> agent?
            </h3>
            <p className="text-sm text-ink-700 mt-1 max-w-xl leading-relaxed">
              Open a PR against awesome-grok-agents with your YAML manifest. We review weekly and
              boost new certs in the weekly digest.
            </p>
          </div>
          <AccentButton variant="primary" size="md" href="/submit">
            Submit your agent
          </AccentButton>
        </GlassCard>
      </div>
    </div>
  );
}
