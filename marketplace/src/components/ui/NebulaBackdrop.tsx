import { cn } from '@/lib/utils';

/**
 * Nebula backdrop — soft Cinnabar radial circles + halftone dots on a deep ink field.
 * Pure SVG + CSS, no runtime JS. Pair with sparse <CircuitTrace /> for premium hero strips.
 */
export function NebulaBackdrop({
  className,
  intensity = 'normal',
}: {
  className?: string;
  intensity?: 'soft' | 'normal' | 'rich';
}) {
  const opacity = intensity === 'soft' ? 0.55 : intensity === 'rich' ? 1 : 0.8;
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <svg
        viewBox="0 0 1600 800"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={{ opacity }}
      >
        <defs>
          <radialGradient id="nb-cinnabar" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C73E1D" stopOpacity="0.42" />
            <stop offset="60%" stopColor="#C73E1D" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#C73E1D" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nb-cinnabar-light" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E03C31" stopOpacity="0.36" />
            <stop offset="60%" stopColor="#E03C31" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#E03C31" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nb-cinnabar-deep" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7A220D" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#7A220D" stopOpacity="0" />
          </radialGradient>
          <pattern
            id="nb-halftone"
            x="0"
            y="0"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.06)" />
          </pattern>
          <linearGradient id="nb-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C73E1D" stopOpacity="0" />
            <stop offset="35%" stopColor="#C73E1D" stopOpacity="0.7" />
            <stop offset="65%" stopColor="#E03C31" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#E03C31" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Deep field */}
        <rect width="1600" height="800" fill="#0D0D0D" />

        {/* Halftone dot grid for that risograph feel */}
        <rect width="1600" height="800" fill="url(#nb-halftone)" />

        {/* Three drifting cinnabar nebula circles — each on its own group so they can animate independently */}
        <g className="animate-nebula-drift" style={{ animationDelay: '0s' }}>
          <circle cx="280" cy="280" r="360" fill="url(#nb-cinnabar)" />
        </g>
        <g className="animate-nebula-drift" style={{ animationDelay: '-4s' }}>
          <circle cx="1280" cy="560" r="320" fill="url(#nb-cinnabar-light)" />
        </g>
        <g className="animate-nebula-drift" style={{ animationDelay: '-8s' }}>
          <circle cx="980" cy="180" r="220" fill="url(#nb-cinnabar-deep)" />
        </g>

        {/* Hairline at the bottom */}
        <line
          x1="0"
          y1="780"
          x2="1600"
          y2="780"
          stroke="url(#nb-line)"
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
