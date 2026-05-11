'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { useMemo, useState } from 'react';

export interface HeatmapCell {
  dow: number;
  hour: number;
  count: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function HeatmapGrid({ data }: { data: HeatmapCell[] }) {
  const [hover, setHover] = useState<HeatmapCell | null>(null);

  const { max, map } = useMemo(() => {
    const m = new Map<string, number>();
    let mx = 0;
    for (const c of data) {
      const key = `${c.dow}:${c.hour}`;
      m.set(key, c.count);
      if (c.count > mx) mx = c.count;
    }
    return { max: mx, map: m };
  }, [data]);

  function intensity(dow: number, hour: number): number {
    const v = map.get(`${dow}:${hour}`) ?? 0;
    return max === 0 ? 0 : v / max;
  }

  return (
    <GlassCard padding="lg" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-cyan">
          Activity heatmap · 30d
        </p>
        <h3 className="font-display text-xl tracking-tight text-ink">Day-of-week × hour (UTC)</h3>
      </div>

      <div className="overflow-x-auto">
        <div
          className="inline-grid min-w-full gap-0.5"
          style={{ gridTemplateColumns: 'auto repeat(24, minmax(16px, 1fr))' }}
        >
          <div />
          {HOURS.map((h) => (
            <div
              key={`h-${h}`}
              className="text-center font-mono text-[9px] tracking-wide text-ink-subtle"
            >
              {h % 3 === 0 ? h.toString().padStart(2, '0') : ''}
            </div>
          ))}
          {DAYS.map((d, dow) => (
            <DayRow
              key={d}
              label={d}
              dow={dow}
              intensity={intensity}
              onHover={setHover}
              map={map}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-ink-subtle uppercase tracking-wider">
        <span>
          {hover
            ? `${DAYS[hover.dow]} · ${String(hover.hour).padStart(2, '0')}:00 UTC — ${hover.count} deploys`
            : 'Hover to inspect a cell'}
        </span>
        <span className="flex items-center gap-2">
          Low
          <span className="flex overflow-hidden rounded-sm">
            {[0.1, 0.25, 0.5, 0.75, 1].map((v, i) => (
              <span key={i} className="h-3 w-4" style={{ background: cellColor(v) }} />
            ))}
          </span>
          High
        </span>
      </div>
    </GlassCard>
  );
}

function cellColor(intensity: number): string {
  if (intensity <= 0) return 'rgba(255, 255, 255, 0.04)';
  const alpha = Math.min(0.92, 0.08 + intensity * 0.84);
  return `rgba(0, 240, 255, ${alpha.toFixed(3)})`;
}

function DayRow({
  label,
  dow,
  intensity,
  map,
  onHover,
}: {
  label: string;
  dow: number;
  intensity: (dow: number, hour: number) => number;
  map: Map<string, number>;
  onHover: (c: HeatmapCell | null) => void;
}) {
  return (
    <>
      <div className="pr-2 text-right font-mono text-[10px] uppercase tracking-wider text-ink-subtle leading-[16px]">
        {label}
      </div>
      {HOURS.map((h) => {
        const v = map.get(`${dow}:${h}`) ?? 0;
        return (
          <button
            key={`${dow}-${h}`}
            type="button"
            aria-label={`${label} ${h}:00 UTC, ${v} deploys`}
            onMouseEnter={() => onHover({ dow, hour: h, count: v })}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover({ dow, hour: h, count: v })}
            onBlur={() => onHover(null)}
            className="h-4 w-full rounded-[2px] border border-border-subtle/40 transition-colors hover:ring-1 hover:ring-cyan/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/70"
            style={{ background: cellColor(intensity(dow, h)) }}
          />
        );
      })}
    </>
  );
}
