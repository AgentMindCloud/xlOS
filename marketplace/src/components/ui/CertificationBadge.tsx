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

const TONE: Record<Certification, 'plasma' | 'aurora' | 'green' | 'cyan'> = {
  'grok-native': 'plasma',
  'safety-max': 'green',
  'voice-ready': 'aurora',
  'swarm-ready': 'plasma',
  'action-certified': 'aurora',
  'vscode-verified': 'cyan',
};

const TONE_CLASSES: Record<'plasma' | 'aurora' | 'green' | 'cyan', string> = {
  plasma: 'border-plasma/40 bg-plasma/5 text-plasma',
  aurora: 'border-aurora/40 bg-aurora/5 text-aurora',
  green: 'border-green/40 bg-green/5 text-green',
  cyan: 'border-cyan/40 bg-cyan/5 text-cyan',
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
        'inline-flex items-center gap-1.5 rounded-sm border font-medium tracking-tight',
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
        <span className="inline-flex items-center rounded-sm border border-border-subtle bg-surface px-2 py-0.5 text-[11px] text-ink-subtle">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
