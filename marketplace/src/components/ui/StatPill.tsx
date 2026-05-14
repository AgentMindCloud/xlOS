import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function StatPill({
  icon,
  label,
  value,
  tone = 'neutral',
  className,
}: {
  icon?: ReactNode;
  label?: string;
  value: string | number;
  tone?: 'plasma' | 'aurora' | 'cyan' | 'green' | 'neutral' | 'cinnabar';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-mono',
        // Cinnabar canonical
        tone === 'cinnabar' &&
          'cinnabar-gradient-soft text-cinnabar-300 border border-cinnabar-500/40',
        // Legacy tones now point at cinnabar / semantic surfaces
        tone === 'plasma' &&
          'cinnabar-gradient-soft text-cinnabar-300 border border-cinnabar-500/40',
        tone === 'aurora' &&
          'cinnabar-gradient-soft text-cinnabar-300 border border-cinnabar-400/40',
        tone === 'cyan' && 'bg-ink-100 text-ink-800 border border-ink-300',
        tone === 'green' && 'bg-success/10 text-success border border-success/40',
        tone === 'neutral' && 'glass-card text-ink-700 border-ink-300/60',
        className
      )}
    >
      {icon ? (
        <span className="shrink-0 flex items-center [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      ) : null}
      <span className="tabular-nums">{value}</span>
      {label ? <span className="text-ink-600 font-normal font-mono">{label}</span> : null}
    </span>
  );
}
