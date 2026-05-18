import type { GlobalConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { isAdmin, isAdminOrCoach } from '../access';

export const ContactConfig: GlobalConfig = {
  slug: 'contact-config',
  admin: { group: 'Site Config' },
  access: { read: isAdminOrCoach, update: isAdmin },
  fields: [
    {
      name: 'recipientEmails',
      type: 'array',
      fields: [{ name: 'email', type: 'email', required: true }],
    },
    { name: 'subjectPrefix', type: 'text', defaultValue: '[Lions Wrestling]' },
    { name: 'autoReplyEnabled', type: 'checkbox', defaultValue: true },
    { name: 'autoReplySubject', type: 'text', defaultValue: "We got your message — Lions Wrestling" },
    { name: 'autoReplyBody', type: 'richText', editor: lexicalEditor({}) },
    { name: 'turnstileEnabled', type: 'checkbox', defaultValue: false },
    { name: 'rateLimitPerHour', type: 'number', defaultValue: 5 },
  ],
};
