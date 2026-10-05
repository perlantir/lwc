import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

// DELETE this file after running once.
const TOKEN = 'lwc-content-oct2026-8q3r';

type ProgramCard = { title?: string; ageRange?: string; body?: string; ctaLabel?: string; ctaHref?: string };

async function handler(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? req.headers.get('x-token');
  if (token !== TOKEN) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await getPayload({ config });
  const steps: string[] = [];
  const errors: string[] = [];

  try {
    // 1. Program cards
    const homepage = await payload.findGlobal({ slug: 'homepage' });
    const cards = ((homepage.programCards ?? []) as ProgramCard[])
      .filter((c) => {
        const t = (c.title ?? '').toLowerCase();
        return !t.includes('middle') && !t.includes('hs') && !t.includes('high');
      })
      .map((c) => {
        const t = (c.title ?? '').toLowerCase();
        if (t.includes('mini') || t.includes('cub')) {
          return { ...c, title: 'Cubs', ageRange: 'Pre-K–2nd' };
        }
        if (t.includes('youth') || t.includes('lion')) {
          return { ...c, title: 'Lions', ageRange: 'Grades 3–8' };
        }
        return c;
      });
    await payload.updateGlobal({ slug: 'homepage', data: { programCards: cards } });
    steps.push(`programCards updated: ${cards.map((c) => c.title).join(', ')}`);
  } catch (e) {
    errors.push(`programCards: ${(e as Error).message}`);
  }

  try {
    // 2. Facebook URL — header + footer
    const fbUrl = 'https://www.facebook.com/profile.php?id=61594893370910';
    await payload.updateGlobal({ slug: 'header', data: { facebookUrl: fbUrl } });
    await payload.updateGlobal({ slug: 'footer', data: { facebookUrl: fbUrl } });
    steps.push('facebookUrl updated on header + footer');
  } catch (e) {
    errors.push(`facebookUrl: ${(e as Error).message}`);
  }

  return NextResponse.json({ ok: errors.length === 0, steps, errors });
}

export const GET = handler;
export const POST = handler;
