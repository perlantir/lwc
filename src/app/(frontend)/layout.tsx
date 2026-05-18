import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { getPayload } from 'payload';
import config from '@payload-config';
import { SiteHeader } from '@/components/SiteHeader';
import type { Header as HeaderCfg, Footer as FooterCfg } from '../../../payload-types';
import { SiteFooter } from '@/components/SiteFooter';
import { MaintenanceBanner } from '@/components/MaintenanceBanner';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

export const generateMetadata = async (): Promise<Metadata> => {
  const payload = await getPayload({ config });
  const settings = await payload.findGlobal({ slug: 'site-settings' });
  return {
    title: {
      default: settings.siteName ?? 'DMC Lions Wrestling Club',
      template: `%s — ${settings.siteName ?? 'DMC Lions Wrestling Club'}`,
    },
    description: settings.tagline ?? 'Christ-centered wrestling, K–12 — Des Moines Christian.',
    openGraph: {
      type: 'website',
      siteName: settings.siteName ?? 'DMC Lions Wrestling Club',
    },
    icons: { icon: '/logos/lion-head-blue-transparent.png' },
  };
};

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  themeColor: '#061B3A',
  width: 'device-width',
  initialScale: 1,
};

const FrontendLayout = async ({ children }: { children: React.ReactNode }) => {
  const payload = await getPayload({ config });
  const [headerCfg, footerCfg, settings] = await Promise.all([
    payload.findGlobal({ slug: 'header' }),
    payload.findGlobal({ slug: 'footer' }),
    payload.findGlobal({ slug: 'site-settings' }),
  ]);
  await headers();
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        {settings.maintenanceMode ? (
          <MaintenanceBanner />
        ) : (
          <div className="page-card">
            <SiteHeader cfg={headerCfg as unknown as HeaderCfg} />
            <main id="main">{children}</main>
            <SiteFooter cfg={footerCfg as unknown as FooterCfg} />
          </div>
        )}
        {settings.cloudflareAnalyticsToken ? (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: settings.cloudflareAnalyticsToken })}
          />
        ) : null}
      </body>
    </html>
  );
};

export default FrontendLayout;
