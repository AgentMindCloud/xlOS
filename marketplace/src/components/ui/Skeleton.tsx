import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'glass';
}) {
  return (
    <div
      className={cn(
        'shimmer rounded-sm',
        variant === 'glass'
          ? 'glass-card border-ink-300/40'
          : 'bg-ink-200 border border-ink-300/60',
        className
      )}
      aria-hidden
    />
  );
}
