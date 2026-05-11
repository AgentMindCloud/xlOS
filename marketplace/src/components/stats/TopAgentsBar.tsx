'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART, ChartAxisTick, ChartTooltipBox } from './RechartsTheme';

export interface TopAgent {
  id: string;
  name: string;
  installs: number;
  last7d: number;
}

export function TopAgentsBar({ data }: { data: TopAgent[] }) {
  const display = [...data]
    .sort((a, b) => b.installs - a.installs)
    .slice(0, 8)
    .map((d) => ({ name: d.name, Lifetime: d.installs, '7-day': d.last7d }))
    .reverse();

  return (
    <GlassCard padding="lg" className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-cyan">Top agents</p>
        <h3 className="font-display text-xl tracking-tight text-ink">Lifetime vs 7-day installs</h3>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={display}
            margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke={CHART.grid} />
            <XAxis type="number" axisLine={false} tickLine={false} tick={<ChartAxisTick />} />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={<ChartAxisTick anchor="end" />}
              width={140}
            />
            <Tooltip cursor={{ fill: CHART.cyanGlass }} content={<ChartTooltipBox />} />
            <Bar dataKey="Lifetime" fill={CHART.cyanSoft} radius={[0, 6, 6, 0]} />
            <Bar dataKey="7-day" fill={CHART.greenSoft} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
