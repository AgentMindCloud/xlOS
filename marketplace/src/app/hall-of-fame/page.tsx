import { CertificationBadgeRow } from '@/components/ui/CertificationBadge';
import { CircuitTrace } from '@/components/ui/CircuitTrace';
import { GlassCard } from '@/components/ui/GlassCard';
import { Section, SectionHeader } from '@/components/ui/Section';
import { StatPill } from '@/components/ui/StatPill';
import { getAgents } from '@/lib/agents';
import { getStarCounts } from '@/lib/github';
import { getAllTotals } from '@/lib/installs';
import { cn, formatCount } from '@/lib/utils';
import { Crown, Medal, Star, Trophy } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Hall of Fame',
  description: 'The top-installed Grok-native agents of all time.',
};

function rankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-4 w-4" aria-hidden />;
  if (rank === 2) return <Trophy className="h-4 w-4" aria-hidden />;
  if (rank === 3) return <Medal className="h-4 w-4" aria-hidden />;
  return <Star className="h-4 w-4" aria-hidden />;
}

function rankTone(rank: number) {
  if (rank === 1) return 'from-cinnabar-500/30 via-cinnabar-500/10';
  if (rank === 2) return 'from-cinnabar-400/20 via-cinnabar-400/5';
  if (rank === 3) return 'from-cinnabar-600/20 via-cinnabar-600/5';
  return 'from-ink-100 via-ink-100';
}

export default async function HallOfFamePage() {
  const [agents, totals, starsMaybe] = await Promise.all([
    getAgents(),
    getAllTotals(),
    Promise.resolve(null),
  ]);
  const withTotals = agents.map((a) => ({
    ...a,
    installs: Math.max(a.installs ?? 0, totals.get(a.id) ?? 0),
  }));
  const ranked = [...withTotals].sort((a, b) => b.installs - a.installs).slice(0, 10);
  const stars = await getStarCounts(ranked.map((r) => r.repo));
  void starsMaybe;

  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="relative overflow-hidden border-b border-ink-300/40">
        <CircuitTrace density="dense" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <SectionHeader
            eyebrow="Hall of Fame"
            tone="cinnabar"
            title="The 10 most-installed agents of all time."
            description="A rolling leaderboard powered by live install signals. Updated every 5 minutes."
          />
        </div>
      </section>

      <Section>
        <ol className="grid grid-cols-1 gap-4">
          {ranked.map((agent, i) => {
            const rank = i + 1;
            const starCount = stars.get(agent.repo)?.stars ?? 0;
            return (
              <li key={agent.id} className="group">
                <Link
                  href={`/marketplace/${agent.id}` as never}
                  aria-label={`${agent.name} — rank ${rank}`}
                >
                  <GlassCard
                    padding="lg"
                    interactive
                    elevation={rank <= 3 ? 'lifted' : 'raised'}
                    className={cn(
                      'relative overflow-hidden flex flex-col gap-4 md:flex-row md:items-center md:gap-6',
                      'before:pointer-events-none before:absolute before:inset-0 before:-z-[1]',
                      'before:bg-gradient-to-r before:to-transparent',
                      `before:${rankTone(rank)}`
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-md border',
                        rank === 1 &&
                          'cinnabar-gradient text-ink-900 border-cinnabar-500 shadow-cinnabar-glow',
                        rank === 2 && 'border-cinnabar-400/60 text-cinnabar-400',
                        rank === 3 && 'border-cinnabar-500/40 text-cinnabar-500',
                        rank > 3 && 'border-ink-300 text-ink-700'
                      )}
                    >
                      <span className="flex flex-col items-center leading-none">
                        {rankIcon(rank)}
                        <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] font-mono">
                          #{rank}
                        </span>
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {agent.creator.avatar ? (
                          <Image
                            src={agent.creator.avatar}
                            alt=""
                            width={20}
                            height={20}
                            className="h-5 w-5 rounded-sm border border-ink-300"
                            unoptimized
                          />
                        ) : null}
                        <span className="font-mono text-xs text-ink-600 truncate">
                          {agent.creator.handle}
                        </span>
                      </div>
                      <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900 group-hover:text-cinnabar-300 transition-colors md:text-2xl">
                        {agent.name}
                      </h2>
                      <p className="text-sm text-ink-700 line-clamp-2 leading-relaxed">
                        {agent.tagline}
                      </p>
                      <CertificationBadgeRow
                        slugs={agent.certifications}
                        max={4}
                        size="sm"
                        className="mt-1"
                      />
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <StatPill
                        value={formatCount(agent.installs)}
                        label="installs"
                        tone="cinnabar"
                      />
                      <StatPill value={formatCount(starCount)} label="stars" tone="neutral" />
                    </div>
                  </GlassCard>
                </Link>
              </li>
            );
          })}
        </ol>
      </Section>
    </div>
  );
}
