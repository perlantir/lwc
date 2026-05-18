import type { CollectionConfig } from 'payload';
import { isAdminOrCoach, isPublic } from '../access';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'public/uploads',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 300, height: undefined, position: 'centre' },
      { name: 'card', width: 600, height: undefined, position: 'centre' },
      { name: 'feature', width: 1200, height: undefined, position: 'centre' },
    ],
    formatOptions: { format: 'webp', options: { quality: 82 } },
  },
  admin: {
    useAsTitle: 'alt',
    group: 'Media',
  },
  access: {
    read: isPublic,
    create: isAdminOrCoach,
    update: isAdminOrCoach,
    delete: isAdminOrCoach,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Required for accessibility. Describe the image for screen readers.',
      },
    },
    { name: 'caption', type: 'text' },
  ],
};
