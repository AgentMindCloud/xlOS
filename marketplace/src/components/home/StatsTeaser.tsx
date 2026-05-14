import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/utils';
import { Bot, Download, ShieldCheck, Zap } from 'lucide-react';

export interface StatsTeaserData {
  agents: number;
  installs: number;
  last24hInstalls: number;
  avgSafetyScore: number;
}

const TONE_CLASSES: Record<'plasma' | 'aurora' | 'green' | 'cyan', string> = {
  plasma: 'text-cinnabar-400',
  aurora: 'text-cinnabar-300',
  green: 'text-success',
  cyan: 'text-cinnabar-200',
};

export function StatsTeaser({ data }: { data: StatsTeaserData }) {
  const items: {
    icon: React.ReactNode;
    label: string;
    value: string;
    tone: 'plasma' | 'aurora' | 'green' | 'cyan';
  }[] = [
    {
      icon: <Bot className="h-4 w-4" />,
      label: 'Featured agents',
      value: formatCount(data.agents),
      tone: 'plasma',
    },
    {
      icon: <Download className="h-4 w-4" />,
      label: 'Installs lifetime',
      value: formatCount(data.installs),
      tone: 'aurora',
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: 'Last 24 hours',
      value: formatCount(data.last24hInstalls),
      tone: 'plasma',
    },
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      label: 'Avg. safety score',
      value: `${data.avgSafetyScore}/100`,
      tone: 'green',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {items.map((s) => (
          <GlassCard key={s.label} padding="md" className="flex flex-col gap-1.5">
            <div className={cn('flex items-center gap-2', TONE_CLASSES[s.tone])}>
              {s.icon}
              <span className="text-[11px] uppercase tracking-[0.18em] font-mono">{s.label}</span>
            </div>
            <div className="font-display text-2xl tracking-tight tabular-nums text-ink-900 md:text-3xl">
              {s.value}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
