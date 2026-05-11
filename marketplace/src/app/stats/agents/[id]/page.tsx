import { InstallVolumeChart } from '@/components/stats/InstallVolumeChart';
import { StatsHeadline } from '@/components/stats/StatsHeadline';
import { CertificationBadgeRow } from '@/components/ui/CertificationBadge';
import { CircuitTrace } from '@/components/ui/CircuitTrace';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Section } from '@/components/ui/Section';
import { getAgentById, getAgents } from '@/lib/agents';
import { CATEGORY_LABELS } from '@/lib/constants';
import { getCounts, getDailyCounts } from '@/lib/installs';
import { getTopReferrers, getTopSearchQueries, plausibleConfigured } from '@/lib/plausible';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 300;

export async function generateStaticParams() {
  const agents = await getAgents();
  return agents.map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgentById(id);
  if (!agent) return { title: 'Agent stats not found' };
  return {
    title: `${agent.name} · Stats`,
    description: `Install volume, referrers, and search trends for ${agent.name}.`,
  };
}

export default async function AgentStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getAgentById(id);
  if (!agent) notFound();

  const [counts, daily, referrers, queries] = await Promise.all([
    getCounts(agent.id),
    getDailyCounts(agent.id, 30),
    getTopReferrers('30d', 8),
    getTopSearchQueries('30d', 8),
  ]);
  const agents = await getAgents();
  const installsLifetime = Math.max(agent.installs ?? 0, counts.total);

  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="relative overflow-hidden border-b border-border-subtle">
        <CircuitTrace density="sparse" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <Link
            href="/stats"
            className="inline-flex items-center gap-1.5 text-xs text-ink-subtle hover:text-cyan transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All stats
          </Link>
          <div className="mt-4 flex flex-col gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-cyan">
              Stats · {CATEGORY_LABELS[agent.category]}
            </span>
            <h1 className="font-display text-3xl tracking-tightest text-ink sm:text-4xl">
              {agent.name}
            </h1>
            <p className="max-w-2xl text-ink-muted">{agent.tagline}</p>
            <CertificationBadgeRow slugs={agent.certifications} size="sm" />
          </div>
        </div>
      </section>

      <Section>
        <div className="flex flex-col gap-6">
          <StatsHeadline
            data={{
              agents: 1,
              creators: 1,
              installs: installsLifetime,
              last24hInstalls: counts.last24h,
            }}
          />

          <InstallVolumeChart
            agents={agents.map((a) => ({ id: a.id, name: a.name }))}
            initialSeries={daily}
            initialAgentId={agent.id}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <GlassCard padding="lg" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-cyan">
                    Top referrers · 30d
                  </p>
                  <h3 className="font-display text-xl tracking-tight text-ink">
                    Where the traffic comes from
                  </h3>
                </div>
                {!plausibleConfigured() ? (
                  <span className="rounded-sm border border-border-subtle bg-surface px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-subtle font-mono">
                    Plausible off
                  </span>
                ) : null}
              </div>
              {referrers.length ? (
                <ul className="flex flex-col divide-y divide-border-subtle">
                  {referrers.map((r) => (
                    <li key={r.source} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-ink-muted truncate">{r.source}</span>
                      <span className="font-mono tabular-nums text-cyan">{r.visitors}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-subtle">
                  No referrer data yet. Wire Plausible and referrers show up here within 30 minutes.
                </p>
              )}
            </GlassCard>

            <GlassCard padding="lg" className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-cyan">
                    Top searches · 30d
                  </p>
                  <h3 className="font-display text-xl tracking-tight text-ink">
                    What people typed to find this
                  </h3>
                </div>
                {!plausibleConfigured() ? (
                  <span className="rounded-sm border border-border-subtle bg-surface px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-subtle font-mono">
                    Plausible off
                  </span>
                ) : null}
              </div>
              {queries.length ? (
                <ul className="flex flex-col divide-y divide-border-subtle">
                  {queries.map((r) => (
                    <li key={r.q} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-ink-muted truncate">“{r.q}”</span>
                      <span className="font-mono tabular-nums text-cyan">{r.events}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-subtle">
                  No search data yet — showcase your agent, and the terms people used to find it
                  populate here.
                </p>
              )}
            </GlassCard>
          </div>

          <div className="flex flex-wrap gap-3">
            <NeonButton
              variant="primary"
              size="md"
              href={`/marketplace/${agent.id}`}
              trailingIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
            >
              Open agent page
            </NeonButton>
            <NeonButton
              variant="secondary"
              size="md"
              href={`https://github.com/${agent.repo}`}
              external
            >
              View repo
            </NeonButton>
          </div>
        </div>
      </Section>
    </div>
  );
}
