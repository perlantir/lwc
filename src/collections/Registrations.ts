import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminField, isAdminOrCoach } from '../access';

export const Registrations: CollectionConfig = {
  slug: 'registrations',
  admin: {
    useAsTitle: 'wrestlerLastName',
    defaultColumns: ['wrestlerFirstName', 'wrestlerLastName', 'grade', 'status', 'submittedAt'],
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
        { name: 'wrestlerFirstName', type: 'text', required: true, access: { update: isAdminField } },
        { name: 'wrestlerLastName', type: 'text', required: true, access: { update: isAdminField } },
      ],
    },
    { name: 'dob', type: 'date', required: true, access: { update: isAdminField } },
    { name: 'school', type: 'text', required: true, access: { update: isAdminField } },
    { name: 'grade', type: 'text', required: true, access: { update: isAdminField } },
    { name: 'weight', type: 'text', required: true, access: { update: isAdminField } },
    {
      name: 'gender',
      type: 'select',
      required: true,
      options: [
        { label: 'Boy', value: 'boy' },
        { label: 'Girl', value: 'girl' },
      ],
      access: { update: isAdminField },
    },
    { name: 'address', type: 'textarea', required: true, access: { update: isAdminField } },
    { name: 'parentName', type: 'text', required: true, access: { update: isAdminField } },
    { name: 'relationship', type: 'text', access: { update: isAdminField } },
    { name: 'parentPhone', type: 'text', required: true, access: { update: isAdminField } },
    { name: 'parentEmail', type: 'email', required: true, access: { update: isAdminField } },
    { name: 'consent', type: 'checkbox', required: true, access: { update: isAdminField } },
    { name: 'marketingOptIn', type: 'checkbox', defaultValue: false, access: { update: isAdminField } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Enrolled', value: 'enrolled' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    { name: 'internalNotes', type: 'textarea', access: { read: isAdminField, update: isAdminField } },
    { name: 'submittedAt', type: 'date', access: { update: isAdminField } },
    { name: 'ipHash', type: 'text', access: { read: isAdminField, update: isAdminField } },
    { name: 'userAgent', type: 'text', access: { read: isAdminField, update: isAdminField } },
  ],
};
