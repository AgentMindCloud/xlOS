import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Cinnabar Glass canonical palette ─────────────────────────────
        cinnabar: {
          50: '#FDEEEA',
          100: '#FAD8CF',
          200: '#F2B2A0',
          300: '#ED5C45',
          400: '#E03C31', // accent-light
          500: '#C73E1D', // PRIMARY ACCENT
          600: '#A82F14', // pressed
          700: '#7A220D',
          800: '#4A1308',
          900: '#2A0A04',
        },
        ink: {
          0: '#0D0D0D', // page bg (deepest)
          50: '#111113', // panel bg
          100: '#15151A', // raised panel
          200: '#1C1C22', // card bg
          300: '#25252C', // border default
          400: '#36363D', // border emphasis
          500: '#52525B', // text disabled
          600: '#71717A', // text tertiary
          700: '#A1A1AA', // text secondary
          800: '#D4D4D8', // text primary
          900: '#FAFAFA', // text strongest
          // Legacy semantic aliases so existing `text-ink`, `text-ink-muted`, `text-ink-subtle` keep working
          DEFAULT: '#FAFAFA',
          muted: '#A1A1AA',
          subtle: '#71717A',
        },

        // ── Semantic states ──────────────────────────────────────────────
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',

        // ── Legacy aliases for backwards-compat with Agent 2's untouched files ──
        // These let `text-plasma`, `bg-aurora`, `border-cyan/40`, etc., keep
        // rendering — now wearing Cinnabar Glass clothes.
        plasma: {
          DEFAULT: '#C73E1D', // → cinnabar.500
          glow: 'rgba(199,62,29,0.32)',
        },
        aurora: {
          DEFAULT: '#E03C31', // → cinnabar.400
          glow: 'rgba(224,60,49,0.32)',
        },
        cyan: {
          DEFAULT: '#F2B2A0', // soft warm accent (no cold cyan)
          glow: 'rgba(242,178,160,0.30)',
        },
        green: {
          DEFAULT: '#22C55E', // semantic success, no neon green
          glow: 'rgba(34,197,94,0.28)',
        },

        // ── Surface / border helpers ─────────────────────────────────────
        bg: '#0D0D0D',
        surface: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          raised: 'rgba(255,255,255,0.06)',
        },
        'border-subtle': '#25252C', // ink.300
        'border-strong': '#36363D', // ink.400
        'ink-muted': '#A1A1AA', // ink.700
        'ink-subtle': '#71717A', // ink.600
        border: {
          subtle: 'rgba(255,255,255,0.08)',
          focus: 'rgba(199,62,29,0.45)',
          plasma: 'rgba(199,62,29,0.45)',
          aurora: 'rgba(224,60,49,0.45)',
        },
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
        '2xl': '40px',
      },
      boxShadow: {
        'glass-soft': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-md': '0 16px 48px -8px rgba(0, 0, 0, 0.5)',
        'glass-lg': '0 32px 96px -16px rgba(0, 0, 0, 0.7)',
        'cinnabar-glow': '0 0 32px -8px rgba(199, 62, 29, 0.5)',
        'cinnabar-glow-lg': '0 0 64px -12px rgba(199, 62, 29, 0.6)',
        'cinnabar-glow-soft': '0 0 24px -10px rgba(224, 60, 49, 0.35)',
        'cinnabar-inner': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        // Legacy aliases:
        plasmaGlow: '0 0 32px -8px rgba(199, 62, 29, 0.5)',
        plasmaGlowSoft: '0 0 24px -10px rgba(199, 62, 29, 0.35)',
        auroraGlow: '0 0 32px -8px rgba(224, 60, 49, 0.45)',
        auroraGlowSoft: '0 0 24px -10px rgba(224, 60, 49, 0.35)',
        cyanGlow: '0 0 24px rgba(242,178,160,0.30)',
        greenGlow: '0 0 24px rgba(34,197,94,0.30)',
        cyanGlowSoft: '0 0 12px rgba(242,178,160,0.18)',
        plate:
          '0 0 36px rgba(199,62,29,0.22), 0 0 60px rgba(224,60,49,0.18)',
      },
      backdropBlur: {
        glass: '20px',
        'glass-strong': '28px',
        'glass-xl': '40px',
        // Legacy alias used by Header.tsx and others
        gi: '20px',
      },
      fontFamily: {
        sans: [
          'var(--font-geist)',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        display: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        body: ['var(--font-geist)', 'system-ui', 'sans-serif'],
        mono: [
          'var(--font-ibm-plex-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
      },
      transitionTimingFunction: {
        gi: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'trace-dash': {
          '0%': { strokeDashoffset: '400' },
          '100%': { strokeDashoffset: '0' },
        },
        'nebula-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)', opacity: '0.85' },
          '50%': { transform: 'translate3d(2%,-1%,0) scale(1.04)', opacity: '1' },
        },
        'chromatic-shift': {
          '0%, 100%': {
            textShadow: '-1px 0 rgba(199,62,29,0.55), 1px 0 rgba(224,60,49,0.55)',
          },
          '50%': {
            textShadow: '-2px 0 rgba(199,62,29,0.55), 2px 0 rgba(224,60,49,0.55)',
          },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 400ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'pulse-slow': 'pulse-slow 3.2s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
        'trace-dash': 'trace-dash 3.5s linear infinite',
        'nebula-drift': 'nebula-drift 14s ease-in-out infinite',
        'chromatic-shift': 'chromatic-shift 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
