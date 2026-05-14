import { getAgentById } from '@/lib/agents';
import { BRAND } from '@/lib/brand';
import { CATEGORY_LABELS, CERTIFICATION_LABELS, SITE_NAME } from '@/lib/constants';
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'xlOS agent';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
        background: BRAND.bg,
        backgroundImage: [
          'radial-gradient(900px circle at 18% 22%, rgba(255,30,112,0.20), rgba(255,30,112,0) 60%)',
          'radial-gradient(700px circle at 82% 78%, rgba(0,224,213,0.16), rgba(0,224,213,0) 60%)',
        ].join(', '),
        color: BRAND.ink,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 18,
            letterSpacing: '0.22em',
            color: BRAND.aurora,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {`xlOS · ${category}`}
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
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 32,
            lineHeight: 1.2,
            color: BRAND.inkMuted,
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
                border: '1px solid rgba(255,30,112,0.45)',
                color: BRAND.plasma,
                background: 'rgba(255,30,112,0.08)',
              }}
            >
              {c}
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: 18,
            color: BRAND.inkSubtle,
          }}
        >
          grokagents.dev · Not affiliated with xAI
        </div>
      </div>
    </div>,
    { ...size }
  );
}
