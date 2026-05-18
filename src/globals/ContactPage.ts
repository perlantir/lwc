import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const ContactPage: GlobalConfig = {
  slug: 'contact-page',
  admin: { group: 'Pages' },
  access: { read: isPublic, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(['/contact'])] },
  fields: [
    { name: 'bannerEyebrow', type: 'text', defaultValue: 'Contact' },
    { name: 'bannerTitle', type: 'text', defaultValue: "Let's talk wrestling." },
    { name: 'bannerBody', type: 'textarea', defaultValue: "Questions about the program, scheduling, or how to get involved? Send us a note — we'll get back within 1–2 business days." },
    { name: 'bannerImage', type: 'upload', relationTo: 'media' },
    { name: 'formHeading', type: 'text', defaultValue: 'Send a message' },
    { name: 'faqHeading', type: 'text', defaultValue: 'Common Questions' },
    {
      name: 'faqs',
      type: 'array',
      labels: { singular: 'FAQ', plural: 'FAQs' },
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
      defaultValue: [
        { question: 'When does the season start?', answer: 'Practices begin in early November; first competitions are late November.' },
        { question: 'What does it cost?', answer: 'Registration fees vary by age group. See the /register page for the current season.' },
        { question: 'Do I need wrestling experience?', answer: 'No. We welcome first-time wrestlers at every age group from K through 12th grade.' },
        { question: 'What equipment do I need?', answer: 'Wrestling shoes and headgear. We can help direct you to local sources.' },
      ],
    },
  ],
};
