/* Auto-generated stub. Replace via `pnpm generate:types` after `pnpm install`. */

export interface Header {
  id: string;
  navItems?: Array<{
    label?: string | null;
    type?: 'url' | 'page' | null;
    url?: string | null;
    page?: string | { id: string } | null;
    openInNewTab?: boolean | null;
  }> | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
}

export interface Footer {
  id: string;
  quickLinks?: Array<{ label?: string | null; href?: string | null }> | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  copyrightText?: string | null;
}
