import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('shimmer rounded-sm bg-surface border border-border-subtle', className)}
      aria-hidden
    />
  );
}
