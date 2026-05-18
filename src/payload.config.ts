import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { Users } from './collections/Users';
import { Events } from './collections/Events';
import { Recaps } from './collections/Recaps';
import { Photos } from './collections/Photos';
import { Albums } from './collections/Albums';
import { Coaches } from './collections/Coaches';
import { Pages } from './collections/Pages';
import { Registrations } from './collections/Registrations';
import { ContactSubmissions } from './collections/ContactSubmissions';
import { Media } from './collections/Media';
import { Redirects } from './collections/Redirects';
import { AuditLog } from './collections/AuditLog';

import { Header } from './globals/Header';
import { Footer } from './globals/Footer';
import { SiteSettings } from './globals/SiteSettings';
import { ContactConfig } from './globals/ContactConfig';
import { Homepage } from './globals/Homepage';
import { AboutPage } from './globals/AboutPage';
import { SchedulePage } from './globals/SchedulePage';
import { ResultsPage } from './globals/ResultsPage';
import { GalleryPage } from './globals/GalleryPage';
import { ContactPage } from './globals/ContactPage';
import { RegisterPage } from './globals/RegisterPage';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const livePreviewBreakpoints = [
  { label: 'Mobile', name: 'mobile', width: 375, height: 812 },
  { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
  { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
];

const GLOBAL_TO_PATH: Record<string, string> = {
  homepage: '/',
  'about-page': '/about',
  'schedule-page': '/schedule',
  'results-page': '/results',
  'gallery-page': '/gallery',
  'contact-page': '/contact',
  'register-page': '/register',
  header: '/',
  footer: '/',
  'site-settings': '/',
  'contact-config': '/contact',
};

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — Lions Wrestling Club Admin',
      icons: [{ rel: 'icon', type: 'image/png', url: '/logos/lion-head-blue-transparent.png' }],
    },
    livePreview: {
      breakpoints: livePreviewBreakpoints,
      url: ({ globalConfig }) => {
        const slug = globalConfig?.slug ?? 'homepage';
        const path = GLOBAL_TO_PATH[slug] ?? '/';
        const base = process.env.SITE_URL ?? 'http://localhost:3000';
        return `${base}${path}`;
      },
    },
  },
  collections: [
    Users,
    Events,
    Recaps,
    Photos,
    Albums,
    Coaches,
    Pages,
    Registrations,
    ContactSubmissions,
    Media,
    Redirects,
    AuditLog,
  ],
  globals: [
    Header,
    Footer,
    SiteSettings,
    ContactConfig,
    Homepage,
    AboutPage,
    SchedulePage,
    ResultsPage,
    GalleryPage,
    ContactPage,
    RegisterPage,
  ],
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL ?? '' },
  }),
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: { media: true, photos: true },
      token: process.env.BLOB_READ_WRITE_TOKEN ?? '',
    }),
  ],
  cors: [],
  csrf: process.env.SITE_URL ? [process.env.SITE_URL] : [],
  onInit: async (payload) => {
    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@dmcschools.org';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeNow_VeryStrong_2026';

    let existingAdmin;
    try {
      existingAdmin = await payload.find({
        collection: 'users',
        where: { email: { equals: adminEmail } },
        limit: 1,
      });
    } catch (e) {
      payload.logger.warn(`Skipping seed — schema not initialized yet. Hit /api/bootstrap to provision. (${(e as Error).message})`);
      return;
    }
    if (existingAdmin.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: { name: 'Site Admin', email: adminEmail, password: adminPassword, role: 'admin', active: true },
      });
      payload.logger.info(`Created admin user: ${adminEmail}`);
    }

    await payload.updateGlobal({
      slug: 'homepage',
      data: {
        heroEyebrow: 'Des Moines Christian Wrestling',
        heroHeading: 'Forge tough kids, faithful young men, and lifelong champions.',
        heroSubheading: 'A K–12 wrestling program built on Christ-centered character, technical mastery, and the grit only the mat can teach.',
        heroPrimaryCtaLabel: 'Register a Wrestler',
        heroPrimaryCtaHref: '/register',
        heroSecondaryCtaLabel: 'View Schedule',
        heroSecondaryCtaHref: '/schedule',
        missionHeading: 'Built for the long match',
        programCards: [
          { title: 'Mini Lions (K–2)', ageRange: 'K – 2', body: 'Fundamentals through play. Mat awareness, position, fall safely.' },
          { title: 'Youth (3–6)', ageRange: '3rd – 6th', body: 'Real technique, real competition. Local tournaments optional.' },
          { title: 'Middle & High School', ageRange: '7th – 12th', body: 'Conditioning, technique, dual + tournament season.' },
        ],
        testimonialQuote: 'Wrestling at DMC stretched our son in every way — body, mind, and faith. He came home tougher and more humble.',
        testimonialAuthor: 'Parent of a 7th-grade wrestler',
        testimonialRole: '2024–25 season',
      },
    });

    await payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          { label: 'Home', type: 'url', url: '/' },
          { label: 'About', type: 'url', url: '/about' },
          { label: 'Schedule', type: 'url', url: '/schedule' },
          { label: 'Results', type: 'url', url: '/results' },
          { label: 'Gallery', type: 'url', url: '/gallery' },
          { label: 'Contact', type: 'url', url: '/contact' },
        ],
        ctaLabel: 'Join the Lions',
        ctaHref: '/register',
      },
    });

    await payload.updateGlobal({
      slug: 'footer',
      data: {
        quickLinks: [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Schedule', href: '/schedule' },
          { label: 'Results', href: '/results' },
          { label: 'Gallery', href: '/gallery' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    });

    await payload.updateGlobal({
      slug: 'contact-config',
      data: {
        recipientEmails: [{ email: 'lionswrestling@dmcschools.org' }],
        subjectPrefix: '[Lions Wrestling]',
        autoReplyEnabled: true,
        autoReplySubject: 'We got your message — Lions Wrestling',
        rateLimitPerHour: 5,
      },
    });

    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        siteName: 'DMC Lions Wrestling Club',
        tagline: 'Christ-centered wrestling, K–12.',
        maintenanceMode: false,
      },
    });
  },
});
