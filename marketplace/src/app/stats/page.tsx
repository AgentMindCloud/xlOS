import { CategoryBar } from '@/components/stats/CategoryBar';
import { type CsvRow, ExportCsvButton } from '@/components/stats/ExportCsvButton';
import { GrowthChart } from '@/components/stats/GrowthChart';
import { HallOfFameInline } from '@/components/stats/HallOfFameInline';
import { HeatmapGrid } from '@/components/stats/HeatmapGrid';
import { ImpactStories } from '@/components/stats/ImpactStories';
import { LiveCounters } from '@/components/stats/LiveCounters';
import { ProVsStandardArea } from '@/components/stats/ProVsStandardArea';
import { SafetyDistribution } from '@/components/stats/SafetyDistribution';
import { SnapshotButton } from '@/components/stats/SnapshotButton';
import { CircuitTrace } from '@/components/ui/CircuitTrace';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Section, SectionHeader } from '@/components/ui/Section';
import { getAgents } from '@/lib/agents';
import { SITE_URL } from '@/lib/constants';
import { getStarCounts } from '@/lib/github';
import { getAllTotals, getCounts } from '@/lib/installs';
import {
  getCategoryBreakdown,
  getGrowthSeries,
  getHeadline,
  getHeatmapData,
  getProVsStandardSeries,
} from '@/lib/telemetry-queries';
import { ArrowUpRight, Shield, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const revalidate = 30;

export const metadata: Metadata = {
  title: 'Adoption Dashboard',
  description:
    'Live impact of Grok-native agents on X — installs, posts, API calls saved, and the 7-day activity pulse.',
};

export default async function StatsPage() {
  const [agents, totals, headline, growth, proVsStandard, categories, heatmap] = await Promise.all([
    getAgents(),
    getAllTotals(),
    getHeadline(),
    getGrowthSeries('30d', 'installs'),
    getProVsStandardSeries('30d'),
    getCategoryBreakdown(),
    getHeatmapData(),
  ]);

  const perAgent = await Promise.all(
    agents.map(async (a) => {
      const counts = await getCounts(a.id);
      const merged = Math.max(a.installs ?? 0, totals.get(a.id) ?? 0, counts.total);
      return { agent: a, counts, merged };
    })
  );
  const stars = await getStarCounts(agents.map((a) => a.repo));

  const ranked = [...perAgent].sort((a, b) => b.merged - a.merged);
  const hofEntries = ranked.slice(0, 10).map((r) => ({
    id: r.agent.id,
    name: r.agent.name,
    category: r.agent.category,
    installs: r.merged,
    creator: r.agent.creator.handle,
  }));

  const csvRows: CsvRow[] = perAgent.map((r) => ({
    id: r.agent.id,
    name: r.agent.name,
    category: r.agent.category,
    installs: r.merged,
    last7d: r.counts.last7d,
    last24h: r.counts.last24h,
    safetyScore: r.agent.safetyScore ?? null,
  }));

  const safetyScores = agents
    .map((a) => a.safetyScore)
    .filter((s): s is number => typeof s === 'number');

  const starsTotal = Array.from(stars.values()).reduce((n, s) => n + s.stars, 0);

  // v2.14 adoption: agents in the catalog that have opted into the new
  // Visuals Renderer surface. Browser-side `visuals_block_rendered` events
  // will be exposed once telemetry-queries.ts grows a Plausible hook — for
  // now we report the catalog-side adoption directly.
  const v214AgentCount = agents.filter((a) => a.visuals !== undefined).length;
  const v214AdoptionPct =
    agents.length > 0 ? Math.round((v214AgentCount / agents.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="relative overflow-hidden border-b border-border-subtle">
        <CircuitTrace density="dense" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <SectionHeader
            eyebrow="Adoption Dashboard"
            title="Live impact of Grok-native agents on X."
            description="Every install signal flows from the grok-install CLI into the marketplace. Counters refresh every 30 seconds; the rest is 30-minute aggregates."
            action={
              <div className="flex flex-wrap gap-2">
                <SnapshotButton siteUrl={SITE_URL} />
                <ExportCsvButton rows={csvRows} />
              </div>
            }
          />
        </div>
      </section>

      <Section>
        <div className="flex flex-col gap-6">
          <LiveCounters
            fallback={{
              agentsInstalled: headline.totalAgents,
              xPostsGenerated: headline.posts,
              apiCallsSaved: headline.apiSaved,
              activeAgents7d: headline.active7d,
            }}
          />

          <ImpactStories
            categories={categories}
            posts={headline.posts}
            apiSaved={headline.apiSaved}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <GrowthChart initialSeries={growth} initialPeriod="30d" initialMetric="installs" />
            <ProVsStandardArea series={proVsStandard} />
            <CategoryBar data={categories} />
            <SafetyDistribution scores={safetyScores} />
          </div>

          <HeatmapGrid data={heatmap} />

          <HallOfFameInline entries={hofEntries} />

          <GlassCard
            as="section"
            padding="lg"
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan/40 bg-cyan/5 text-cyan">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg tracking-tight text-ink">
                  v2.14 Visuals Renderer adoption
                </h3>
                <p className="text-sm text-ink-muted mt-1 max-w-2xl">
                  <span className="font-mono text-cyan">{v214AgentCount}</span> of{' '}
                  <span className="font-mono text-cyan">{agents.length}</span> catalogued agents (
                  {v214AdoptionPct}%) ship a <code className="font-mono text-cyan">visuals</code>{' '}
                  block — the new Preview Card with futuristic / premium / minimal style variants.
                  Browser-side <code className="font-mono text-cyan">visuals_block_rendered</code>{' '}
                  events are recorded in Plausible; per-preset breakdowns roll out with the next
                  dashboard drop.
                </p>
              </div>
            </div>
            <NeonButton
              variant="secondary"
              size="md"
              href="/marketplace"
              trailingIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
            >
              Browse the marketplace
            </NeonButton>
          </GlassCard>

          <GlassCard
            as="section"
            padding="lg"
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan/40 bg-cyan/5 text-cyan">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg tracking-tight text-ink">
                  Every number here is public, anonymous, and revocable.
                </h3>
                <p className="text-sm text-ink-muted mt-1 max-w-2xl">
                  We don't store IPs or personally identifying data. The CLI can be run with{' '}
                  <code className="font-mono text-cyan">--no-telemetry</code> to opt out, and events
                  older than 90 days are purged.
                </p>
              </div>
            </div>
            <NeonButton
              variant="secondary"
              size="md"
              href="/privacy"
              trailingIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
            >
              Read our privacy pledge
            </NeonButton>
          </GlassCard>

          <div className="flex flex-col items-start gap-2 text-[11px] text-ink-subtle">
            <span>
              Catalogue stars across {agents.length} repos ·{' '}
              <Link href="/marketplace" className="text-cyan hover:underline">
                {starsTotal.toLocaleString()}★
              </Link>
            </span>
            <span>
              Public JSON API:{' '}
              <Link href="/api/stats/public" className="text-cyan hover:underline" prefetch={false}>
                /api/stats/public
              </Link>{' '}
              · Rate-limited, CORS-enabled, cached for 30s.
            </span>
          </div>
        </div>
      </Section>
    </div>
  );
}
