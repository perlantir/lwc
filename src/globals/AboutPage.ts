import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../access';
import { revalidateGlobal } from '../hooks/revalidate';

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  admin: {
    group: 'Pages',
    description:
      'Controls the /about page heading, story, stats, and values. To add or edit coach bios that show in the "Coaching Staff" section, go to Content → Coaches in the sidebar.',
    livePreview: {
      url: `${process.env.SITE_URL ?? 'http://localhost:3000'}/about`,
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 812 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  access: { read: isPublic, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal(['/about'])] },
  fields: [
    { name: 'bannerEyebrow', type: 'text', defaultValue: 'About' },
    { name: 'bannerTitle', type: 'text', defaultValue: 'More than a team. A brotherhood.' },
    { name: 'bannerBody', type: 'textarea', defaultValue: 'For over two decades, Lions Wrestling has shaped student-athletes through faith, hard work, and discipline — building champions on the mat and leaders in life.' },
    { name: 'bannerImage', type: 'upload', relationTo: 'media' },
    {
      name: 'stats',
      type: 'array',
      labels: { singular: 'Stat', plural: 'Highlight stats (under banner)' },
      fields: [
        { name: 'value', type: 'text', required: true, admin: { description: 'e.g., 24 or 80+' } },
        { name: 'label', type: 'text', required: true },
      ],
      defaultValue: [
        { value: '24', label: 'Years Strong' },
        { value: '12', label: 'State Qualifiers' },
        { value: '3', label: 'State Champions' },
        { value: '80+', label: 'Athletes Today' },
      ],
    },
    // Legacy fields — kept so Drizzle push doesn't prompt rename. Not surfaced anywhere.
    { name: 'missionEyebrow', type: 'text', admin: { hidden: true } },
    { name: 'missionHeading', type: 'text', admin: { hidden: true } },
    { name: 'missionBody', type: 'textarea', admin: { hidden: true } },
    { name: 'storyEyebrow', type: 'text', defaultValue: 'Our Story' },
    { name: 'storyHeading', type: 'text', defaultValue: 'Built on the mat. Shaped by faith.' },
    {
      name: 'storyParagraphs',
      type: 'array',
      labels: { singular: 'Paragraph', plural: 'Story paragraphs' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
      defaultValue: [
        { text: 'The Lions Wrestling Club was founded with a simple belief — that the lessons learned on a wrestling mat shape the men our young athletes become off of it. Discipline, humility, perseverance, and grace under pressure are not just wrestling skills; they are life skills.' },
        { text: 'Today, we serve athletes from kindergarten through twelfth grade across the Des Moines metro, training side-by-side under coaches who have walked the same path. Our program is competitive at the state level, but our scoreboard is bigger than wins — it\'s the young people who leave our program ready to lead.' },
      ],
    },
    { name: 'storyImage', type: 'upload', relationTo: 'media', admin: { description: 'Photo shown next to the story.' } },
    { name: 'storyBadgeBig', type: 'text', defaultValue: 'Est. 2002' },
    { name: 'storyBadgeSmall', type: 'text', defaultValue: 'Des Moines Christian' },
    { name: 'valuesEyebrow', type: 'text', defaultValue: 'Three Pillars' },
    { name: 'valuesHeading', type: 'text', defaultValue: 'What we stand for' },
    {
      name: 'values',
      type: 'array',
      labels: { singular: 'Value', plural: 'Values' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'verse', type: 'text', admin: { description: 'Short subtitle, e.g., "Rooted in Christ"' } },
        { name: 'body', type: 'textarea', required: true },
      ],
      defaultValue: [
        { title: 'Faith', verse: 'Rooted in Christ', body: 'We compete with conviction, pray before we step on the mat, and trust that every match — won or lost — is shaping us into who God called us to be.' },
        { title: 'Discipline', verse: 'Built on Character', body: 'Show up. Work hard. Tell the truth. Wrestling rewards repetition and integrity — the same habits that make our athletes successful in everything else they pursue.' },
        { title: 'Excellence', verse: 'Pursuing Greatness', body: "Good enough isn't. We chase greatness in technique, in conditioning, and in the way we carry ourselves — because how we do anything is how we do everything." },
      ],
    },
    { name: 'staffEyebrow', type: 'text', defaultValue: 'Coaching Staff' },
    { name: 'staffHeading', type: 'text', defaultValue: 'The men in the corner' },
    { name: 'staffEmptyMessage', type: 'text', defaultValue: 'Coach bios coming soon — populated via the admin.' },
  ],
};
