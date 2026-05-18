import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { SEED_EVENTS } from '@/lib/calendar';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const requireSecret = (req: NextRequest): NextResponse | null => {
  const provided = req.headers.get('x-bootstrap-secret') ?? req.nextUrl.searchParams.get('secret');
  const expected = process.env.PAYLOAD_SECRET;
  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
};

export async function POST(req: NextRequest) {
  const unauthorized = requireSecret(req);
  if (unauthorized) return unauthorized;

  const steps: string[] = [];
  const errors: string[] = [];

  try {
    const payload = await getPayload({ config });
    steps.push('payload-init: ok');

    const pushFn = (payload.db as unknown as { push?: () => Promise<unknown> }).push;
    if (typeof pushFn === 'function') {
      try {
        await pushFn.call(payload.db);
        steps.push('schema-push: ok');
      } catch (e) {
        errors.push(`schema-push: ${(e as Error).message}`);
      }
    } else {
      steps.push('schema-push: skipped (push() not available)');
    }

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
        data: { name: 'Site Admin', email: adminEmail, password: adminPassword, role: 'admin', active: true },
      });
      steps.push(`admin: created ${adminEmail}`);
    } else {
      steps.push(`admin: exists ${adminEmail}`);
    }

    const existingEvents = await payload.count({ collection: 'events' });
    if (existingEvents.totalDocs === 0) {
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
      steps.push(`events: seeded ${created}`);
    } else {
      steps.push(`events: ${existingEvents.totalDocs} already present`);
    }

    await payload.updateGlobal({
      slug: 'homepage',
      data: {
        heroEyebrow: 'Des Moines Christian Wrestling',
        heroHeading: 'Forge tough kids, faithful young men, and lifelong champions.',
        heroSubheading: 'A K–12 wrestling program built on Christ-centered character, technical mastery, and the grit only the mat can teach.',
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
        testimonialQuote: 'Wrestling at DMC stretched our son in every way — body, mind, and faith. He came home tougher and more humble.',
        testimonialAuthor: 'Parent of a 7th-grade wrestler',
        testimonialRole: '2024–25 season',
      },
    });
    steps.push('homepage: seeded');

    await payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          { label: 'Home', type: 'url', url: '/' },
          { label: 'About', type: 'url', url: '/about' },
          { label: 'Schedule', type: 'url', url: '/schedule' },
          { label: 'Results', type: 'url', url: '/results' },
          { label: 'Gallery', type: 'url', url: '/gallery' },
          { label: 'Contact', type: 'url', url: '/contact' },
        ],
        ctaLabel: 'Join the Lions',
        ctaHref: '/register',
      },
    });
    steps.push('header: seeded');

    await payload.updateGlobal({
      slug: 'footer',
      data: {
        quickLinks: [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Schedule', href: '/schedule' },
          { label: 'Results', href: '/results' },
          { label: 'Gallery', href: '/gallery' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    });
    steps.push('footer: seeded');

    await payload.updateGlobal({
      slug: 'contact-config',
      data: {
        recipientEmails: [{ email: 'lionswrestling@dmcschools.org' }],
        subjectPrefix: '[Lions Wrestling]',
        autoReplyEnabled: true,
        autoReplySubject: 'We got your message — Lions Wrestling',
        rateLimitPerHour: 5,
      },
    });
    steps.push('contact-config: seeded');

    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        siteName: 'DMC Lions Wrestling Club',
        tagline: 'Christ-centered wrestling, K–12.',
        maintenanceMode: false,
      },
    });
    steps.push('site-settings: seeded');

    return NextResponse.json({ ok: errors.length === 0, steps, errors });
  } catch (e) {
    errors.push(`fatal: ${(e as Error).message}`);
    return NextResponse.json({ ok: false, steps, errors }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
