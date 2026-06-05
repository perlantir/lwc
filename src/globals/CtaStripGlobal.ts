import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const CtaStripGlobal: GlobalConfig = {
  slug: 'cta-strip',
  admin: {
    group: 'Site Config',
    description:
      'The blue "Ready to wrestle?" bar that appears at the bottom of every page. Edit text + background image here; changes apply site-wide.',
    livePreview: {
      url: `${process.env.SITE_URL ?? 'http://localhost:3000'}/`,
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 812 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  access: { read: isPublic, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(['/', '/about', '/schedule', '/contact', '/register'])] },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Ready to wrestle?' },
    { name: 'accent', type: 'text', defaultValue: "Let's get on the mat." },
    { name: 'body', type: 'textarea', defaultValue: 'Registration is open year-round for all grade levels. Coaches reach out within 3 business days.' },
    { name: 'buttonLabel', type: 'text', defaultValue: 'Register here July 1' },
    { name: 'buttonHref', type: 'text', defaultValue: '/register' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media', admin: { description: 'Optional image that sits behind the dark navy overlay.' } },
  ],
};
