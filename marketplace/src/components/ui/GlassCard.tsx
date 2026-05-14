import { cn } from '@/lib/utils';
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  type Ref,
  forwardRef,
} from 'react';

type Elevation = 'flat' | 'raised' | 'lifted';
type Tone = 'neutral' | 'cinnabar';
type Padding = 'none' | 'sm' | 'md' | 'lg';

// Legacy aliases kept for backward compat with existing callsites.
// `default` → flat, `hero` → lifted.
type LegacyElevation = 'default' | 'hero';

export interface GlassCardOwnProps {
  as?: ElementType;
  elevation?: Elevation | LegacyElevation;
  tone?: Tone;
  interactive?: boolean;
  padding?: Padding;
  className?: string;
  children?: ReactNode;
}

const paddings: Record<Padding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

function normaliseElevation(e: Elevation | LegacyElevation | undefined): Elevation {
  if (!e) return 'flat';
  if (e === 'default') return 'flat';
  if (e === 'hero') return 'lifted';
  return e;
}

const elevationClasses: Record<Elevation, string> = {
  // Flat: base glass surface, soft shadow only.
  flat: 'glass-card shadow-glass-soft',
  // Raised: same glass treatment but a deeper shadow tier for hover-prone cards.
  raised: 'glass-card shadow-glass-md',
  // Lifted: emphasised "hero" glass — the strong variant + lg shadow + cinnabar soft glow.
  lifted: 'glass-card-strong shadow-glass-lg shadow-cinnabar-glow-soft',
};

const toneClasses: Record<Tone, string> = {
  neutral: '',
  cinnabar: 'cinnabar-border-glow',
};

export type GlassCardProps<T extends ElementType = 'div'> = GlassCardOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof GlassCardOwnProps>;

function GlassCardInner<T extends ElementType = 'div'>(
  {
    as,
    elevation = 'flat',
    tone = 'neutral',
    interactive = false,
    padding = 'md',
    className,
    children,
    ...rest
  }: GlassCardProps<T>,
  ref: Ref<Element>
) {
  const Tag = (as ?? 'div') as ElementType;
  const elev = normaliseElevation(elevation);
  return (
    <Tag
      ref={ref}
      className={cn(
        'relative rounded-lg transition-all duration-200 ease-gi',
        elevationClasses[elev],
        toneClasses[tone],
        interactive && 'glass-hover cursor-pointer',
        paddings[padding],
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export const GlassCard = forwardRef(GlassCardInner) as <T extends ElementType = 'div'>(
  props: GlassCardProps<T> & { ref?: Ref<Element> }
) => ReturnType<typeof GlassCardInner>;
