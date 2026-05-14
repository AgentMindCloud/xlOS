/**
 * Raw brand hex values — ONLY for places that can't consume Tailwind, such as
 * `next/og` ImageResponse, Recharts dot fills, and Next.js `themeColor`
 * metadata. Everywhere else, use Tailwind utilities backed by these tokens
 * (`bg-ink-0`, `text-cinnabar-500`, etc.) so the locked brand system stays
 * the single source of truth.
 *
 * Cinnabar Glass palette — cinnabar primary, ink-ramp neutrals. Legacy
 * key names (plasma/aurora/cyan/green) kept so older callsites resolve
 * without churn.
 */
export const BRAND = {
  bg: '#0D0D0D', // ink.0
  ink: '#FAFAFA', // ink.900
  inkMuted: '#D4D4D8', // ink.800
  inkSubtle: '#A1A1AA', // ink.700
  plasma: '#C73E1D', // cinnabar.500 (primary)
  plasmaGlow: 'rgba(199,62,29,0.30)',
  aurora: '#E03C31', // cinnabar.400
  auroraGlow: 'rgba(224,60,49,0.30)',
  cyan: '#C73E1D', // legacy alias → cinnabar.500
  green: '#22C55E', // semantic success preserved
  danger: '#EF4444',
  cinnabar: '#C73E1D',
  cinnabarLight: '#E03C31',
  cinnabarDark: '#A82F14',
} as const;
