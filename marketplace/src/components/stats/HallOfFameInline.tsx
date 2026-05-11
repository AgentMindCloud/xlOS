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
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-cyan">Hall of Fame</p>
          <h3 className="font-display text-xl tracking-tight text-ink">Top 10 by install count</h3>
        </div>
        <Link
          href="/hall-of-fame"
          className="inline-flex items-center gap-1 text-xs text-cyan hover:underline"
        >
          Open full leaderboard <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <ol className="flex flex-col divide-y divide-border-subtle">
        {top.map((e, i) => {
          const rank = i + 1;
          return (
            <li key={e.id}>
              <Link
                href={`/marketplace/${e.id}` as never}
                className="group flex items-center gap-3 py-2.5 transition-colors hover:bg-surface rounded-sm px-1 -mx-1"
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border text-[10px] font-mono',
                    rank === 1 && 'border-cyan text-cyan shadow-cyanGlowSoft',
                    rank === 2 && 'border-cyan/60 text-cyan',
                    rank === 3 && 'border-green/60 text-green',
                    rank > 3 && 'border-border-subtle text-ink-subtle'
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
                <span className="min-w-0 flex-1 truncate text-sm text-ink group-hover:text-cyan transition-colors">
                  {e.name}
                </span>
                <span className="hidden text-[11px] text-ink-subtle sm:inline truncate max-w-[28ch]">
                  {e.creator}
                </span>
                <StatPill value={formatCount(e.installs)} tone="green" />
              </Link>
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
}
