import { CertificationBadgeRow } from '@/components/ui/CertificationBadge';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatPill } from '@/components/ui/StatPill';
import { CATEGORY_LABELS } from '@/lib/constants';
import type { AgentWithStats } from '@/lib/types';
import { formatCount } from '@/lib/utils';
import { ArrowUpRight, Download, Star } from 'lucide-react';
import Link from 'next/link';

export function FeaturedCarousel({ agents }: { agents: AgentWithStats[] }) {
  if (agents.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
      {agents.map((agent, idx) => (
        <Link key={agent.id} href={`/marketplace/${agent.id}` as never} className="group">
          <GlassCard
            elevation={idx === 0 ? 'hero' : 'default'}
            interactive
            padding="lg"
            className="flex h-full flex-col gap-5"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cinnabar-300">
                {CATEGORY_LABELS[agent.category]}
              </span>
              <ArrowUpRight className="h-4 w-4 text-ink-600 transition-colors group-hover:text-cinnabar-400" />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-display text-2xl tracking-tight text-ink-900 transition-colors group-hover:text-cinnabar-400">
                {agent.name}
              </h3>
              <p className="text-sm text-ink-700">{agent.tagline}</p>
            </div>

            <CertificationBadgeRow slugs={agent.certifications} max={4} size="sm" />

            <div className="mt-auto flex items-center gap-1.5 pt-2">
              <StatPill icon={<Star />} value={formatCount(agent.stars)} tone="aurora" />
              <StatPill icon={<Download />} value={formatCount(agent.installs)} tone="plasma" />
            </div>
          </GlassCard>
        </Link>
      ))}
    </div>
  );
}
