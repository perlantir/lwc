import 'dotenv/config';
import { getPayload } from 'payload';
import config from '../src/payload.config';
import { SEED_EVENTS } from '../src/lib/calendar';

const run = async (): Promise<void> => {
  const payload = await getPayload({ config });

  // 1. Seed admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@dmcschools.org';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMeNow_VeryStrong_2026';

  const existingAdmin = await payload.find({
    collection: 'users',
    where: { email: { equals: adminEmail } },
    limit: 1,
  });

  if (existingAdmin.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: {
        name: 'Site Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        active: true,
      },
    });
    process.stdout.write(`Created admin user: ${adminEmail}\n`);
  } else {
    process.stdout.write(`Admin user already exists: ${adminEmail}\n`);
  }

  // 2. Seed events from handoff
  const existing = await payload.count({ collection: 'events' });
  if (existing.totalDocs === 0) {
    let created = 0;
    for (const e of SEED_EVENTS) {
      await payload.create({
        collection: 'events',
        data: {
          title: e.title,
          date: e.date,
          time: e.time,
          allDay: e.time === 'All Day',
          kind: e.kind,
          location: e.location ?? '',
          notes: e.notes ?? '',
          status: 'published',
          sequence: 0,
        },
        context: { disableRevalidate: true },
      });
      created++;
    }
    process.stdout.write(`Seeded ${created} events\n`);
  } else {
    process.stdout.write(`Events already exist (${existing.totalDocs} docs) — skipping seed\n`);
  }

  // 3. Seed Homepage defaults
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      heroEyebrow: 'Des Moines Christian Wrestling',
      heroHeading: 'Forge tough kids, faithful young men, and lifelong champions.',
      heroSubheading:
        'A K–12 wrestling program built on Christ-centered character, technical mastery, and the grit only the mat can teach.',
      heroPrimaryCtaLabel: 'Register a Wrestler',
      heroPrimaryCtaHref: '/register',
      heroSecondaryCtaLabel: 'View Schedule',
      heroSecondaryCtaHref: '/schedule',
      missionHeading: 'Built for the long match',
      programCards: [
        { title: 'Mini Lions (K–2)', ageRange: 'K – 2', body: 'Fundamentals through play. Mat awareness, position, fall safely.' },
        { title: 'Youth (3–6)', ageRange: '3rd – 6th', body: 'Real technique, real competition. Local tournaments optional.' },
        { title: 'Middle & High School', ageRange: '7th – 12th', body: 'Conditioning, technique, dual + tournament season.' },
      ],
      testimonialQuote:
        'Wrestling at DMC stretched our son in every way — body, mind, and faith. He came home tougher and more humble.',
      testimonialAuthor: 'Parent of a 7th-grade wrestler',
      testimonialRole: '2024–25 season',
    },
  });
  process.stdout.write('Seeded Homepage global defaults\n');

  // 4. Seed Header nav
  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        { label: 'Home', type: 'url', url: '/' },
        { label: 'About', type: 'url', url: '/about' },
        { label: 'Schedule', type: 'url', url: '/schedule' },
        { label: 'Contact', type: 'url', url: '/contact' },
      ],
      ctaLabel: 'Join the Lions',
      ctaHref: '/register',
    },
  });
  process.stdout.write('Seeded Header global\n');

  // 5. Seed Footer
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      quickLinks: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Schedule', href: '/schedule' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  });
  process.stdout.write('Seeded Footer global\n');

  // 6. Seed ContactConfig
  await payload.updateGlobal({
    slug: 'contact-config',
    data: {
      recipientEmails: [{ email: 'lionswrestling@dmcschools.org' }],
      subjectPrefix: '[Lions Wrestling]',
      autoReplyEnabled: true,
      autoReplySubject: "We got your message — Lions Wrestling",
      rateLimitPerHour: 5,
    },
  });
  process.stdout.write('Seeded ContactConfig\n');

  // 7. Seed SiteSettings
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'DMC Lions Wrestling Club',
      tagline: 'Christ-centered wrestling, K–12.',
      maintenanceMode: false,
    },
  });
  process.stdout.write('Seeded SiteSettings\n');

  process.stdout.write('\nSeed complete.\n');
  process.exit(0);
};

run().catch((e) => {
  process.stderr.write(`Seed failed: ${(e as Error).message}\n`);
  process.exit(1);
});
