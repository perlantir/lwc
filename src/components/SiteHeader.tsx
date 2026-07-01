'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Header } from '../../payload-types';

interface NavItem {
  label: string;
  href: string;
  openInNewTab?: boolean;
}

const buildHref = (item: { type?: string | null; url?: string | null }): string =>
  item.url ?? '/';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.6-1.6h1.7V4.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.6H7.6V14h2.8v8h3.1z" />
  </svg>
);

export const SiteHeader = ({ cfg, logoUrl }: { cfg: Header; logoUrl?: string }) => {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(m.matches);
    update();
    m.addEventListener('change', update);
    return () => m.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [path]);

  const items: NavItem[] = (cfg.navItems ?? []).map((n) => ({
    label: n.label ?? '',
    href: buildHref({ type: n.type, url: n.url }),
    openInNewTab: Boolean(n.openInNewTab),
  }));

  return (
    <header className="bg-navy text-white relative z-10">
      <div className="flex items-center gap-3 px-4 sm:px-5 md:px-12 lg:px-12 xl:px-20 2xl:px-28 py-[10px] max-w-[1600px] mx-auto">
        <Link href="/" aria-label="Lions Wrestling home" className="block w-[67px] h-[74px] sm:w-[76px] sm:h-[83px] shrink-0">
          <img
            src={logoUrl ?? '/logos/lion-head-white-transparent.png'}
            alt=""
            className="w-full h-full object-contain"
          />
        </Link>

        {!mobile && (
          <nav className="ml-8 lg:ml-[200px] flex gap-6 lg:gap-8" aria-label="Main">
            {items.map((it) => {
              const active = path === it.href || (it.href !== '/' && path.startsWith(it.href));
              return (
                <Link
                  key={it.label}
                  href={it.href}
                  target={it.openInNewTab ? '_blank' : undefined}
                  className={`text-sm font-medium pb-1 relative transition-colors ${
                    active ? 'text-white' : 'text-white/90 hover:text-cyan'
                  }`}
                >
                  {it.label}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-[6px] h-[2px] bg-cyan rounded" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {!mobile && (
            <>
              <a
                href={cfg.instagramUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full inline-flex items-center justify-center text-white/70 bg-white/[.06] border border-white/[.08] hover:text-white hover:bg-cyan hover:border-cyan transition"
              >
                <span className="w-[14px] h-[14px] block"><InstagramIcon /></span>
              </a>
              <a
                href={cfg.facebookUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full inline-flex items-center justify-center text-white/70 bg-white/[.06] border border-white/[.08] hover:text-white hover:bg-cyan hover:border-cyan transition"
              >
                <span className="w-[14px] h-[14px] block"><FacebookIcon /></span>
              </a>
            </>
          )}
          <Link
            href={cfg.ctaHref ?? 'https://www.dmcsevents.com'}
            className="btn btn-cyan text-xs sm:text-sm font-semibold px-3 sm:px-[22px] py-2 sm:py-[11px] rounded-lg ml-1 sm:ml-2 md:ml-[14px] whitespace-nowrap"
          >
            {cfg.ctaLabel ?? 'Join the Lions'}
          </Link>
          {mobile && (
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="ml-1 w-11 h-11 rounded text-white border border-white/[.15] inline-flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
              </svg>
            </button>
          )}
        </div>
      </div>
      {mobile && open && (
        <nav className="bg-navy border-t border-white/10 px-5 py-4 flex flex-col" aria-label="Mobile">
          {items.map((it) => (
            <Link key={it.label} href={it.href} className="text-white/90 py-3 min-h-[44px] flex items-center text-base">
              {it.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-3 border-t border-white/10 mt-2">
            <a href={cfg.instagramUrl ?? '#'} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-11 h-11 rounded-full inline-flex items-center justify-center text-white/70 bg-white/[.06] border border-white/[.08]">
              <span className="w-[14px] h-[14px] block"><InstagramIcon /></span>
            </a>
            <a href={cfg.facebookUrl ?? '#'} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-11 h-11 rounded-full inline-flex items-center justify-center text-white/70 bg-white/[.06] border border-white/[.08]">
              <span className="w-[14px] h-[14px] block"><FacebookIcon /></span>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};
