import { getAgentById } from '@/lib/agents';
import { CATEGORY_LABELS, CERTIFICATION_LABELS, SITE_NAME } from '@/lib/constants';
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'GrokInstall agent';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Cinnabar Glass canon — kept inline for next/og (no Tailwind in this context).
const CINNABAR = '#C73E1D';
const CINNABAR_LIGHT = '#E03C31';
const INK_0 = '#0D0D0D';
const INK_900 = '#FAFAFA';
const INK_800 = '#D4D4D8';
const INK_700 = '#A1A1AA';

export default async function OgImage({ params }: { params: { id: string } }) {
  const agent = await getAgentById(params.id);
  const title = agent?.name ?? 'Agent not found';
  const tagline = agent?.tagline ?? 'Explore agents at grokagents.dev';
  const category = agent ? CATEGORY_LABELS[agent.category] : SITE_NAME;
  const certs = agent?.certifications.slice(0, 3).map((c) => CERTIFICATION_LABELS[c]) ?? [];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        background: INK_0,
        backgroundImage: [
          'radial-gradient(900px circle at 18% 22%, rgba(199,62,29,0.30), rgba(199,62,29,0) 60%)',
          'radial-gradient(700px circle at 82% 78%, rgba(224,60,49,0.18), rgba(224,60,49,0) 60%)',
        ].join(', '),
        color: INK_900,
        fontFamily: 'Geist, Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 18,
            letterSpacing: '0.22em',
            color: CINNABAR_LIGHT,
            textTransform: 'uppercase',
            fontWeight: 600,
            fontFamily: 'IBM Plex Mono, ui-monospace, monospace',
          }}
        >
          {`GROKINSTALL · ${category}`}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            fontSize: 88,
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            fontWeight: 700,
            maxWidth: 1080,
            color: INK_900,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 32,
            lineHeight: 1.2,
            color: INK_800,
            maxWidth: 980,
            fontWeight: 500,
          }}
        >
          {tagline}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: '40px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          {certs.map((c) => (
            <div
              key={c}
              style={{
                fontSize: 20,
                padding: '8px 14px',
                borderRadius: 8,
                border: `1px solid ${CINNABAR_LIGHT}80`,
                color: CINNABAR,
                background: 'rgba(199,62,29,0.15)',
                fontFamily: 'IBM Plex Mono, ui-monospace, monospace',
              }}
            >
              {c}
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: 18,
            color: INK_700,
          }}
        >
          grokagents.dev · Not affiliated with xAI
        </div>
      </div>
    </div>,
    { ...size }
  );
}
