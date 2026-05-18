import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { isAdminOrCoach, isPublic } from '../access';
import { revalidateFrontend } from '../hooks/revalidate';

export const Coaches: CollectionConfig = {
  slug: 'coaches',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'order'],
    group: 'Content',
  },
  access: {
    read: isPublic,
    create: isAdminOrCoach,
    update: isAdminOrCoach,
    delete: isAdminOrCoach,
  },
  hooks: { afterChange: [revalidateFrontend(['/about'])] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'richText', editor: lexicalEditor({}) },
    { name: 'email', type: 'email' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
};
