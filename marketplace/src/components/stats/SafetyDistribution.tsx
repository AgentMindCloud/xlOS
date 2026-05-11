'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART, ChartAxisTick, ChartTooltipBox } from './RechartsTheme';

const BUCKETS = ['<70', '70-79', '80-89', '90-94', '95-100'] as const;
type Bucket = (typeof BUCKETS)[number];

function toBucket(score: number): Bucket {
  if (score < 70) return '<70';
  if (score < 80) return '70-79';
  if (score < 90) return '80-89';
  if (score < 95) return '90-94';
  return '95-100';
}

export function SafetyDistribution({ scores }: { scores: number[] }) {
  const counts: Record<Bucket, number> = {
    '<70': 0,
    '70-79': 0,
    '80-89': 0,
    '90-94': 0,
    '95-100': 0,
  };
  for (const s of scores) counts[toBucket(s)] += 1;
  const display = BUCKETS.map((b) => ({ bucket: b, count: counts[b] }));

  return (
    <GlassCard padding="lg" className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-cyan">
          Safety score distribution
        </p>
        <h3 className="font-display text-xl tracking-tight text-ink">How safe is the catalogue?</h3>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={display} margin={{ top: 4, right: 6, left: -14, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={<ChartAxisTick />} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={<ChartAxisTick anchor="end" />}
              width={28}
            />
            <Tooltip
              cursor={{ fill: CHART.greenGlass }}
              content={<ChartTooltipBox valueLabel="Agents" />}
            />
            <Bar dataKey="count" fill={CHART.greenSoft} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-ink-subtle">
        Every agent runs through the GrokInstall safety scanner on submit. Agents under 90 require a
        maintainer review before they re-appear in Trending.
      </p>
    </GlassCard>
  );
}
