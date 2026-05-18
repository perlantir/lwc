import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — Lions Wrestling Club Admin',
      icons: [{ rel: 'icon', type: 'image/png', url: '/logos/lion-head-blue-transparent.png' }],
    },
    // Custom graphics can be wired here later via `components.graphics`.
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
  globals: [Header, Footer, SiteSettings, ContactConfig, Homepage],
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL ?? '' },
  }),
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },
  sharp,
  cors: [],
  csrf: process.env.SITE_URL ? [process.env.SITE_URL] : [],
});
