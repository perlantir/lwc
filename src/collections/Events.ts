import type { CollectionConfig } from 'payload';
import { isAdminOrCoach, readPublishedOrAdmin } from '../access';
import { revalidateFrontend } from '../hooks/revalidate';

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'time', 'kind', 'status'],
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
    afterChange: [revalidateFrontend(['/', '/schedule', '/events.ics'])],
    afterDelete: [revalidateFrontend(['/', '/schedule', '/events.ics'])],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'date', type: 'date', required: true, index: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    {
      name: 'time',
      type: 'text',
      admin: { description: 'Display string: "5:30 PM", "All Day", "10:00 AM"' },
    },
    { name: 'allDay', type: 'checkbox', defaultValue: false },
    {
      name: 'kind',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'home',
      options: [
        { label: 'Home Match', value: 'home' },
        { label: 'Away Match', value: 'away' },
        { label: 'Tournament', value: 'tour' },
        { label: 'Practice', value: 'prac' },
      ],
    },
    { name: 'location', type: 'text' },
    { name: 'notes', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      required: true,
      index: true,
      defaultValue: 'published',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'sequence',
      type: 'number',
      defaultValue: 0,
      admin: { hidden: true, description: 'ICS SEQUENCE counter, incremented on save.' },
    },
    {
      type: 'collapsible',
      label: 'Recurrence (for practices and weekly meets)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'recurring',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Tick to repeat this event on a weekly schedule.' },
        },
        {
          name: 'recurrenceDays',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Monday', value: 'mon' },
            { label: 'Tuesday', value: 'tue' },
            { label: 'Wednesday', value: 'wed' },
            { label: 'Thursday', value: 'thu' },
            { label: 'Friday', value: 'fri' },
            { label: 'Saturday', value: 'sat' },
            { label: 'Sunday', value: 'sun' },
          ],
          admin: {
            description: 'Pick the days of the week this event repeats. (Practice every Tue + Thu? Pick both.)',
            condition: (_, siblingData) => Boolean(siblingData?.recurring),
          },
        },
        {
          name: 'recurrenceEnd',
          type: 'date',
          admin: {
            description: 'Stop generating recurring occurrences on this date (inclusive).',
            date: { pickerAppearance: 'dayOnly' },
            condition: (_, siblingData) => Boolean(siblingData?.recurring),
          },
        },
      ],
    },
  ],
};
