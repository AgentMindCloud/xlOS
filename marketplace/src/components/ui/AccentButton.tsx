import { cn } from '@/lib/utils';
import Link from 'next/link';
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'aurora' | 'success' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  // Primary: solid cinnabar gradient, lifts on hover, cinnabar glow.
  primary:
    'cinnabar-gradient text-ink-900 font-semibold border border-cinnabar-500 ' +
    'hover:shadow-cinnabar-glow hover:-translate-y-px active:translate-y-0 active:brightness-95',
  // Secondary: glass-card surface, ink text, cinnabar border on hover.
  secondary:
    'glass-card text-ink-800 font-medium ' +
    'hover:border-cinnabar-400/60 hover:text-ink-900 hover:shadow-cinnabar-glow-soft',
  // Aurora (legacy variant kept for back-compat) — softer cinnabar fill.
  aurora:
    'bg-cinnabar-400 text-ink-900 font-semibold border border-cinnabar-400 ' +
    'hover:shadow-cinnabar-glow-lg hover:brightness-110 active:brightness-95',
  // Success (semantic — kept green for clarity).
  success:
    'bg-success text-ink-0 font-semibold border border-success ' +
    'hover:brightness-110 active:brightness-95 hover:shadow-greenGlow',
  // Danger (semantic — kept red).
  danger:
    'bg-danger text-ink-900 font-semibold border border-danger ' +
    'hover:brightness-110 active:brightness-95',
  // Ghost: transparent, cinnabar on hover.
  ghost:
    'bg-transparent text-ink-700 border border-transparent ' +
    'hover:text-cinnabar-400 hover:bg-ink-100/40',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-md',
  md: 'h-11 px-5 text-[15px] rounded-md',
  lg: 'h-13 px-7 text-base rounded-md min-h-[52px]',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & {
    href?: undefined;
  };

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
};

function baseClasses(variant: Variant, size: Size, fullWidth: boolean | undefined) {
  return cn(
    'inline-flex items-center justify-center gap-2 font-sans font-medium tracking-tight',
    'transition-all duration-200 ease-gi',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinnabar-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full'
  );
}

function Inner({
  leadingIcon,
  trailingIcon,
  children,
}: {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      {leadingIcon ? <span className="shrink-0 flex items-center">{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? <span className="shrink-0 flex items-center">{trailingIcon}</span> : null}
    </>
  );
}

export const AccentButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps | LinkProps
>(function AccentButton(props, ref) {
  const {
    variant = 'primary',
    size = 'md',
    leadingIcon,
    trailingIcon,
    fullWidth,
    className,
    children,
  } = props;

  if ('href' in props && props.href) {
    const { href, external } = props;
    const extra = external ? { target: '_blank', rel: 'noopener noreferrer' as const } : {};
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href as never}
        className={cn(baseClasses(variant, size, fullWidth), className)}
        {...extra}
      >
        <Inner leadingIcon={leadingIcon} trailingIcon={trailingIcon}>
          {children}
        </Inner>
      </Link>
    );
  }

  const {
    variant: _v,
    size: _s,
    leadingIcon: _li,
    trailingIcon: _ti,
    fullWidth: _fw,
    className: _cn,
    children: _ch,
    ...btnRest
  } = props as ButtonProps;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cn(baseClasses(variant, size, fullWidth), className)}
      type={btnRest.type ?? 'button'}
      {...btnRest}
    >
      <Inner leadingIcon={leadingIcon} trailingIcon={trailingIcon}>
        {children}
      </Inner>
    </button>
  );
});
