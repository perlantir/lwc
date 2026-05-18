import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminField, isAdminOrCoach } from '../access';

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'status', 'submittedAt'],
    group: 'Submissions',
  },
  access: {
    read: isAdminOrCoach,
    create: () => true,
    update: isAdminOrCoach,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true, access: { update: isAdminField } },
        { name: 'lastName', type: 'text', required: true, access: { update: isAdminField } },
      ],
    },
    { name: 'email', type: 'email', required: true, access: { update: isAdminField } },
    { name: 'phone', type: 'text', access: { update: isAdminField } },
    { name: 'grade', type: 'text', access: { update: isAdminField } },
    { name: 'experience', type: 'text', access: { update: isAdminField } },
    { name: 'message', type: 'textarea', required: true, access: { update: isAdminField } },
    { name: 'marketingOptIn', type: 'checkbox', defaultValue: false, access: { update: isAdminField } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Read', value: 'read' },
        { label: 'Replied', value: 'replied' },
        { label: 'Archived', value: 'archived' },
        { label: 'Spam', value: 'spam' },
      ],
    },
    { name: 'internalNotes', type: 'textarea', access: { read: isAdminField, update: isAdminField } },
    { name: 'submittedAt', type: 'date', access: { update: isAdminField } },
    { name: 'ipHash', type: 'text', access: { read: isAdminField, update: isAdminField } },
    { name: 'userAgent', type: 'text', access: { read: isAdminField, update: isAdminField } },
  ],
};
