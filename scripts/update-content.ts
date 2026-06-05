import 'dotenv/config';
import { getPayload } from 'payload';
import config from '../src/payload.config';

/**
 * One-shot content updater for the June 2026 copy refresh.
 *
 * Updates Homepage hero copy, header/CTA labels, footer contact info, About
 * page banner + stats, and Contact page FAQ.
 *
 * Re-runnable: each updateGlobal call patches only the fields listed below,
 * leaving everything else (images, other text) untouched.
 *
 * Run: DATABASE_URL=<prod-url> tsx scripts/update-content.ts
 */
const run = async (): Promise<void> => {
  const payload = await getPayload({ config });

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      heroHeading: 'Iron\nSharpens\nIron',
      heroSubheading: 'Christ-centered wrestling. Purpose-driven development.',
      heroPrimaryCtaLabel: 'Register here July 1',
    },
  });
  process.stdout.write('Updated homepage hero\n');

  await payload.updateGlobal({
    slug: 'header',
    data: {
      ctaLabel: 'Register here July 1',
      instagramUrl: 'https://www.instagram.com/lionswrestlingclub',
    },
  });
  process.stdout.write('Updated header CTA + Instagram\n');

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      address: '13007 Douglas Pkwy, Urbandale, IA 50323',
      phone: '',
      email: 'Topher.ewing@dmcs.org',
      instagramUrl: 'https://www.instagram.com/lionswrestlingclub',
    },
  });
  process.stdout.write('Updated footer contact + Instagram\n');

  await payload.updateGlobal({
    slug: 'cta-strip',
    data: {
      buttonLabel: 'Register here July 1',
    },
  });
  process.stdout.write('Updated CTA strip button label\n');

  await payload.updateGlobal({
    slug: 'about-page',
    data: {
      bannerTitle: 'A Wrestling Family',
      bannerBody: 'Faith. Discipline. Excellence.',
      stats: [
        { value: '1', label: 'Years Strong' },
        { value: '80+', label: 'Athletes' },
      ],
    },
  });
  process.stdout.write('Updated about page banner + stats\n');

  const contactPage = (await payload.findGlobal({ slug: 'contact-page' })) as {
    faqs?: Array<{ id?: string; question?: string; answer?: string }>;
  };
  const faqs = (contactPage.faqs ?? []).map((f) => {
    if ((f.question ?? '').toLowerCase().includes('wrestling experience')) {
      return { ...f, answer: 'No. We welcome first-time wrestlers at every age group from K through 8th grade.' };
    }
    return f;
  });
  await payload.updateGlobal({ slug: 'contact-page', data: { faqs } });
  process.stdout.write('Updated contact page FAQ (K-8)\n');

  process.stdout.write('\nContent update complete.\n');
  process.exit(0);
};

run().catch((e) => {
  process.stderr.write(`Update failed: ${(e as Error).message}\n`);
  process.exit(1);
});
