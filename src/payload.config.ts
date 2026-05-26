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
import { ContactPage } from './globals/ContactPage';
import { RegisterPage } from './globals/RegisterPage';
import { CtaStripGlobal } from './globals/CtaStripGlobal';

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
    components: {
      providers: ['@/components/admin/AdminInlineListener'],
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
    ContactPage,
    RegisterPage,
    CtaStripGlobal,
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
      collections: {
        media: { disablePayloadAccessControl: true },
        photos: { disablePayloadAccessControl: true },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
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
    // NOTE: global defaults are NOT seeded here — that would clobber admin
    // edits on every cold start. Initial seed is handled once by /api/bootstrap.
  },
});
