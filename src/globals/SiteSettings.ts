import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'Site Config' },
  access: { read: isPublic, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(['/'])] },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'DMC Lions Wrestling Club' },
    { name: 'tagline', type: 'text' },
    { name: 'defaultOgImage', type: 'upload', relationTo: 'media' },
    { name: 'favicon', type: 'upload', relationTo: 'media' },
    {
      name: 'cloudflareAnalyticsToken',
      type: 'text',
      admin: { description: 'Optional. If set, the cookieless CF analytics beacon loads.' },
    },
    { name: 'featuredVideoUrl', type: 'text', admin: { description: 'YouTube URL for /gallery hero' } },
    { name: 'maintenanceMode', type: 'checkbox', defaultValue: false },
  ],
};
