'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART, ChartAxisTick, ChartTooltipBox } from './RechartsTheme';

export interface ProVsStandardPoint {
  date: string;
  pro: number;
  standard: number;
}

export function ProVsStandardArea({ series }: { series: ProVsStandardPoint[] }) {
  const display = series.map((p) => ({
    label: p.date.slice(5),
    Pro: p.pro,
    Standard: p.standard,
  }));

  return (
    <GlassCard padding="lg" className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-cyan">Deploys · 30d</p>
        <h3 className="font-display text-xl tracking-tight text-ink">Pro Mode vs Standard</h3>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={display} margin={{ top: 4, right: 6, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="pro-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.green} stopOpacity={0.6} />
                <stop offset="100%" stopColor={CHART.green} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="std-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.cyan} stopOpacity={0.5} />
                <stop offset="100%" stopColor={CHART.cyan} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={CHART.grid} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={<ChartAxisTick />} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={<ChartAxisTick anchor="end" />}
              width={34}
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltipBox />} />
            <Legend
              wrapperStyle={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: CHART.inkSubtle,
              }}
            />
            <Area
              type="monotone"
              dataKey="Standard"
              stackId="1"
              stroke={CHART.cyan}
              strokeWidth={1.4}
              fill="url(#std-fill)"
            />
            <Area
              type="monotone"
              dataKey="Pro"
              stackId="1"
              stroke={CHART.green}
              strokeWidth={1.4}
              fill="url(#pro-fill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
