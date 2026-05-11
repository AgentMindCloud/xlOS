import { CertificationBadgeRow } from '@/components/ui/CertificationBadge';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatPill } from '@/components/ui/StatPill';
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
      interactive
      padding="md"
      className="group flex flex-col gap-4 animate-fade-in-up"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {agent.creator.avatar ? (
            <Image
              src={agent.creator.avatar}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-sm border border-border-subtle"
              unoptimized
            />
          ) : (
            <div
              aria-hidden
              className="h-7 w-7 rounded-sm border border-plasma/30 bg-halftone-plasma"
            />
          )}
          <span className="text-xs text-ink-subtle truncate">{agent.creator.handle}</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-aurora font-mono">
          {CATEGORY_LABELS[agent.category]}
        </span>
      </div>

      <Link href={`/marketplace/${agent.id}` as never} className="flex flex-col gap-2">
        <h3 className="font-display text-xl tracking-tight text-ink group-hover:text-plasma transition-colors">
          {agent.name}
        </h3>
        <p className="text-sm text-ink-muted line-clamp-2">{agent.tagline}</p>
      </Link>

      <CertificationBadgeRow slugs={agent.certifications} max={3} size="sm" />

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-1.5">
          <StatPill
            icon={<Star className="fill-aurora/30" />}
            value={formatCount(agent.stars)}
            tone="aurora"
          />
          <StatPill icon={<Download />} value={formatCount(agent.installs)} tone="plasma" />
        </div>
        <Link
          href={`/marketplace/${agent.id}` as never}
          className="inline-flex items-center gap-1 text-sm text-plasma hover:underline font-medium"
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
      <div className="h-7 w-24 shimmer rounded-sm" />
      <div className="h-6 w-3/4 shimmer rounded-sm" />
      <div className="h-4 w-full shimmer rounded-sm" />
      <div className="h-4 w-5/6 shimmer rounded-sm" />
      <div className="flex gap-1.5">
        <div className="h-6 w-20 shimmer rounded-sm" />
        <div className="h-6 w-20 shimmer rounded-sm" />
      </div>
      <div className="flex justify-between pt-2">
        <div className="h-6 w-20 shimmer rounded-sm" />
        <div className="h-6 w-16 shimmer rounded-sm" />
      </div>
    </GlassCard>
  );
}
