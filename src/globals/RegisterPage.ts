import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const RegisterPage: GlobalConfig = {
  slug: 'register-page',
  admin: { group: 'Pages' },
  access: { read: isPublic, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(['/register'])] },
  fields: [
    { name: 'bannerEyebrow', type: 'text', defaultValue: 'Register' },
    { name: 'bannerTitle', type: 'text', defaultValue: 'Join the Lions' },
    { name: 'bannerBody', type: 'textarea', defaultValue: 'Registration takes about 2 minutes. A coach will follow up within 3 business days with practice info, payment details, and what to expect.' },
    { name: 'bannerImage', type: 'upload', relationTo: 'media' },
    { name: 'formHeading', type: 'text', defaultValue: 'Wrestler Registration' },
    { name: 'feesBody', type: 'textarea', defaultValue: 'See current season fees on the registration form. Scholarships available — ask a coach if cost is a barrier.' },
    {
      name: 'requirements',
      type: 'array',
      labels: { singular: 'Requirement', plural: 'What to bring' },
      fields: [
        { name: 'item', type: 'text', required: true },
      ],
      defaultValue: [
        { item: 'Wrestling shoes (any brand)' },
        { item: 'Headgear (required for live wrestling)' },
        { item: 'Water bottle' },
        { item: 'Athletic clothes you can move in' },
      ],
    },
  ],
};
