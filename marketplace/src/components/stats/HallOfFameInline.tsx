import { GlassCard } from '@/components/ui/GlassCard';
import { StatPill } from '@/components/ui/StatPill';
import { cn, formatCount } from '@/lib/utils';
import { ArrowUpRight, Crown, Medal, Trophy } from 'lucide-react';
import Link from 'next/link';

export interface HallOfFameEntry {
  id: string;
  name: string;
  category: string;
  installs: number;
  creator: string;
}

export function HallOfFameInline({ entries }: { entries: HallOfFameEntry[] }) {
  const top = entries.slice(0, 10);

  return (
    <GlassCard padding="lg" className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cinnabar-400">
            Hall of Fame
          </p>
          <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900">
            Top 10 by install count
          </h3>
        </div>
        <Link
          href="/hall-of-fame"
          className="inline-flex items-center gap-1 font-mono text-xs text-cinnabar-400 hover:text-cinnabar-300 hover:underline transition-colors"
        >
          Open full leaderboard <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <ol className="flex flex-col divide-y divide-ink-300/40">
        {top.map((e, i) => {
          const rank = i + 1;
          return (
            <li key={e.id}>
              <Link
                href={`/marketplace/${e.id}` as never}
                className="group flex items-center gap-3 py-2.5 transition-colors hover:bg-ink-100/60 rounded-sm px-1 -mx-1"
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border text-[10px] font-mono',
                    rank === 1 &&
                      'cinnabar-gradient text-ink-900 border-cinnabar-500 shadow-cinnabar-glow-soft',
                    rank === 2 && 'border-cinnabar-400/60 text-cinnabar-400',
                    rank === 3 && 'border-cinnabar-500/40 text-cinnabar-500',
                    rank > 3 && 'border-ink-300 text-ink-600'
                  )}
                >
                  {rank === 1 ? (
                    <Crown className="h-3 w-3" />
                  ) : rank === 2 ? (
                    <Trophy className="h-3 w-3" />
                  ) : rank === 3 ? (
                    <Medal className="h-3 w-3" />
                  ) : (
                    rank
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink-900 group-hover:text-cinnabar-300 transition-colors">
                  {e.name}
                </span>
                <span className="hidden text-[11px] text-ink-600 sm:inline truncate max-w-[28ch] font-mono">
                  {e.creator}
                </span>
                <StatPill value={formatCount(e.installs)} tone="cinnabar" />
              </Link>
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
}
