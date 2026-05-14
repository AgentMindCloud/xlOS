import { CertificationBadgeRow } from '@/components/ui/CertificationBadge';
import { GlassCard } from '@/components/ui/GlassCard';
import { CATEGORY_LABELS } from '@/lib/constants';
import type { AgentWithStats } from '@/lib/types';
import { formatCount } from '@/lib/utils';
import { ArrowUpRight, Download, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function AgentCard({ agent }: { agent: AgentWithStats }) {
  return (
    <GlassCard
      as="article"
      elevation="raised"
      interactive
      padding="md"
      className="group flex flex-col gap-4 animate-fade-in-up border-ink-300/60 hover:border-cinnabar-500/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {agent.creator.avatar ? (
            <Image
              src={agent.creator.avatar}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-sm border border-ink-300"
              unoptimized
            />
          ) : (
            <div
              aria-hidden
              className="h-7 w-7 rounded-sm border border-cinnabar-500/30 cinnabar-gradient-soft"
            />
          )}
          <span className="font-mono text-xs text-ink-600 truncate">{agent.creator.handle}</span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-cinnabar-400">
          {CATEGORY_LABELS[agent.category]}
        </span>
      </div>

      <Link
        href={`/marketplace/${agent.id}` as never}
        aria-label={`View ${agent.name}: ${agent.tagline}`}
        className="flex flex-col gap-2"
      >
        <h3 className="font-display text-lg font-semibold tracking-tight text-ink-900 group-hover:text-cinnabar-300 transition-colors">
          {agent.name}
        </h3>
        <p className="text-sm text-ink-700 leading-relaxed line-clamp-2">{agent.tagline}</p>
      </Link>

      <CertificationBadgeRow slugs={agent.certifications} max={3} size="sm" />

      <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-ink-300/40">
        <div className="flex items-center gap-3 font-mono text-xs text-ink-600">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Star className="h-3.5 w-3.5" aria-hidden />
            {formatCount(agent.stars)}
          </span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Download className="h-3.5 w-3.5" aria-hidden />
            {formatCount(agent.installs)}
          </span>
        </div>
        <Link
          href={`/marketplace/${agent.id}` as never}
          className="inline-flex items-center gap-1 text-sm font-medium text-cinnabar-400 hover:text-cinnabar-300 transition-colors"
          aria-hidden
          tabIndex={-1}
        >
          Details <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </GlassCard>
  );
}

export function AgentCardSkeleton() {
  return (
    <GlassCard padding="md" className="flex flex-col gap-4">
      <div className="h-7 w-24 shimmer rounded-sm bg-ink-200" />
      <div className="h-6 w-3/4 shimmer rounded-sm bg-ink-200" />
      <div className="h-4 w-full shimmer rounded-sm bg-ink-200" />
      <div className="h-4 w-5/6 shimmer rounded-sm bg-ink-200" />
      <div className="flex gap-1.5">
        <div className="h-6 w-20 shimmer rounded-sm bg-ink-200" />
        <div className="h-6 w-20 shimmer rounded-sm bg-ink-200" />
      </div>
      <div className="flex justify-between pt-2">
        <div className="h-6 w-20 shimmer rounded-sm bg-ink-200" />
        <div className="h-6 w-16 shimmer rounded-sm bg-ink-200" />
      </div>
    </GlassCard>
  );
}
