import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'Site Config' },
  access: { read: isPublic, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(['/', '/about', '/schedule', '/contact', '/register'])] },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'DMCS Lions Wrestling Club' },
    { name: 'tagline', type: 'text' },
    { name: 'siteLogo', type: 'upload', relationTo: 'media', admin: { description: 'Lion logo used in the site header. Recommended: transparent PNG, square.' } },
    { name: 'footerLogo', type: 'upload', relationTo: 'media', admin: { description: 'Logo used in the footer. Defaults to siteLogo if unset.' } },
    { name: 'defaultOgImage', type: 'upload', relationTo: 'media', admin: { description: 'Default social-sharing preview image (Open Graph).' } },
    { name: 'favicon', type: 'upload', relationTo: 'media', admin: { description: 'Browser tab icon. Recommended: square PNG, 256×256 or larger.' } },
    {
      name: 'cloudflareAnalyticsToken',
      type: 'text',
      admin: { description: 'Optional. If set, the cookieless CF analytics beacon loads.' },
    },
    { name: 'maintenanceMode', type: 'checkbox', defaultValue: false },
  ],
};
