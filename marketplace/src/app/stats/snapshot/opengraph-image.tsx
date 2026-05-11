import { BRAND } from '@/lib/brand';
import { getHeadline } from '@/lib/telemetry-queries';
import { formatCount } from '@/lib/utils';
import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'GrokInstall adoption dashboard — live';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function StatsSnapshotOg() {
  const data = await getHeadline();
  const cards = [
    { label: 'Total agents installed', value: data.totalAgents },
    { label: 'X posts generated', value: data.posts },
    { label: 'API calls saved', value: data.apiSaved },
    { label: 'Active agents · 7d', value: data.active7d },
  ];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '56px 72px',
        background: BRAND.bg,
        backgroundImage: [
          'radial-gradient(900px circle at 18% 22%, rgba(255,30,112,0.20), rgba(255,30,112,0) 60%)',
          'radial-gradient(700px circle at 82% 78%, rgba(0,224,213,0.16), rgba(0,224,213,0) 60%)',
        ].join(', '),
        color: BRAND.ink,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
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
        GROKINSTALL · ADOPTION DASHBOARD
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: 64,
          lineHeight: 0.95,
          letterSpacing: '-0.04em',
          fontWeight: 700,
          marginTop: 24,
          maxWidth: 960,
        }}
      >
        Grok-native agents, live on X.
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 18,
          marginTop: 44,
          flexGrow: 1,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              padding: '22px 24px',
              border: '1px solid rgba(255,30,112,0.25)',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 12,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: BRAND.aurora,
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 52,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                marginTop: 10,
                color: BRAND.ink,
              }}
            >
              {formatCount(c.value)}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 40,
          fontSize: 18,
          color: BRAND.inkSubtle,
        }}
      >
        <span>grokagents.dev/stats</span>
        <span>Independent community project · Not affiliated with xAI</span>
      </div>
    </div>,
    { ...size }
  );
}
