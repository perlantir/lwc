import { getPayload } from 'payload';
import config from '@payload-config';
import { CtaStrip } from '@/components/CtaStrip';
import { AddToCalendar } from '@/components/AddToCalendar';
import { SubscribeModal } from '@/components/SubscribeModal';
import { parseDate, shortMo, pad, KINDS, expandOccurrences, type CalendarEvent } from '@/lib/calendar';
import { mediaUrl, type MediaRef } from '@/lib/media';
import { EditableText } from '@/components/inline/EditableText';
import { EditableImage } from '@/components/inline/EditableImage';
import { env } from '@/env';

export const revalidate = 300;
export const metadata = { title: 'Schedule' };

const SchedulePage = async () => {
  const payload = await getPayload({ config });
  const today = new Date().toISOString().slice(0, 10);
  const [page, result] = await Promise.all([
    payload.findGlobal({ slug: 'schedule-page' }),
    payload.find({
      collection: 'events',
      where: { status: { equals: 'published' } },
      sort: 'date',
      limit: 500,
    }),
  ]);

  const rawEvents = result.docs as unknown as Array<{
    id: number | string;
    date: string;
    time?: string | null;
    title: string;
    kind?: string;
    location?: string | null;
    notes?: string | null;
    sequence?: number | null;
    updatedAt: string;
    recurring?: boolean | null;
    recurrenceDays?: string[] | null;
    recurrenceEnd?: string | null;
  }>;

  const baseEvents: CalendarEvent[] = rawEvents.map((d) => ({
    id: d.id,
    date: d.date.slice(0, 10),
    time: d.time ?? 'All Day',
    title: d.title,
    kind: (d.kind as CalendarEvent['kind']) ?? 'home',
    location: d.location ?? undefined,
    notes: d.notes ?? undefined,
    sequence: d.sequence ?? 0,
    updatedAt: d.updatedAt,
    recurring: Boolean(d.recurring),
    recurrenceDays: (d.recurrenceDays as CalendarEvent['recurrenceDays']) ?? undefined,
    recurrenceEnd: d.recurrenceEnd ?? undefined,
  }));

  // Show a rolling 4-month window of events (including expanded recurrences)
  const horizon = new Date();
  horizon.setMonth(horizon.getMonth() + 4);
  const horizonStr = horizon.toISOString().slice(0, 10);
  const expanded = expandOccurrences(baseEvents, today, horizonStr);
  const events = expanded.filter((e) => e.date >= today);

  const matches = events.filter((e) => KINDS[e.kind].cat === 'match');
  const practices = events.filter((e) => e.kind === 'prac');

  const renderCard = (e: CalendarEvent) => {
    const d = parseDate(e.date);
    const tagText = e.kind === 'home' ? 'Home' : e.kind === 'away' ? 'Away' : e.kind === 'tour' ? 'Tournament' : 'Practice';
    // For expanded recurring instances, e.id is "${baseId}:${iso}" — split out the real DB id.
    const baseId = typeof e.id === 'string' && e.id.includes(':') ? e.id.split(':')[0] : e.id;
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
          <EditableText
            as="div"
            collectionSlug="events"
            docId={baseId as number | string}
            fieldPath="title"
            value={e.title}
            className="font-bold text-navy block"
          />
          <EditableText
            as="div"
            collectionSlug="events"
            docId={baseId as number | string}
            fieldPath="location"
            value={e.location ?? ''}
            className="text-xs text-muted mt-1 block"
          />
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
      {/* HERO */}
      <EditableImage globalSlug="schedule-page" fieldPath="bannerImage" className="block"><section
        className="relative text-white overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(6,27,58,.6) 0%, rgba(6,27,58,.85) 100%), url('${mediaUrl(page.bannerImage as MediaRef, '/images/hero-bg.jpg', 'feature')}') center/cover no-repeat, #061B3A`,
        }}
      >
        <div className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12 sm:py-14 max-w-[820px]">
          <div className="text-[12px] text-white/55 mb-4 tracking-wide">
            <a href="/" className="text-cyan">Home</a> <span className="text-white/30 mx-1.5">/</span> {page.bannerEyebrow ?? 'Schedule'}
          </div>
          <EditableText as="h1" globalSlug="schedule-page" fieldPath="bannerTitle" value={page.bannerTitle ?? '2025–26 Season Schedule'} className="text-[34px] sm:text-[44px] md:text-[52px] font-extrabold leading-[1.05] tracking-tight block" style={{ textShadow: '0 4px 24px rgba(0,0,0,.4)' }} />
          {page.bannerBody && (
            <EditableText as="p" globalSlug="schedule-page" fieldPath="bannerBody" value={page.bannerBody ?? ''} multiline className="mt-4 max-w-[660px] text-white/80 text-[15px] sm:text-base leading-relaxed block" />
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <SubscribeModal siteUrl={env.SITE_URL} />
            <a href="/events.ics" className="text-cyan text-sm font-semibold inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Download Season .ics
            </a>
          </div>
        </div>
      </section></EditableImage>

      {/* NEXT MATCH HIGHLIGHT */}
      {matches[0] && (
        <section className="bg-navy text-white px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-8 border-t border-white/5">
          <div className="rounded-xl bg-white/[.04] border border-white/[.08] p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-6 max-w-[1100px] mx-auto">
            <div className="text-center bg-cyan/15 text-cyan rounded-lg py-3 px-4 min-w-[88px]">
              <div className="text-[12px] uppercase font-semibold tracking-widest">{shortMo(parseDate(matches[0].date).getMonth())}</div>
              <div className="text-[28px] font-extrabold leading-none">{pad(parseDate(matches[0].date).getDate())}</div>
              <div className="text-[11px] text-white/65 mt-1">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseDate(matches[0].date).getDay()]}</div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-cyan/15 text-cyan px-2 py-1 rounded">Next Match · {matches[0].kind === 'home' ? 'Home' : matches[0].kind === 'away' ? 'Away' : 'Tournament'}</span>
              {(() => {
                const m = matches[0]; const mid = typeof m.id === 'string' && m.id.includes(':') ? m.id.split(':')[0] : m.id;
                return <>
                  <EditableText as="h2" collectionSlug="events" docId={mid as number | string} fieldPath="title" value={m.title} className="text-[20px] sm:text-[24px] font-extrabold mt-2 block" />
                  <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2 text-[13px] text-white/80">
                    {m.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="text-cyan"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>
                        <EditableText as="span" collectionSlug="events" docId={mid as number | string} fieldPath="location" value={m.location} />
                      </span>
                    )}
                    {m.time && (
                      <span className="inline-flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                        <EditableText as="span" collectionSlug="events" docId={mid as number | string} fieldPath="time" value={m.time} />
                      </span>
                    )}
                    {m.notes && (
                      <EditableText as="span" collectionSlug="events" docId={mid as number | string} fieldPath="notes" value={m.notes} className="inline-flex items-center gap-1.5 text-white/70" />
                    )}
                  </div>
                </>;
              })()}
            </div>
            <div className="shrink-0">
              <AddToCalendar event={matches[0]} />
            </div>
          </div>
        </section>
      )}

      <section className="px-5 sm:px-8 md:px-14 lg:px-20 xl:px-28 2xl:px-40 py-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="mt-2">
            <h3 className="font-extrabold text-navy text-[20px] inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan"><path d="M12 2l3 7 7 .5-5 5 1.5 7L12 18l-6.5 3.5L7 14.5 2 9.5 9 9z" /></svg>
              Upcoming Matches
              <span className="text-muted text-sm font-medium ml-1">({matches.length})</span>
            </h3>
            {matches.length === 0 ? (
              <p className="mt-4 text-muted">No upcoming matches yet.</p>
            ) : (
              <div className="space-y-3 mt-4">{matches.map(renderCard)}</div>
            )}
          </div>

          <div className="mt-12">
            <h3 className="font-extrabold text-navy text-[20px] inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              Upcoming Practices
              <span className="text-muted text-sm font-medium ml-1">({practices.length})</span>
            </h3>
            {practices.length === 0 ? (
              <p className="mt-4 text-muted">No upcoming practices listed.</p>
            ) : (
              <div className="space-y-3 mt-4">{practices.map(renderCard)}</div>
            )}
          </div>
        </div>
      </section>

      <CtaStrip />
    </>
  );
};

export default SchedulePage;
