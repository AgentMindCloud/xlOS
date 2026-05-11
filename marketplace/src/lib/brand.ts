/**
 * Raw brand hex values — ONLY for places that can't consume Tailwind, such as
 * `next/og` ImageResponse and Next.js `themeColor` metadata. Everywhere else,
 * use Tailwind utilities backed by these tokens (`bg-bg`, `text-plasma`, etc.)
 * so the locked brand system stays the single source of truth.
 *
 * Spectral palette (Tier 4): Plasma + Aurora are the primary identity now;
 * Cyan + Green stay as legacy accents for safety / success / data states.
 */
export const BRAND = {
  bg: '#0A0A0A',
  ink: '#FFFFFF',
  inkMuted: '#E5E5E5',
  inkSubtle: 'rgba(255,255,255,0.5)',
  plasma: '#FF1E70',
  plasmaGlow: 'rgba(255,30,112,0.30)',
  aurora: '#00E0D5',
  auroraGlow: 'rgba(0,224,213,0.30)',
  cyan: '#00F0FF',
  green: '#00FF9D',
  danger: '#FF2D55',
} as const;
