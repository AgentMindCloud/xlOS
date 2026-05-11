import { GlassCard } from '@/components/ui/GlassCard';
import { formatCount } from '@/lib/utils';
import { Bot, Download, Users, Zap } from 'lucide-react';

export interface StatsHeadlineData {
  agents: number;
  creators: number;
  installs: number;
  last24hInstalls: number;
}

export function StatsHeadline({ data }: { data: StatsHeadlineData }) {
  const items = [
    { icon: <Bot className="h-4 w-4" />, label: 'Agents live', value: formatCount(data.agents) },
    {
      icon: <Users className="h-4 w-4" />,
      label: 'Creators',
      value: formatCount(data.creators),
    },
    {
      icon: <Download className="h-4 w-4" />,
      label: 'Installs lifetime',
      value: formatCount(data.installs),
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: 'Last 24h',
      value: formatCount(data.last24hInstalls),
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {items.map((i) => (
        <GlassCard key={i.label} padding="md" className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-cyan">
            {i.icon}
            <span className="text-[11px] uppercase tracking-[0.18em] font-mono">{i.label}</span>
          </div>
          <div className="font-display text-2xl tracking-tight tabular-nums text-ink md:text-3xl">
            {i.value}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
