import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  admin: { group: 'Pages' },
  access: { read: isPublic, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(['/about'])] },
  fields: [
    { name: 'bannerEyebrow', type: 'text', defaultValue: 'About' },
    { name: 'bannerTitle', type: 'text', defaultValue: 'The Lions Wrestling Club' },
    { name: 'bannerBody', type: 'textarea', defaultValue: 'Christ-centered wrestling at Des Moines Christian — building strong bodies, sharp minds, and faithful young men and women.' },
    { name: 'bannerImage', type: 'upload', relationTo: 'media', admin: { description: 'Optional background image for the page header.' } },
    { name: 'missionEyebrow', type: 'text', defaultValue: 'Mission' },
    { name: 'missionHeading', type: 'text', defaultValue: 'Wrestling forms more than wrestlers — it forms people.' },
    { name: 'missionBody', type: 'textarea', defaultValue: 'We pursue technical excellence and competitive success — and we believe the deeper win is who an athlete becomes through the sport: humble, disciplined, courageous, faithful.' },
    {
      name: 'values',
      type: 'array',
      labels: { singular: 'Value', plural: 'Values' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
      ],
      defaultValue: [
        { title: 'Faith', body: 'Christ-centered coaching, character formation that lasts past the season.' },
        { title: 'Discipline', body: 'Show up. Do the work. Repeat. The mat rewards consistency.' },
        { title: 'Excellence', body: 'World-class technique, every age, every weight, every drill.' },
      ],
    },
    { name: 'staffEyebrow', type: 'text', defaultValue: 'Coaching Staff' },
    { name: 'staffHeading', type: 'text', defaultValue: 'Meet the coaches' },
    { name: 'staffEmptyMessage', type: 'text', defaultValue: 'Coach bios coming soon — populated via the admin.' },
  ],
};
