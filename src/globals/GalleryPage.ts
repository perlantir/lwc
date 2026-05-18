import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const GalleryPage: GlobalConfig = {
  slug: 'gallery-page',
  admin: { group: 'Pages' },
  access: { read: isPublic, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(['/gallery'])] },
  fields: [
    { name: 'bannerEyebrow', type: 'text', defaultValue: 'Gallery' },
    { name: 'bannerTitle', type: 'text', defaultValue: 'From the Mat' },
    { name: 'bannerBody', type: 'textarea', defaultValue: 'Photos and highlight clips of Lions wrestlers in action.' },
    { name: 'bannerImage', type: 'upload', relationTo: 'media' },
    { name: 'featuredVideoUrl', type: 'text', admin: { description: 'YouTube URL for the gallery hero video.' } },
    { name: 'emptyMessage', type: 'text', defaultValue: 'No photos uploaded yet.' },
  ],
};
