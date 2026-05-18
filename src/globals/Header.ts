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
    { name: 'ctaLabel', type: 'text', defaultValue: 'Join the Lions' },
    { name: 'ctaHref', type: 'text', defaultValue: '/register' },
    { name: 'instagramUrl', type: 'text', defaultValue: 'https://instagram.com/dmclionswrestling' },
    { name: 'facebookUrl', type: 'text', defaultValue: 'https://facebook.com/dmclionswrestling' },
  ],
};
