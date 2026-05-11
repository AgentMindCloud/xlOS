'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils';
import { useEffect, useState, useTransition } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART, ChartAxisTick, ChartTooltipBox } from './RechartsTheme';

type Period = '7d' | '30d' | '90d';
type Metric = 'installs' | 'posts' | 'savings';

interface Point {
  date: string;
  value: number;
}

const METRIC_LABEL: Record<Metric, string> = {
  installs: 'Installs',
  posts: 'Posts',
  savings: 'API calls saved',
};

export function GrowthChart({
  initialSeries,
  initialPeriod = '30d',
  initialMetric = 'installs',
}: {
  initialSeries: Point[];
  initialPeriod?: Period;
  initialMetric?: Metric;
}) {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [metric, setMetric] = useState<Metric>(initialMetric);
  const [series, setSeries] = useState(initialSeries);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (period === initialPeriod && metric === initialMetric) {
      setSeries(initialSeries);
      return;
    }
    let cancelled = false;
    const url = `/api/stats/growth?period=${period}&metric=${metric}`;
    startTransition(() => {
      fetch(url)
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled && Array.isArray(d.series)) setSeries(d.series);
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [period, metric, initialSeries, initialPeriod, initialMetric]);

  const display = series.map((p) => ({ ...p, label: p.date.slice(5) }));

  return (
    <GlassCard padding="lg" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-cyan">
            Growth · {period.toUpperCase()}
          </p>
          <h3 className="font-display text-xl tracking-tight text-ink">
            {METRIC_LABEL[metric]} over time
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TabGroup
            value={metric}
            options={[
              { value: 'installs', label: 'Installs' },
              { value: 'posts', label: 'Posts' },
              { value: 'savings', label: 'Savings' },
            ]}
            onChange={(v) => setMetric(v)}
          />
          <TabGroup
            value={period}
            options={[
              { value: '7d', label: '7d' },
              { value: '30d', label: '30d' },
              { value: '90d', label: '90d' },
            ]}
            onChange={(v) => setPeriod(v)}
          />
        </div>
      </div>

      <div className={cn('h-60 transition-opacity', isPending && 'opacity-60')}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={display} margin={{ top: 4, right: 6, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="growth-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.cyan} stopOpacity={0.5} />
                <stop offset="100%" stopColor={CHART.cyan} stopOpacity={0} />
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
            <Tooltip content={<ChartTooltipBox valueLabel={METRIC_LABEL[metric]} />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={CHART.cyan}
              strokeWidth={1.8}
              fill="url(#growth-fill)"
              dot={false}
              activeDot={{ r: 3, stroke: CHART.cyan, strokeWidth: 2, fill: BRAND.bg }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

function TabGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border-subtle bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'px-2.5 py-1 text-[11px] font-medium font-mono uppercase tracking-wider rounded-sm transition-colors',
            value === o.value ? 'bg-cyan/15 text-cyan' : 'text-ink-subtle hover:text-ink'
          )}
          aria-pressed={value === o.value}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
