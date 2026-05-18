import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'cyan' | 'outline';
type Size = 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

const classes = (variant: Variant = 'cyan', size: Size = 'md', extra = '') =>
  `btn btn-${variant}${size === 'lg' ? ' btn-lg' : ''} ${extra}`.trim();

interface LinkProps extends BaseProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'> {
  href: string;
}

export const ButtonLink = ({ href, variant, size, className, children, ...rest }: LinkProps) => (
  <Link href={href} className={classes(variant, size, className)} {...rest}>
    {children}
  </Link>
);

interface BtnProps extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> {}

export const Button = ({ variant, size, className, children, ...rest }: BtnProps) => (
  <button className={classes(variant, size, className)} {...rest}>
    {children}
  </button>
);
