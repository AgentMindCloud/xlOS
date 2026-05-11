'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
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

interface AgentOption {
  id: string;
  name: string;
}

interface DailyPoint {
  date: string;
  count: number;
}

export function InstallVolumeChart({
  agents,
  initialSeries,
  initialAgentId,
}: {
  agents: AgentOption[];
  initialSeries: DailyPoint[];
  initialAgentId: string;
}) {
  const [agentId, setAgentId] = useState(initialAgentId);
  const [series, setSeries] = useState<DailyPoint[]>(initialSeries);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agentId === initialAgentId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/stats/daily/${agentId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d.series)) setSeries(d.series);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [agentId, initialAgentId]);

  const display = useMemo(() => series.map((p) => ({ ...p, label: p.date.slice(5) })), [series]);

  return (
    <GlassCard padding="lg" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-cyan">
            Install volume · 30d
          </p>
          <h3 className="font-display text-xl tracking-tight text-ink">Daily install signals</h3>
        </div>
        <label className="flex flex-col gap-1">
          <span className="sr-only">Agent</span>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="glass rounded-md px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-border-focus"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id} className="bg-bg">
                {a.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={cn('h-56 transition-opacity', loading && 'opacity-60')}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={display} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="iv-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.cyan} stopOpacity={0.45} />
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
            <Tooltip content={<ChartTooltipBox valueLabel="Installs" />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke={CHART.cyan}
              strokeWidth={1.6}
              fill="url(#iv-fill)"
              dot={false}
              activeDot={{ r: 3, stroke: CHART.cyan, strokeWidth: 2, fill: BRAND.bg }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
