'use client';

// Cinnabar Glass chart palette — warm cinnabar tones replacing the legacy
// cyan/green/pink series. Kept named cyan/green for back-compat with existing
// callsites, but now mapped to cinnabar primary/secondary/tertiary.
export const CHART = {
  // Primary series (cinnabar.500)
  cyan: 'rgb(199, 62, 29)',
  cyanSoft: 'rgba(199, 62, 29, 0.55)',
  cyanGlass: 'rgba(199, 62, 29, 0.15)',
  // Secondary series (cinnabar.400)
  green: 'rgb(224, 60, 49)',
  greenSoft: 'rgba(224, 60, 49, 0.55)',
  greenGlass: 'rgba(224, 60, 49, 0.15)',
  // Tertiary (cinnabar.600 dark)
  cinnabarDark: 'rgb(168, 47, 20)',
  cinnabarDarkSoft: 'rgba(168, 47, 20, 0.55)',
  ink: 'rgb(212, 212, 216)', // ink.800
  inkSubtle: 'rgba(255, 255, 255, 0.5)',
  grid: 'rgba(199, 62, 29, 0.10)',
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
        background: 'rgba(21, 21, 26, 0.92)',
        border: '1px solid rgba(199, 62, 29, 0.4)',
        backdropFilter: 'blur(20px)',
        borderRadius: 14,
        padding: '8px 12px',
        fontFamily: 'var(--font-geist), Inter, sans-serif',
        fontSize: 12,
        color: CHART.ink,
        boxShadow: '0 0 16px rgba(199, 62, 29, 0.2)',
      }}
    >
      <div
        style={{
          color: CHART.cyan,
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-mono)',
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
