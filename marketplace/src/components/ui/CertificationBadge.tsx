import { CERTIFICATION_LABELS } from '@/lib/constants';
import type { Certification } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Code2, Mic, Network, ShieldCheck, Workflow, Zap } from 'lucide-react';

const ICONS: Record<Certification, typeof ShieldCheck> = {
  'grok-native': Zap,
  'safety-max': ShieldCheck,
  'voice-ready': Mic,
  'swarm-ready': Network,
  'action-certified': Workflow,
  'vscode-verified': Code2,
};

// Primary certifications (cinnabar accent) — the high-signal ones we want
// to make sing. Others render with neutral ink chrome.
type Tone = 'primary' | 'neutral';

const TONE: Record<Certification, Tone> = {
  'grok-native': 'primary',
  'safety-max': 'primary',
  'voice-ready': 'neutral',
  'swarm-ready': 'primary',
  'action-certified': 'neutral',
  'vscode-verified': 'neutral',
};

const TONE_CLASSES: Record<Tone, string> = {
  primary: 'cinnabar-gradient-soft border-cinnabar-400/50 text-cinnabar-300',
  neutral: 'bg-ink-200 border-ink-300 text-ink-800',
};

export function CertificationBadge({
  slug,
  size = 'md',
  className,
}: {
  slug: Certification;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const Icon = ICONS[slug];
  const label = CERTIFICATION_LABELS[slug];
  const tone = TONE[slug];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border font-mono font-medium tracking-tight',
        TONE_CLASSES[tone],
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
      title={label}
    >
      <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} aria-hidden />
      <span>{label}</span>
    </span>
  );
}

export function CertificationBadgeRow({
  slugs,
  size = 'sm',
  max,
  className,
}: {
  slugs: Certification[];
  size?: 'sm' | 'md';
  max?: number;
  className?: string;
}) {
  const shown = typeof max === 'number' ? slugs.slice(0, max) : slugs;
  const overflow = typeof max === 'number' ? Math.max(0, slugs.length - max) : 0;
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {shown.map((s) => (
        <CertificationBadge key={s} slug={s} size={size} />
      ))}
      {overflow > 0 ? (
        <span className="inline-flex items-center rounded-sm border border-ink-300 bg-ink-100 px-2 py-0.5 text-[11px] text-ink-700 font-mono">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
