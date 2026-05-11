import { cn } from '@/lib/utils';
import { type HTMLAttributes, forwardRef } from 'react';

type Elevation = 'default' | 'raised' | 'hero';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'article' | 'aside';
  elevation?: Elevation;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings: Record<NonNullable<GlassCardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  {
    as = 'div',
    elevation = 'default',
    interactive = false,
    padding = 'md',
    className,
    children,
    ...rest
  },
  ref
) {
  const Tag = as as 'div';
  return (
    <Tag
      ref={ref}
      className={cn(
        'relative rounded-lg border border-border-subtle transition-all duration-200 ease-gi',
        elevation === 'default' && 'bg-surface backdrop-blur-gi',
        elevation === 'raised' && 'bg-surface-raised backdrop-blur-gi',
        elevation === 'hero' && 'bg-surface-raised backdrop-blur-gi shadow-plasmaGlowSoft',
        interactive &&
          'hover:border-plasma/45 hover:-translate-y-0.5 hover:shadow-plasmaGlowSoft cursor-pointer',
        paddings[padding],
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
});
