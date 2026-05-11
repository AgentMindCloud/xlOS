'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { CATEGORY_LABELS } from '@/lib/constants';
import type { Category } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART, ChartAxisTick, ChartTooltipBox } from './RechartsTheme';

export interface CategoryBarDatum {
  category: string;
  count: number;
}

function label(c: string): string {
  if (c === 'other') return 'Other';
  return CATEGORY_LABELS[c as Category] ?? c;
}

export function CategoryBar({ data }: { data: CategoryBarDatum[] }) {
  const display = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 9)
    .map((d) => ({ name: label(d.category), count: d.count }));

  return (
    <GlassCard padding="lg" className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-cyan">
          Deploys by category · 30d
        </p>
        <h3 className="font-display text-xl tracking-tight text-ink">What's hot, what's cool</h3>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={display} margin={{ top: 4, right: 6, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={<ChartAxisTick />}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={<ChartAxisTick anchor="end" />}
              width={30}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: CHART.cyanGlass }}
              content={<ChartTooltipBox valueLabel="Deploys" />}
            />
            <Bar dataKey="count" fill={CHART.cyanSoft} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
