import { cn } from '@/lib/utils';

/**
 * Decorative animated circuit-trace backdrop. Pure SVG + CSS — no runtime JS.
 * Intended to be absolutely positioned inside a relative hero container.
 */
export function CircuitTrace({
  className,
  density = 'normal',
}: {
  className?: string;
  density?: 'sparse' | 'normal' | 'dense';
}) {
  const paths = TRACES[density];
  return (
    <svg
      aria-hidden
      viewBox="0 0 1600 800"
      preserveAspectRatio="xMidYMid slice"
      className={cn('pointer-events-none absolute inset-0 h-full w-full text-aurora', className)}
    >
      <defs>
        <radialGradient id="ct-glow" cx="20%" cy="55%" r="60%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.04" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <filter id="ct-accent" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="1600" height="800" fill="url(#ct-glow)" />

      <g stroke="currentColor" strokeWidth="0.3" strokeOpacity="0.05">
        {Array.from({ length: 32 }, (_, i) => (
          <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={800} />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 50} x2={1600} y2={i * 50} />
        ))}
      </g>

      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeOpacity="0.45"
        filter="url(#ct-accent)"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            strokeDasharray="400"
            strokeDashoffset="400"
            style={{
              animation: 'trace-dash 3.5s linear infinite',
              animationDelay: `${(i % 5) * 0.35}s`,
            }}
          />
        ))}
      </g>

      <g fill="currentColor">
        {NODES[density].map(([cx, cy], i) => (
          <circle key={`n-${cx}-${cy}-${i}`} cx={cx} cy={cy} r={3} opacity="0.85" />
        ))}
      </g>
    </svg>
  );
}

const TRACES: Record<'sparse' | 'normal' | 'dense', string[]> = {
  sparse: ['M0 620 L260 620 L300 580 L520 580', 'M1080 120 L1280 120 L1320 160 L1320 260'],
  normal: [
    'M0 620 L260 620 L300 580 L520 580 L560 620 L820 620',
    'M1080 120 L1280 120 L1320 160 L1320 260',
    'M820 260 L1060 260 L1100 220 L1320 220',
    'M40 200 L180 200 L220 240 L220 340',
    'M620 720 L760 720 L800 680 L960 680',
  ],
  dense: [
    'M0 620 L260 620 L300 580 L520 580 L560 620 L820 620',
    'M1080 120 L1280 120 L1320 160 L1320 260 L1440 260',
    'M820 260 L1060 260 L1100 220 L1320 220',
    'M40 200 L180 200 L220 240 L220 340 L320 340',
    'M620 720 L760 720 L800 680 L960 680 L1000 720 L1180 720',
    'M0 100 L220 100 L260 140 L420 140',
    'M1200 520 L1360 520 L1400 560 L1600 560',
    'M520 380 L700 380 L740 420 L900 420',
  ],
};

const NODES: Record<'sparse' | 'normal' | 'dense', [number, number][]> = {
  sparse: [
    [260, 620],
    [520, 580],
    [1280, 120],
    [1320, 260],
  ],
  normal: [
    [260, 620],
    [520, 580],
    [820, 620],
    [1280, 120],
    [1320, 260],
    [1060, 260],
    [1320, 220],
    [180, 200],
    [220, 340],
    [760, 720],
    [960, 680],
  ],
  dense: [
    [260, 620],
    [520, 580],
    [820, 620],
    [1280, 120],
    [1320, 260],
    [1440, 260],
    [1060, 260],
    [1320, 220],
    [180, 200],
    [220, 340],
    [320, 340],
    [760, 720],
    [960, 680],
    [1180, 720],
    [220, 100],
    [420, 140],
    [1360, 520],
    [1600, 560],
    [700, 380],
    [900, 420],
  ],
};
