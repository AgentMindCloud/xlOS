import { BRAND } from '@/lib/brand';
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'xlOS — the community marketplace for Grok-native agents on X';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
        background: BRAND.bg,
        backgroundImage: [
          'radial-gradient(900px circle at 18% 22%, rgba(255,30,112,0.22), rgba(255,30,112,0) 60%)',
          'radial-gradient(700px circle at 82% 78%, rgba(0,224,213,0.18), rgba(0,224,213,0) 60%)',
        ].join(', '),
        color: BRAND.ink,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          fontSize: 20,
          letterSpacing: '0.22em',
          color: BRAND.aurora,
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: 40,
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
          color: BRAND.plasma,
        }}
      >
        xlOS
      </div>
      <div
        style={{
          fontSize: 42,
          lineHeight: 1.2,
          color: BRAND.ink,
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
          color: BRAND.inkSubtle,
          marginTop: 60,
        }}
      >
        grokagents.dev · Independent community project · Not affiliated with xAI
      </div>
    </div>,
    { ...size }
  );
}
