import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: { group: 'Site Config' },
  access: { read: isPublic, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(['/'])] },
  fields: [
    {
      name: 'quickLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    { name: 'address', type: 'text', defaultValue: '13007 Douglas Pkwy, Urbandale, IA 50323' },
    { name: 'phone', type: 'text', defaultValue: '' },
    { name: 'email', type: 'email', defaultValue: 'Topher.ewing@dmcs.org' },
    { name: 'instagramUrl', type: 'text', defaultValue: 'https://www.instagram.com/lionswrestlingclub' },
    { name: 'facebookUrl', type: 'text', defaultValue: 'https://facebook.com/dmclionswrestling' },
    {
      name: 'copyrightText',
      type: 'text',
      defaultValue: '© DMC Lions Wrestling Club. All rights reserved.',
    },
  ],
};
