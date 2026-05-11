import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function StatPill({
  icon,
  label,
  value,
  tone = 'plasma',
  className,
}: {
  icon?: ReactNode;
  label?: string;
  value: string | number;
  tone?: 'plasma' | 'aurora' | 'cyan' | 'green' | 'neutral';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium',
        tone === 'plasma' && 'bg-plasma/5 text-plasma border border-plasma/30',
        tone === 'aurora' && 'bg-aurora/5 text-aurora border border-aurora/30',
        tone === 'cyan' && 'bg-cyan/5 text-cyan border border-cyan/30',
        tone === 'green' && 'bg-green/5 text-green border border-green/30',
        tone === 'neutral' && 'bg-surface text-ink-muted border border-border-subtle',
        className
      )}
    >
      {icon ? (
        <span className="shrink-0 flex items-center [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      ) : null}
      <span className="tabular-nums">{value}</span>
      {label ? <span className="text-ink-subtle font-normal">{label}</span> : null}
    </span>
  );
}
