import { cn } from '@/lib/utils';
import Link from 'next/link';
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'aurora' | 'success' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-plasma text-ink font-semibold hover:shadow-plasmaGlow hover:brightness-110 active:brightness-95 border border-plasma',
  secondary:
    'bg-transparent text-aurora border border-aurora/60 hover:bg-aurora/10 hover:border-aurora hover:shadow-auroraGlowSoft',
  aurora:
    'bg-aurora text-bg font-semibold hover:shadow-auroraGlow hover:brightness-110 active:brightness-95 border border-aurora',
  success:
    'bg-green text-bg font-semibold hover:shadow-greenGlow hover:brightness-110 active:brightness-95 border border-green',
  danger:
    'bg-danger text-ink font-semibold hover:brightness-110 active:brightness-95 border border-danger',
  ghost:
    'bg-transparent text-ink-muted border border-border-subtle hover:border-border-focus hover:text-ink hover:bg-surface',
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
    'inline-flex items-center justify-center gap-2 font-body font-medium tracking-tight',
    'transition-all duration-200 ease-gi',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plasma/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
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

export const NeonButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps | LinkProps
>(function NeonButton(props, ref) {
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
