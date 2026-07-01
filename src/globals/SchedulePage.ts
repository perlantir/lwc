import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const SchedulePage: GlobalConfig = {
  slug: 'schedule-page',
  admin: {
    group: 'Pages',
    description:
      'Controls the /schedule page heading and intro. To add or edit matches, tournaments, and practices that show in the list, go to Content → Events in the sidebar.',
    livePreview: {
      url: `${process.env.SITE_URL ?? 'http://localhost:3000'}/schedule`,
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 812 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  access: { read: isPublic, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(['/schedule'])] },
  fields: [
    { name: 'bannerEyebrow', type: 'text', defaultValue: 'Schedule' },
    { name: 'bannerTitle', type: 'text', defaultValue: '2025-26 Season' },
    { name: 'bannerBody', type: 'textarea', defaultValue: 'Practices held Monday & Thursdays at the NEW Des Moines Christian Early Education Building Gymnasium' },
    { name: 'bannerImage', type: 'upload', relationTo: 'media' },
    { name: 'subscribeLabel', type: 'text', defaultValue: 'Subscribe to Calendar' },
    { name: 'subscribeDescription', type: 'textarea', defaultValue: 'Add to your phone or computer so updates appear automatically.' },
    { name: 'emptyMessage', type: 'text', defaultValue: 'Schedule not yet published. Check back soon.' },
  ],
};
