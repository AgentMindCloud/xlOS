import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function Section({
  children,
  className,
  as = 'section',
}: {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'main' | 'div';
}) {
  const Tag = as;
  return (
    <Tag className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</Tag>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  tone = 'neutral',
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'neutral' | 'cinnabar';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8',
        className
      )}
    >
      <div className="flex flex-col gap-2 max-w-2xl">
        {eyebrow ? (
          <p
            className={cn(
              'font-mono text-[11px] uppercase tracking-[0.22em]',
              tone === 'cinnabar' ? 'text-cinnabar-400' : 'text-cinnabar-400'
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            'font-display text-2xl md:text-3xl lg:text-4xl tracking-tight text-ink-900',
            tone === 'cinnabar' && '[&_em]:not-italic [&_em]:cinnabar-text'
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="text-ink-700 text-sm md:text-base leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
