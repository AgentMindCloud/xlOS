import { AgentCardSkeleton } from '@/components/marketplace/AgentCard';
import { MarketplaceGrid } from '@/components/marketplace/MarketplaceGrid';
import { CircuitTrace } from '@/components/ui/CircuitTrace';
import { NebulaBackdrop } from '@/components/ui/NebulaBackdrop';
import { Section, SectionHeader } from '@/components/ui/Section';
import { getAgents } from '@/lib/agents';
import { getStarCounts } from '@/lib/github';
import type { AgentWithStats } from '@/lib/types';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Marketplace',
  description:
    'Browse the full community catalog of Grok-native agents. Filter by certification, category, and trend.',
};

export const revalidate = 600;

async function loadAgents(): Promise<AgentWithStats[]> {
  const agents = await getAgents();
  const stars = await getStarCounts(agents.map((a) => a.repo));
  return agents.map((a) => {
    const s = stars.get(a.repo);
    return {
      ...a,
      stars: s?.stars ?? 0,
      starsFetchedAt: s?.at ?? Date.now(),
      starsStale: s?.stale,
    };
  });
}

export default async function MarketplacePage() {
  const agents = await loadAgents();

  return (
    <div className="flex flex-col gap-10 pb-10">
      <section className="relative overflow-hidden border-b border-border-subtle">
        <NebulaBackdrop intensity="normal" />
        <CircuitTrace className="opacity-25 mix-blend-screen" density="sparse" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <SectionHeader
            eyebrow="Marketplace"
            title="Every Grok-native agent, one click away."
            description="Search, filter by certification, and compare install counts. New certifications ship weekly."
          />
        </div>
        <div className="plate-divider" aria-hidden />
      </section>

      <Section>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <AgentCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <MarketplaceGrid agents={agents} />
        </Suspense>
      </Section>
    </div>
  );
}
