import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'GrokInstall — the community marketplace for Grok-native agents on X';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Cinnabar Glass canon — kept inline for next/og (no Tailwind in this context).
const CINNABAR = '#C73E1D';
const CINNABAR_LIGHT = '#E03C31';
const INK_0 = '#0D0D0D';
const INK_900 = '#FAFAFA';
const INK_700 = '#A1A1AA';

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: INK_0,
        backgroundImage: [
          'radial-gradient(900px circle at 18% 22%, rgba(199,62,29,0.32), rgba(199,62,29,0) 60%)',
          'radial-gradient(700px circle at 82% 78%, rgba(224,60,49,0.20), rgba(224,60,49,0) 60%)',
        ].join(', '),
        color: INK_900,
        fontFamily: 'Geist, Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 20,
          letterSpacing: '0.22em',
          color: CINNABAR_LIGHT,
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 40,
          fontFamily: 'IBM Plex Mono, ui-monospace, monospace',
        }}
      >
        Built for Grok on X
      </div>
      <div
        style={{
          fontSize: 128,
          lineHeight: 0.9,
          letterSpacing: '-0.05em',
          fontWeight: 700,
          background: `linear-gradient(135deg, ${CINNABAR_LIGHT} 0%, ${CINNABAR} 100%)`,
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        GROKINSTALL
      </div>
      <div
        style={{
          fontSize: 42,
          lineHeight: 1.2,
          color: INK_900,
          marginTop: 30,
          maxWidth: 1040,
          fontWeight: 500,
        }}
      >
        The community marketplace for Grok-native agents on X.
      </div>
      <div
        style={{
          fontSize: 20,
          color: INK_700,
          marginTop: 60,
        }}
      >
        grokagents.dev · Independent community project · Not affiliated with xAI
      </div>
    </div>,
    { ...size }
  );
}
