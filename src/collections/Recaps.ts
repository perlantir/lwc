import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { isAdminOrCoach, readPublishedOrAdmin } from '../access';
import { revalidateFrontend } from '../hooks/revalidate';

export const Recaps: CollectionConfig = {
  slug: 'recaps',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['date', 'title', 'status'],
    group: 'Content',
  },
  versions: { drafts: { autosave: false } },
  access: {
    read: readPublishedOrAdmin,
    create: isAdminOrCoach,
    update: isAdminOrCoach,
    delete: isAdminOrCoach,
  },
  hooks: {
    afterChange: [revalidateFrontend(['/', '/results'])],
    afterDelete: [revalidateFrontend(['/', '/results'])],
  },
  fields: [
    { name: 'date', type: 'date', required: true, index: true },
    { name: 'kicker', type: 'text' },
    { name: 'title', type: 'text', required: true },
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor({}),
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'icon',
          type: 'select',
          options: [
            { label: 'Bout', value: 'bout' },
            { label: 'Pin', value: 'pin' },
            { label: 'Location', value: 'location' },
            { label: 'Trophy', value: 'trophy' },
            { label: 'Lightning', value: 'bolt' },
          ],
        },
        { name: 'label', type: 'text', required: true },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
  ],
};
