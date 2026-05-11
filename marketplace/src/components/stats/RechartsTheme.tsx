'use client';

export const CHART = {
  cyan: 'rgb(0, 240, 255)',
  cyanSoft: 'rgba(0, 240, 255, 0.55)',
  cyanGlass: 'rgba(0, 240, 255, 0.15)',
  green: 'rgb(0, 255, 157)',
  greenSoft: 'rgba(0, 255, 157, 0.55)',
  greenGlass: 'rgba(0, 255, 157, 0.15)',
  ink: 'rgb(229, 229, 229)',
  inkSubtle: 'rgba(255, 255, 255, 0.5)',
  grid: 'rgba(0, 240, 255, 0.08)',
  surface: 'rgba(255, 255, 255, 0.04)',
} as const;

export function ChartAxisTick({
  x,
  y,
  payload,
  anchor = 'middle',
}: {
  x?: number;
  y?: number;
  payload?: { value: string | number };
  anchor?: 'start' | 'middle' | 'end';
}) {
  if (typeof x !== 'number' || typeof y !== 'number' || !payload) return null;
  return (
    <text
      x={x}
      y={y}
      dy={10}
      textAnchor={anchor}
      fontFamily="var(--font-mono), monospace"
      fontSize={10}
      letterSpacing="0.12em"
      fill={CHART.inkSubtle}
    >
      {payload.value}
    </text>
  );
}

export function ChartTooltipBox({
  active,
  label,
  payload,
  valueLabel = 'Value',
}: {
  active?: boolean;
  label?: string | number;
  payload?: { value?: number; name?: string; color?: string }[];
  valueLabel?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(10, 10, 10, 0.92)',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        backdropFilter: 'blur(12px)',
        borderRadius: 12,
        padding: '8px 12px',
        fontFamily: 'var(--font-body), Inter, sans-serif',
        fontSize: 12,
        color: CHART.ink,
        boxShadow: '0 0 16px rgba(0, 240, 255, 0.2)',
      }}
    >
      <div
        style={{
          color: CHART.cyan,
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: 2,
              background: p.color ?? CHART.cyan,
            }}
          />
          <span>{p.name ?? valueLabel}</span>
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
