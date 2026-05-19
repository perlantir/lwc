import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const ResultsPage: GlobalConfig = {
  slug: 'results-page',
  admin: {
    group: 'Pages',
    description:
      'This page controls the HEADING and INTRO at the top of /results only. To add or edit individual match recaps that show in the list below, go to Content → Recaps in the left sidebar.',
    livePreview: {
      url: `${process.env.SITE_URL ?? 'http://localhost:3000'}/results`,
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 812 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  access: { read: isPublic, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(['/results'])] },
  fields: [
    { name: 'bannerEyebrow', type: 'text', defaultValue: 'Results', admin: { description: 'Small label above the title.' } },
    { name: 'bannerTitle', type: 'text', defaultValue: 'Recent Match Recaps', admin: { description: 'Main heading at the top of the page.' } },
    { name: 'bannerBody', type: 'textarea', defaultValue: 'How the Lions are doing on the mat — recaps, highlights, and reflections from this season.', admin: { description: 'One or two sentences below the heading.' } },
    { name: 'bannerImage', type: 'upload', relationTo: 'media', admin: { description: 'Optional background image for the hero.' } },
    { name: 'emptyMessage', type: 'text', defaultValue: 'No recaps published yet. Check back after our first competition.', admin: { description: 'Shown when there are no recaps yet.' } },
  ],
};
