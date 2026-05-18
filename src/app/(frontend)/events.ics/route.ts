import { getPayload } from 'payload';
import config from '@payload-config';
import { buildCalendarFeed, type CalendarEvent } from '@/lib/calendar';

export const dynamic = 'force-dynamic';

export const GET = async (): Promise<Response> => {
  const payload = await getPayload({ config });
  // Include the past 30 days as well, so subscribers see the recent past.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const result = await payload.find({
    collection: 'events',
    where: {
      and: [
        { date: { greater_than_equal: cutoff.toISOString().slice(0, 10) } },
        { status: { equals: 'published' } },
      ],
    },
    sort: 'date',
    limit: 1000,
  });

  const events: CalendarEvent[] = result.docs.map((d) => ({
    id: d.id,
    date: d.date.slice(0, 10),
    time: d.time ?? 'All Day',
    title: d.title,
    kind: (d.kind as CalendarEvent['kind']) ?? 'home',
    location: d.location ?? undefined,
    notes: d.notes ?? undefined,
    sequence: d.sequence ?? 0,
    updatedAt: d.updatedAt,
  }));

  const ics = buildCalendarFeed(events, 'DMC Lions Wrestling');
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
      'Content-Disposition': 'inline; filename="dmc-lions-wrestling.ics"',
    },
  });
};
