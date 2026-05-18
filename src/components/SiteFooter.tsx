import Link from 'next/link';
import type { Footer } from '../../payload-types';

export const SiteFooter = ({ cfg }: { cfg: Footer }) => {
  const links = cfg.quickLinks ?? [];
  return (
    <footer className="bg-deep-navy text-white/80 px-5 md:px-14 lg:px-20 xl:px-28 2xl:px-40 pt-9 pb-7">
      <div className="grid gap-10 md:grid-cols-[200px_1fr_1fr] items-start max-w-[1600px] mx-auto">
        <div>
          <div
            aria-hidden="true"
            className="w-[130px] h-[130px] bg-no-repeat bg-center bg-contain"
            style={{ backgroundImage: "url('/logos/lion-head-white-transparent.png')" }}
          />
        </div>
        <div>
          <h4 className="text-white font-bold text-base mb-4">Quick Links</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {links.map((l) => (
              <Link key={l.href} href={l.href ?? '/'} className="text-white/80 hover:text-cyan leading-6">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-white font-bold text-base mb-4">Contact</h4>
          <div className="flex items-center gap-2 text-sm mt-2 text-white/80">
            <svg viewBox="0 0 24 24" width="14" height="14" className="text-cyan shrink-0" fill="currentColor">
              <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            <span>{cfg.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2 text-white/80">
            <svg viewBox="0 0 24 24" width="14" height="14" className="text-cyan shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5c0-1 1-2 2-2h2l2 5-2 1c1 3 3 5 6 6l1-2 5 2v2c0 1-1 2-2 2-9 0-16-7-16-16z" /></svg>
            <a href={`tel:${(cfg.phone ?? '').replace(/[^0-9+]/g, '')}`}>{cfg.phone}</a>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2 text-white/80">
            <svg viewBox="0 0 24 24" width="14" height="14" className="text-cyan shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
            <a href={`mailto:${cfg.email}`}>{cfg.email}</a>
          </div>
          <div className="flex gap-2 mt-4">
            {cfg.instagramUrl && (
              <a
                href={cfg.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-white/[.06] border border-white/10 rounded-lg text-white/85 text-xs font-semibold hover:bg-cyan hover:border-cyan"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></svg>
                Instagram
              </a>
            )}
            {cfg.facebookUrl && (
              <a
                href={cfg.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-white/[.06] border border-white/10 rounded-lg text-white/85 text-xs font-semibold hover:bg-cyan hover:border-cyan"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.6-1.6h1.7V4.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.6H7.6V14h2.8v8h3.1z" /></svg>
                Facebook
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="mt-7 pt-4 border-t border-white/10 text-center text-xs text-white/50">
        {cfg.copyrightText ?? `© ${new Date().getFullYear()} DMC Lions Wrestling Club.`}
      </div>
    </footer>
  );
};
