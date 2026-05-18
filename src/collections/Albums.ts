import type { CollectionConfig } from 'payload';
import { isAdminOrCoach, isPublic } from '../access';
import { revalidateFrontend } from '../hooks/revalidate';

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const Albums: CollectionConfig = {
  slug: 'albums',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date'],
    group: 'Gallery',
  },
  access: {
    read: isPublic,
    create: isAdminOrCoach,
    update: isAdminOrCoach,
    delete: isAdminOrCoach,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.title && !data.slug) data.slug = slugify(data.title);
        return data;
      },
    ],
    afterChange: [revalidateFrontend(['/gallery'])],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, index: true },
    { name: 'date', type: 'date' },
    { name: 'coverPhoto', type: 'relationship', relationTo: 'photos' },
    { name: 'description', type: 'textarea' },
  ],
};
