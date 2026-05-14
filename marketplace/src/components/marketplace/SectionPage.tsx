import { AgentCard } from '@/components/marketplace/AgentCard';
import { CircuitTrace } from '@/components/ui/CircuitTrace';
import { GlassCard } from '@/components/ui/GlassCard';
import { NebulaBackdrop } from '@/components/ui/NebulaBackdrop';
import { AccentButton } from '@/components/ui/AccentButton';
import { Section, SectionHeader } from '@/components/ui/Section';
import { getStarCounts } from '@/lib/github';
import type { SectionMeta } from '@/lib/sections';
import type { Agent, AgentWithStats } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export async function SectionPage({
  meta,
  agents,
}: {
  meta: SectionMeta;
  agents: Agent[];
}) {
  const stars = await getStarCounts(agents.map((a) => a.repo));
  const hydrated: AgentWithStats[] = agents.map((a) => {
    const s = stars.get(a.repo);
    return {
      ...a,
      stars: s?.stars ?? 0,
      starsFetchedAt: s?.at ?? Date.now(),
      starsStale: s?.stale,
    };
  });

  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="relative overflow-hidden border-b border-ink-300/40">
        <NebulaBackdrop intensity="normal" />
        <CircuitTrace className="opacity-25 mix-blend-screen" density="sparse" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-10">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-600 hover:text-cinnabar-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Marketplace
          </Link>
          <div className="mt-6">
            <GlassCard elevation="raised" padding="lg" className="cinnabar-gradient-soft">
              <SectionHeader
                eyebrow={meta.eyebrow}
                title={meta.title}
                description={meta.description}
                tone="cinnabar"
                className="mb-0"
              />
            </GlassCard>
          </div>
        </div>
        <div className="plate-divider" aria-hidden />
      </section>

      <Section>
        {hydrated.length === 0 ? (
          <GlassCard
            elevation="lifted"
            padding="lg"
            className="flex flex-col items-center gap-3 py-16 text-center"
          >
            <p className="font-display text-2xl font-semibold cinnabar-text">
              Nothing to show here yet.
            </p>
            <p className="text-sm text-ink-700 max-w-md leading-relaxed">
              This section fills in as new agents ship. Be the first — submit yours.
            </p>
            <AccentButton variant="primary" size="sm" href="/submit">
              Submit an agent
            </AccentButton>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 lg:gap-7">
            {hydrated.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
