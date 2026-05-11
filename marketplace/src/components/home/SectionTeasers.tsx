import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Flame, Mic, Network, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';

const TEASERS = [
  {
    href: '/marketplace/sections/trending',
    title: 'Trending',
    blurb: 'Most install-intents in the last 7 days.',
    icon: Flame,
    tone: 'plasma',
  },
  {
    href: '/marketplace/sections/voice',
    title: 'Voice-ready',
    blurb: 'Hands-free, wake-word, barge-in.',
    icon: Mic,
    tone: 'aurora',
  },
  {
    href: '/marketplace/sections/swarm',
    title: 'Swarm-ready',
    blurb: 'Multi-agent deployments on rails.',
    icon: Network,
    tone: 'plasma',
  },
  {
    href: '/marketplace/sections/new',
    title: 'New',
    blurb: 'Freshly shipped in the last 30 days.',
    icon: Sparkles,
    tone: 'aurora',
  },
  {
    href: '/marketplace/sections/beginner',
    title: 'Start here',
    blurb: 'Low-friction picks for your first install.',
    icon: Star,
    tone: 'green',
  },
] as const;

export function SectionTeasers() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {TEASERS.map((t) => {
        const Icon = t.icon;
        return (
          <Link key={t.href} href={t.href as never} className="group">
            <GlassCard padding="md" interactive className="flex h-full flex-col gap-3">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-sm border',
                    t.tone === 'plasma' && 'border-plasma/40 text-plasma bg-plasma/5',
                    t.tone === 'aurora' && 'border-aurora/40 text-aurora bg-aurora/5',
                    t.tone === 'green' && 'border-green/40 text-green bg-green/5'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-ink-subtle group-hover:text-plasma transition-colors" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-lg tracking-tight text-ink group-hover:text-plasma transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs text-ink-muted">{t.blurb}</p>
              </div>
            </GlassCard>
          </Link>
        );
      })}
    </div>
  );
}
