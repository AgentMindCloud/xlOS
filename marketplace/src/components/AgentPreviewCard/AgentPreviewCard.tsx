// src/components/AgentPreviewCard/AgentPreviewCard.tsx
import { CircuitTrace } from '@/components/ui/CircuitTrace';
import { GlassCard } from '@/components/ui/GlassCard';
import type { AgentVisuals, VisualAccent } from '@/lib/visuals/parse-visuals';
import { RenderDemoMedia } from '@/lib/visuals/render-demo-media';
import styles from './AgentPreviewCard.module.css';
import { TrackVisualsBlock } from './TrackVisualsBlock';

interface AgentPreviewCardProps {
  agentId: string;
  agentName: string;
  visuals: AgentVisuals;
}

// All accent variants now map to cinnabar tints (primary cinnabar-500,
// light cinnabar-400, deep cinnabar-600) — the legacy plasma/aurora/cyan/green
// keys are kept on the type so existing manifests parse, but every variant
// renders in the Cinnabar Glass canon.
const ACCENT_HEADLINE: Record<VisualAccent, string> = {
  plasma: 'text-cinnabar-400',
  aurora: 'text-cinnabar-400',
  cyan: 'text-cinnabar-300',
  green: 'text-cinnabar-500',
};

const ACCENT_SHADOW: Record<VisualAccent, string> = {
  plasma: 'shadow-cinnabar-glow',
  aurora: 'shadow-cinnabar-glow-lg',
  cyan: 'shadow-cinnabar-glow-soft',
  green: 'shadow-cinnabar-glow',
};

export function AgentPreviewCard({ agentId, agentName, visuals }: AgentPreviewCardProps) {
  const { style, accent_color, demo_media, headline, subheadline } = visuals;
  const headlineClass = ACCENT_HEADLINE[accent_color];

  if (style === 'minimal') {
    return (
      <section
        className={`${styles.card} ${styles.minimal} relative overflow-hidden rounded-md border border-ink-300 bg-ink-100 p-6`}
        data-visual-style="minimal"
        data-visual-accent={accent_color}
      >
        <div className="flex flex-col gap-4">
          <RenderDemoMedia
            media={demo_media}
            accent={accent_color}
            style={style}
            agentName={agentName}
          />
          {headline ? (
            <h3 className={`font-display text-xl font-semibold tracking-tight ${headlineClass}`}>
              {headline}
            </h3>
          ) : null}
          {subheadline ? (
            <p className="text-sm text-ink-700 leading-relaxed">{subheadline}</p>
          ) : null}
        </div>
        <TrackVisualsBlock agentId={agentId} accentColor={accent_color} style={style} />
      </section>
    );
  }

  const elevation = style === 'futuristic' ? 'lifted' : 'raised';
  const glow = ACCENT_SHADOW[accent_color];

  return (
    <GlassCard
      as="section"
      elevation={elevation}
      padding="lg"
      className={`${styles.card} ${styles[style]} relative overflow-hidden ${glow}`}
      data-visual-style={style}
      data-visual-accent={accent_color}
    >
      {style === 'futuristic' ? <CircuitTrace density="sparse" className={styles.trace} /> : null}
      <div className="relative z-10 flex flex-col gap-5">
        <RenderDemoMedia
          media={demo_media}
          accent={accent_color}
          style={style}
          agentName={agentName}
        />
        {headline ? (
          <h3 className={`font-display text-2xl font-semibold tracking-tight ${headlineClass}`}>
            {headline}
          </h3>
        ) : null}
        {subheadline ? (
          <p className="text-base text-ink-700 leading-relaxed">{subheadline}</p>
        ) : null}
      </div>
      <TrackVisualsBlock agentId={agentId} accentColor={accent_color} style={style} />
    </GlassCard>
  );
}
