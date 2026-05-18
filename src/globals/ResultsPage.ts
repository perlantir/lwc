import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const ResultsPage: GlobalConfig = {
  slug: 'results-page',
  admin: { group: 'Pages' },
  access: { read: isPublic, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(['/results'])] },
  fields: [
    { name: 'bannerEyebrow', type: 'text', defaultValue: 'Results' },
    { name: 'bannerTitle', type: 'text', defaultValue: 'Recent Match Recaps' },
    { name: 'bannerBody', type: 'textarea', defaultValue: 'How the Lions are doing on the mat — recaps, highlights, and reflections from this season.' },
    { name: 'bannerImage', type: 'upload', relationTo: 'media' },
    { name: 'emptyMessage', type: 'text', defaultValue: 'No recaps published yet. Check back after our first competition.' },
  ],
};
