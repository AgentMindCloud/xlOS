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
import { AccentButton } from '@/components/ui/AccentButton';
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
      <section className="relative overflow-hidden border-b border-ink-300/40">
        <CircuitTrace density="dense" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <SectionHeader
            eyebrow="Adoption Dashboard"
            tone="cinnabar"
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
            elevation="raised"
            padding="lg"
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cinnabar-500/40 cinnabar-gradient-soft text-cinnabar-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-ink-900">
                  v2.14 Visuals Renderer adoption
                </h3>
                <p className="text-sm text-ink-700 mt-1 max-w-2xl leading-relaxed">
                  <span className="font-mono text-cinnabar-400">{v214AgentCount}</span> of{' '}
                  <span className="font-mono text-cinnabar-400">{agents.length}</span> catalogued
                  agents ({v214AdoptionPct}%) ship a{' '}
                  <code className="font-mono text-cinnabar-400">visuals</code> block — the new
                  Preview Card with futuristic / premium / minimal style variants. Browser-side{' '}
                  <code className="font-mono text-cinnabar-400">visuals_block_rendered</code> events
                  are recorded in Plausible; per-preset breakdowns roll out with the next dashboard
                  drop.
                </p>
              </div>
            </div>
            <AccentButton
              variant="secondary"
              size="md"
              href="/marketplace"
              trailingIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
            >
              Browse the marketplace
            </AccentButton>
          </GlassCard>

          <GlassCard
            as="section"
            elevation="raised"
            padding="lg"
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cinnabar-500/40 cinnabar-gradient-soft text-cinnabar-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-ink-900">
                  Every number here is public, anonymous, and revocable.
                </h3>
                <p className="text-sm text-ink-700 mt-1 max-w-2xl leading-relaxed">
                  We don&apos;t store IPs or personally identifying data. The CLI can be run with{' '}
                  <code className="font-mono text-cinnabar-400">--no-telemetry</code> to opt out,
                  and events older than 90 days are purged.
                </p>
              </div>
            </div>
            <AccentButton
              variant="secondary"
              size="md"
              href="/privacy"
              trailingIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
            >
              Read our privacy pledge
            </AccentButton>
          </GlassCard>

          <div className="flex flex-col items-start gap-2 text-[11px] font-mono text-ink-600">
            <span>
              Catalogue stars across {agents.length} repos ·{' '}
              <Link href="/marketplace" className="text-cinnabar-400 hover:underline">
                {starsTotal.toLocaleString()}★
              </Link>
            </span>
            <span>
              Public JSON API:{' '}
              <Link
                href="/api/stats/public"
                className="text-cinnabar-400 hover:underline"
                prefetch={false}
              >
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
