import { FeaturedCarousel } from '@/components/home/FeaturedCarousel';
import { Hero } from '@/components/home/Hero';
import { LatestGrid } from '@/components/home/LatestGrid';
import { SectionTeasers } from '@/components/home/SectionTeasers';
import { StatsTeaser } from '@/components/home/StatsTeaser';
import { NeonButton } from '@/components/ui/NeonButton';
import { Section, SectionHeader } from '@/components/ui/Section';
import { getAgents, getFeaturedAgents, getLatestAgents } from '@/lib/agents';
import { getStarCounts } from '@/lib/github';
import { getAllTotals, getCounts } from '@/lib/installs';
import type { AgentWithStats } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

async function hydrateStars<T extends { repo: string }>(
  agents: T[]
): Promise<(T & { stars: number; starsFetchedAt: number; starsStale?: boolean })[]> {
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

export default async function Home() {
  const [all, featured, latest] = await Promise.all([
    getAgents(),
    getFeaturedAgents(3),
    getLatestAgents(6),
  ]);

  const [hydratedAll, hydratedFeatured, hydratedLatest] = await Promise.all([
    hydrateStars(all),
    hydrateStars(featured),
    hydrateStars(latest),
  ]);

  const featuredWithStats = hydratedFeatured as AgentWithStats[];
  const latestWithStats = hydratedLatest as AgentWithStats[];

  const [totals, perAgentCounts] = await Promise.all([
    getAllTotals(),
    Promise.all(hydratedAll.map(async (a) => ({ id: a.id, counts: await getCounts(a.id) }))),
  ]);

  const totalInstalls = hydratedAll.reduce((n, a) => {
    const live = perAgentCounts.find((c) => c.id === a.id)?.counts.total ?? 0;
    return n + Math.max(a.installs ?? 0, totals.get(a.id) ?? 0, live);
  }, 0);
  const last24h = perAgentCounts.reduce((n, c) => n + c.counts.last24h, 0);
  const scored = hydratedAll.filter((a) => typeof a.safetyScore === 'number');
  const avgSafetyScore = scored.length
    ? Math.round(scored.reduce((n, a) => n + (a.safetyScore ?? 0), 0) / scored.length)
    : 0;

  return (
    <div className="flex flex-col gap-20 pb-10 md:gap-28">
      <Hero />

      <StatsTeaser
        data={{
          agents: hydratedAll.length,
          installs: totalInstalls,
          last24hInstalls: last24h,
          avgSafetyScore,
        }}
      />

      <Section>
        <SectionHeader
          eyebrow="Sections"
          title="Browse the way you build."
          description="Curated cuts of the marketplace — trending, voice-ready, swarm-ready, and beginner picks."
        />
        <SectionTeasers />
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Featured"
          title="Certified Grok-native, community-loved"
          description="Hand-picked agents that hit our highest certification bars — Grok-Native, Safety-Max, Voice-Ready, or Swarm-Ready."
          action={
            <NeonButton
              variant="secondary"
              size="sm"
              href="/marketplace"
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              View all
            </NeonButton>
          }
        />
        <FeaturedCarousel agents={featuredWithStats} />
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Latest"
          title="Recently shipped"
          description="The newest agents added to the marketplace. Refreshed every 10 minutes."
          action={
            <NeonButton
              variant="secondary"
              size="sm"
              href="/marketplace?sort=newest"
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              See all
            </NeonButton>
          }
        />
        <LatestGrid agents={latestWithStats} />
      </Section>
    </div>
  );
}
