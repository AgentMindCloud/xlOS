'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART, ChartAxisTick, ChartTooltipBox } from './RechartsTheme';

export interface FunnelRow {
  step: string;
  count: number;
}

export function SectionFunnel({
  data,
  plausibleConfigured,
}: {
  data: FunnelRow[];
  plausibleConfigured: boolean;
}) {
  const display = data.map((d) => ({ ...d }));

  return (
    <GlassCard padding="lg" className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-cyan">Funnel · 30d</p>
          <h3 className="font-display text-xl tracking-tight text-ink">
            Marketplace → Agent → Install
          </h3>
        </div>
        {!plausibleConfigured ? (
          <span
            className="rounded-sm border border-border-subtle bg-surface px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-subtle font-mono"
            title="Set PLAUSIBLE_API_KEY to wire this panel"
          >
            Plausible off
          </span>
        ) : null}
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={display} margin={{ top: 4, right: 6, left: -14, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis dataKey="step" axisLine={false} tickLine={false} tick={<ChartAxisTick />} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={<ChartAxisTick anchor="end" />}
              width={34}
            />
            <Tooltip
              cursor={{ fill: CHART.cyanGlass }}
              content={<ChartTooltipBox valueLabel="Events" />}
            />
            <Bar dataKey="count" fill={CHART.cyanSoft} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-ink-subtle">
        Steps: pageview → agent_viewed → install_clicked. Drop-off between columns is the
        opportunity to improve the listing page.
      </p>
    </GlassCard>
  );
}
