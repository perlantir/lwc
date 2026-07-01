import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { SEED_EVENTS } from '@/lib/calendar';
import { pushDevSchema } from '@payloadcms/drizzle';

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

    try {
      await pushDevSchema(payload.db as unknown as Parameters<typeof pushDevSchema>[0]);
      steps.push('schema-push: ok');
    } catch (e) {
      errors.push(`schema-push: ${(e as Error).message}`);
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

    // Partial update: only the fields we need to restore/enforce.
    // Never full-replace — that would wipe custom CMS edits.
    await payload.updateGlobal({
      slug: 'homepage',
      data: {
        heroHeading: 'Iron\nSharpens\nIron',
        heroSubheading: 'Christ-centered wrestling. Purpose-driven development.',
        heroPrimaryCtaHref: 'https://www.dmcsevents.com',
      },
    });
    steps.push('homepage: restored hero + register href');

    await payload.updateGlobal({
      slug: 'header',
      data: {
        ctaHref: 'https://www.dmcsevents.com',
      },
    });
    steps.push('header: register href updated');

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
        siteName: 'DMCS Lions Wrestling Club',
        tagline: 'Christ-centered wrestling, K–12.',
        maintenanceMode: false,
      },
    });
    steps.push('site-settings: seeded');

    // Partial updates: only these specific fields, preserving any other CMS edits.
    try {
      await payload.updateGlobal({
        slug: 'cta-strip',
        data: { buttonHref: 'https://www.dmcsevents.com' },
      });
      steps.push('cta-strip.buttonHref: updated');
    } catch (e) {
      errors.push(`cta-strip: ${(e as Error).message}`);
    }

    try {
      await payload.updateGlobal({
        slug: 'schedule-page',
        data: {
          bannerBody:
            'Practices held Monday & Thursdays at the NEW Des Moines Christian Early Education Building Gymnasium',
        },
      });
      steps.push('schedule-page.bannerBody: updated');
    } catch (e) {
      errors.push(`schedule-page: ${(e as Error).message}`);
    }

    return NextResponse.json({ ok: errors.length === 0, steps, errors });
  } catch (e) {
    errors.push(`fatal: ${(e as Error).message}`);
    return NextResponse.json({ ok: false, steps, errors }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
