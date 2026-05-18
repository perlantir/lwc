import { getPayload } from 'payload';
import config from '@payload-config';
import { PageBanner } from '@/components/PageBanner';
import { CtaStrip } from '@/components/CtaStrip';
import { AddToCalendar } from '@/components/AddToCalendar';
import { SubscribeModal } from '@/components/SubscribeModal';
import { parseDate, shortMo, pad, KINDS, type CalendarEvent } from '@/lib/calendar';
import { env } from '@/env';

export const revalidate = 300;
export const metadata = { title: 'Schedule' };

const SchedulePage = async () => {
  const payload = await getPayload({ config });
  const today = new Date().toISOString().slice(0, 10);
  const result = await payload.find({
    collection: 'events',
    where: {
      and: [{ date: { greater_than_equal: today } }, { status: { equals: 'published' } }],
    },
    sort: 'date',
    limit: 200,
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

  const matches = events.filter((e) => KINDS[e.kind].cat === 'match');
  const practices = events.filter((e) => e.kind === 'prac');

  const renderCard = (e: CalendarEvent) => {
    const d = parseDate(e.date);
    const tagText = e.kind === 'home' ? 'Home' : e.kind === 'away' ? 'Away' : e.kind === 'tour' ? 'Tournament' : 'Practice';
    const subline = [e.location, e.notes].filter(Boolean).join(' · ');
    return (
      <article
        key={e.id}
        className="grid grid-cols-[60px_1fr_auto] md:grid-cols-[60px_1fr_auto_auto_auto] items-center gap-4 bg-white border border-border rounded-xl px-4 py-4 shadow-soft"
      >
        <div className="text-center bg-cyan/10 text-cyan rounded-lg py-1">
          <div className="text-[11px] uppercase font-semibold tracking-wider">{shortMo(d.getMonth())}</div>
          <div className="text-lg font-extrabold">{pad(d.getDate())}</div>
        </div>
        <div>
          <div className="font-bold text-navy">{e.title}</div>
          <div className="text-xs text-muted mt-1">{subline}</div>
        </div>
        <span
          className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
            e.kind === 'home'
              ? 'bg-cyan text-white'
              : e.kind === 'away'
                ? 'bg-navy text-white'
                : 'bg-text-navy/10 text-navy'
          }`}
        >
          {tagText}
        </span>
        <span className="text-sm text-muted hidden md:inline">{e.time}</span>
        <div className="col-span-3 md:col-span-1">
          <AddToCalendar event={e} />
        </div>
      </article>
    );
  };

  return (
    <>
      <PageBanner
        eyebrow="Schedule"
        title="2025–26 Lions Wrestling Calendar"
        body="Subscribe once and the Lions schedule stays current on your phone or computer. Or add individual events directly."
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Schedule' }]}
      />

      <section className="px-6 md:px-14 py-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-extrabold text-navy">Upcoming events</h2>
            <p className="text-sm text-muted mt-1">{events.length} events scheduled</p>
          </div>
          <SubscribeModal siteUrl={env.SITE_URL} />
        </div>

        <div className="mt-8">
          <h3 className="font-extrabold text-navy text-lg">
            Matches & Tournaments <span className="text-muted text-sm font-medium ml-2">({matches.length})</span>
          </h3>
          {matches.length === 0 ? (
            <p className="mt-4 text-muted">No upcoming matches yet.</p>
          ) : (
            <div className="space-y-3 mt-4">{matches.map(renderCard)}</div>
          )}
        </div>

        <div className="mt-10">
          <h3 className="font-extrabold text-navy text-lg">
            Practices <span className="text-muted text-sm font-medium ml-2">({practices.length})</span>
          </h3>
          {practices.length === 0 ? (
            <p className="mt-4 text-muted">No upcoming practices listed.</p>
          ) : (
            <div className="space-y-3 mt-4">{practices.map(renderCard)}</div>
          )}
        </div>
      </section>

      <CtaStrip />
    </>
  );
};

export default SchedulePage;
