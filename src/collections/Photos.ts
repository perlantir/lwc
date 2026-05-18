import type { CollectionConfig } from 'payload';
import { isAdminOrCoach, isPublic } from '../access';
import { revalidateFrontend } from '../hooks/revalidate';

export const Photos: CollectionConfig = {
  slug: 'photos',
  upload: {
    staticDir: 'public/uploads/photos',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    imageSizes: [
      { name: 'thumbnail', width: 300, height: undefined, position: 'centre' },
      { name: 'card', width: 600, height: undefined, position: 'centre' },
      { name: 'feature', width: 1200, height: undefined, position: 'centre' },
    ],
    formatOptions: { format: 'webp', options: { quality: 82 } },
  },
  admin: {
    useAsTitle: 'caption',
    defaultColumns: ['caption', 'date', 'album', 'featured'],
    group: 'Gallery',
  },
  access: {
    read: isPublic,
    create: isAdminOrCoach,
    update: isAdminOrCoach,
    delete: isAdminOrCoach,
  },
  hooks: {
    afterChange: [revalidateFrontend(['/', '/gallery'])],
    afterDelete: [revalidateFrontend(['/', '/gallery'])],
  },
  fields: [
    { name: 'alt', type: 'text', required: true, admin: { description: 'Required alt text' } },
    { name: 'caption', type: 'text' },
    { name: 'date', type: 'date' },
    { name: 'album', type: 'relationship', relationTo: 'albums' },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
};
