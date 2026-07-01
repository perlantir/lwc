import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const Header: GlobalConfig = {
  slug: 'header',
  admin: { group: 'Site Config' },
  access: { read: isPublic, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(['/'])] },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'url',
          options: [
            { label: 'Internal URL', value: 'url' },
            { label: 'Page', value: 'page' },
          ],
        },
        { name: 'url', type: 'text' },
        { name: 'page', type: 'relationship', relationTo: 'pages' },
        { name: 'openInNewTab', type: 'checkbox', defaultValue: false },
      ],
    },
    { name: 'ctaLabel', type: 'text', defaultValue: 'Register here July 1' },
    { name: 'ctaHref', type: 'text', defaultValue: 'https://www.dmcsevents.com' },
    { name: 'instagramUrl', type: 'text', defaultValue: 'https://www.instagram.com/lionswrestlingclub_' },
    { name: 'facebookUrl', type: 'text', defaultValue: 'https://facebook.com/dmclionswrestling' },
  ],
};
