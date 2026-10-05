import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { getPayload } from 'payload';
import config from '../src/payload.config';

/**
 * October 2026 content update:
 *   - Homepage testimonial → Dan Gable quote
 *   - About page "80+ Athletes" → "50+ Athletes"
 *   - Schedule page title → 2026–27 Season Schedule
 *   - Add coaches: Justin Kennedy, Andrew Zellmer (Volunteer Assistant),
 *                  Neil Erickson (Operations Director),
 *                  Austin Blomquist (Club Coach, with photo from unnamed.jpg)
 *   - Swap Cobe's photo (unnamed.jpg) + add Austin Blomquist with his photo (unnamed 1.jpg)
 *
 * Re-runnable: coaches are skipped if already present by name.
 *
 * Run: DATABASE_URL=<prod-url> BLOB_READ_WRITE_TOKEN=<token> tsx scripts/update-oct-2026.ts
 */

type CoachDoc = { id: string | number; name: string; order?: number | null };
type StatItem = { id?: string; value?: string; label?: string };
type AboutPageGlobal = { stats?: StatItem[] };

const run = async (): Promise<void> => {
  const payload = await getPayload({ config });

  // 1. Homepage testimonial
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      testimonialQuote: "Once you've wrestled, everything else in life is easy.",
      testimonialAuthor: 'Dan Gable',
      testimonialRole: '',
    },
  });
  process.stdout.write('Updated homepage testimonial → Dan Gable quote\n');

  // 2. Schedule page title
  await payload.updateGlobal({
    slug: 'schedule-page',
    data: { bannerTitle: '2026–27 Season Schedule' },
  });
  process.stdout.write('Updated schedule page title → 2026–27 Season Schedule\n');

  // 3. About page: 80+ → 50+ Athletes
  const aboutPage = (await payload.findGlobal({ slug: 'about-page' })) as AboutPageGlobal;
  const updatedStats = (aboutPage.stats ?? []).map((s) =>
    s.label === 'Athletes' ? { ...s, value: '50+' } : s,
  );
  await payload.updateGlobal({ slug: 'about-page', data: { stats: updatedStats } });
  process.stdout.write('Updated about page: 80+ → 50+ Athletes\n');

  // 4. Upload photos: unnamed.jpg → Cobe, "unnamed 1.jpg" → Austin Blomquist
  const uploadPhoto = async (filePath: string, alt: string, name: string) => {
    if (!fs.existsSync(filePath)) {
      process.stdout.write(`${filePath} not found — skipping\n`);
      return null;
    }
    const data = fs.readFileSync(filePath);
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data, mimetype: 'image/jpeg', name, size: data.length },
    });
    process.stdout.write(`Uploaded ${name} → media ID ${doc.id}\n`);
    return doc.id as string | number;
  };

  const cobePhotoId = await uploadPhoto(
    path.join(process.cwd(), 'unnamed.jpg'),
    'Coach Cobe',
    'cobe-photo.jpg',
  );
  const austinPhotoId = await uploadPhoto(
    path.join(process.cwd(), 'unnamed 1.jpg'),
    'Coach Austin Blomquist',
    'austin-blomquist-photo.jpg',
  );

  // 5. Add coaches (skip if already present by name)
  const existing = await payload.find({ collection: 'coaches', limit: 100 });
  const existingNames = new Set(
    (existing.docs as CoachDoc[]).map((c) => c.name.toLowerCase()),
  );
  const maxOrder = (existing.docs as CoachDoc[]).reduce(
    (max, c) => Math.max(max, c.order ?? 0),
    0,
  );

  // Text-only coaches
  const newCoaches = [
    { name: 'Justin Kennedy', role: 'Volunteer Assistant Coach', order: maxOrder + 1 },
    { name: 'Andrew Zellmer', role: 'Volunteer Assistant Coach', order: maxOrder + 2 },
    { name: 'Neil Erickson', role: 'Operations Director', order: maxOrder + 3 },
  ];

  for (const coach of newCoaches) {
    if (existingNames.has(coach.name.toLowerCase())) {
      process.stdout.write(`Skipped ${coach.name} (already exists)\n`);
      continue;
    }
    await payload.create({ collection: 'coaches', data: coach });
    process.stdout.write(`Added ${coach.name} — ${coach.role}\n`);
  }

  // Austin Blomquist — new coach with his own photo
  if (existingNames.has('austin blomquist')) {
    process.stdout.write('Skipped Austin Blomquist (already exists)\n');
  } else {
    await payload.create({
      collection: 'coaches',
      data: {
        name: 'Austin Blomquist',
        role: 'Club Coach',
        bio: { root: { type: 'root', version: 1, children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', text: '3-Time Arizona State Placer & State Finalist', version: 1 }] }] } },
        ...(austinPhotoId ? { photo: austinPhotoId } : {}),
        order: maxOrder + 4,
      },
    });
    process.stdout.write('Added Austin Blomquist — Club Coach\n');
  }

  // Cobe photo swap
  if (cobePhotoId) {
    const cobe = (existing.docs as CoachDoc[]).find(
      (c) => c.name.toLowerCase().includes('cobe'),
    );
    if (cobe) {
      await payload.update({ collection: 'coaches', id: cobe.id, data: { photo: cobePhotoId } });
      process.stdout.write(`Updated Cobe's photo → media ID ${cobePhotoId}\n`);
    } else {
      process.stdout.write('Cobe not found in coaches collection — skipping photo swap\n');
    }
  }

  process.stdout.write('\nOctober 2026 content update complete.\n');
  process.exit(0);
};

run().catch((e) => {
  process.stderr.write(`Update failed: ${(e as Error).message}\n`);
  process.exit(1);
});
