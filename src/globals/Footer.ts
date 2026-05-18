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
    { name: 'address', type: 'text', defaultValue: '9730 Woodland, Cumming, IA 50061' },
    { name: 'phone', type: 'text', defaultValue: '515-844-3947' },
    { name: 'email', type: 'email', defaultValue: 'lionswrestling@dmcschools.org' },
    { name: 'instagramUrl', type: 'text', defaultValue: 'https://instagram.com/dmclionswrestling' },
    { name: 'facebookUrl', type: 'text', defaultValue: 'https://facebook.com/dmclionswrestling' },
    {
      name: 'copyrightText',
      type: 'text',
      defaultValue: '© DMC Lions Wrestling Club. All rights reserved.',
    },
  ],
};
