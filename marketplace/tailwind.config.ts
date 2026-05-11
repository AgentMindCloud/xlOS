import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        ink: {
          DEFAULT: '#FFFFFF',
          muted: '#E5E5E5',
          subtle: 'rgba(255,255,255,0.5)',
        },
        plasma: {
          DEFAULT: '#FF1E70',
          glow: 'rgba(255,30,112,0.30)',
        },
        aurora: {
          DEFAULT: '#00E0D5',
          glow: 'rgba(0,224,213,0.30)',
        },
        cyan: {
          DEFAULT: '#00F0FF',
          glow: 'rgba(0,240,255,0.30)',
        },
        green: {
          DEFAULT: '#00FF9D',
          glow: 'rgba(0,255,157,0.30)',
        },
        danger: {
          DEFAULT: '#FF2D55',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          raised: 'rgba(255,255,255,0.08)',
        },
        border: {
          subtle: 'rgba(255,255,255,0.08)',
          focus: 'rgba(255,30,112,0.45)',
          plasma: 'rgba(255,30,112,0.45)',
          aurora: 'rgba(0,224,213,0.45)',
        },
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
      boxShadow: {
        plasmaGlow: '0 0 28px rgba(255,30,112,0.35)',
        plasmaGlowSoft: '0 0 14px rgba(255,30,112,0.20)',
        auroraGlow: '0 0 28px rgba(0,224,213,0.35)',
        auroraGlowSoft: '0 0 14px rgba(0,224,213,0.20)',
        cyanGlow: '0 0 24px rgba(0,240,255,0.30)',
        greenGlow: '0 0 24px rgba(0,255,157,0.30)',
        cyanGlowSoft: '0 0 12px rgba(0,240,255,0.18)',
        spectral: '0 0 36px rgba(255,30,112,0.22), 0 0 60px rgba(0,224,213,0.18)',
      },
      backdropBlur: {
        gi: '20px',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
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
          '0%, 100%': { textShadow: '-1px 0 rgba(255,30,112,0.55), 1px 0 rgba(0,224,213,0.55)' },
          '50%': { textShadow: '-2px 0 rgba(255,30,112,0.55), 2px 0 rgba(0,224,213,0.55)' },
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
