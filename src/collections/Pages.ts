import type { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { isAdminOrCoach, readPublishedOrAdmin } from '../access';
import { revalidateFrontend } from '../hooks/revalidate';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status'],
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
    afterChange: [revalidateFrontend(['/'])],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        {
          slug: 'hero',
          fields: [
            { name: 'eyebrow', type: 'text' },
            { name: 'heading', type: 'text', required: true },
            { name: 'subheading', type: 'textarea' },
            { name: 'image', type: 'upload', relationTo: 'media' },
            { name: 'primaryCtaLabel', type: 'text' },
            { name: 'primaryCtaHref', type: 'text' },
          ],
        },
        {
          slug: 'richText',
          fields: [{ name: 'content', type: 'richText', editor: lexicalEditor({}) }],
        },
        {
          slug: 'ctaStrip',
          fields: [
            { name: 'heading', type: 'text', required: true },
            { name: 'body', type: 'textarea' },
            { name: 'buttonLabel', type: 'text' },
            { name: 'buttonHref', type: 'text' },
          ],
        },
        {
          slug: 'faqAccordion',
          fields: [
            {
              name: 'items',
              type: 'array',
              fields: [
                { name: 'q', type: 'text', required: true },
                { name: 'a', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          slug: 'mediaEmbed',
          fields: [
            { name: 'url', type: 'text', required: true, admin: { description: 'YouTube or Vimeo URL' } },
            { name: 'caption', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
        { name: 'canonical', type: 'text' },
        { name: 'noIndex', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    { name: 'publishedAt', type: 'date' },
  ],
};
