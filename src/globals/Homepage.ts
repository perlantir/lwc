import type { GlobalConfig } from 'payload';
import { isAdminOrCoach, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';
const LP_BREAKPOINTS = [
  { label: 'Mobile', name: 'mobile', width: 375, height: 812 },
  { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
  { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
];

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  admin: {
    group: 'Site Config',
    livePreview: { url: SITE_URL, breakpoints: LP_BREAKPOINTS },
  },
  access: { read: isPublic, update: isAdminOrCoach },
  hooks: { afterChange: [revalidateGlobal(['/'])] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { name: 'heroEyebrow', type: 'text', defaultValue: 'Des Moines Christian Wrestling' },
            {
              name: 'heroHeading',
              type: 'text',
              defaultValue: 'Forge tough kids, faithful young men, and lifelong champions.',
            },
            {
              name: 'heroAttribution',
              type: 'text',
              admin: { description: 'Small line below the heading (e.g., a Bible verse reference). Leave blank to hide.' },
            },
            {
              name: 'heroSubheading',
              type: 'textarea',
              defaultValue:
                'A K–12 wrestling program built on Christ-centered character, technical mastery, and the grit only the mat can teach.',
            },
            { name: 'heroBackgroundImage', type: 'upload', relationTo: 'media' },
            { name: 'heroPrimaryCtaLabel', type: 'text', defaultValue: 'Register a Wrestler' },
            { name: 'heroPrimaryCtaHref', type: 'text', defaultValue: '/register' },
            { name: 'heroSecondaryCtaLabel', type: 'text', defaultValue: 'View Schedule' },
            { name: 'heroSecondaryCtaHref', type: 'text', defaultValue: '/schedule' },
          ],
        },
        {
          label: 'Mission',
          fields: [
            { name: 'missionHeading', type: 'text', defaultValue: 'Built for the long match' },
            { name: 'missionBody', type: 'textarea' },
            { name: 'missionPhoto', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Programs',
          fields: [
            {
              name: 'programCards',
              type: 'array',
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'ageRange', type: 'text' },
                { name: 'body', type: 'textarea' },
                { name: 'ctaLabel', type: 'text' },
                { name: 'ctaHref', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Testimonial',
          fields: [
            { name: 'testimonialQuote', type: 'textarea' },
            { name: 'testimonialAuthor', type: 'text' },
            { name: 'testimonialRole', type: 'text' },
          ],
        },
      ],
    },
  ],
};
