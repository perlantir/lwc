import { headers } from 'next/headers';
import { getPayload } from 'payload';
import config from '@payload-config';
import Link from 'next/link';
import { ImportEventsForm } from './ImportEventsForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bulk import events' };

const ImportEventsPage = async () => {
  const payload = await getPayload({ config });
  const h = await headers();
  const { user } = await payload.auth({ headers: h });
  if (!user || (user.role !== 'admin' && user.role !== 'coach')) {
    return (
      <main className="px-6 md:px-14 py-14 max-w-[720px] mx-auto">
        <h1 className="text-2xl font-extrabold text-navy">Bulk import events</h1>
        <p className="mt-4 text-text-navy/85">
          This page is admin-only.{' '}
          <Link href="/admin/login" className="text-cyan font-semibold">Log in to the admin</Link>, then come back.
        </p>
      </main>
    );
  }

  return (
    <main className="px-6 md:px-14 py-12 max-w-[820px] mx-auto">
      <div className="text-[12px] text-muted mb-3 tracking-wide">
        <Link href="/admin" className="text-cyan">Admin</Link>
        <span className="mx-1.5 text-muted/60">/</span>
        Tools
        <span className="mx-1.5 text-muted/60">/</span>
        Import events
      </div>
      <h1 className="text-3xl font-extrabold text-navy">Bulk import events from CSV</h1>
      <p className="mt-2 text-text-navy/85">
        Drop a CSV file below to create many events at once. Useful for loading a full season schedule in one go.
      </p>

      <section className="mt-8 bg-white border border-border rounded-2xl p-6 shadow-soft">
        <h2 className="font-extrabold text-navy text-lg">CSV format</h2>
        <p className="text-sm text-text-navy/80 mt-1">
          One row per event. First row is headers. Required columns: <code className="bg-border/40 px-1.5 rounded">title</code>,{' '}
          <code className="bg-border/40 px-1.5 rounded">date</code>,{' '}
          <code className="bg-border/40 px-1.5 rounded">kind</code>.
        </p>
        <ul className="mt-3 text-[13px] text-text-navy/80 space-y-1.5">
          <li><strong>title</strong> — Event name. e.g., <em>Dual vs. Johnston</em></li>
          <li><strong>date</strong> — YYYY-MM-DD. e.g., <em>2026-11-15</em></li>
          <li><strong>kind</strong> — One of <code>home</code>, <code>away</code>, <code>tour</code>, <code>prac</code></li>
          <li><strong>time</strong> — Display string. e.g., <em>5:30 PM</em> or <em>All Day</em></li>
          <li><strong>location</strong> — e.g., <em>Lions Gym, DMC</em></li>
          <li><strong>notes</strong> — Free-form. e.g., <em>Senior Night</em></li>
          <li>
            <strong>recurring</strong> — <code>true</code> / <code>false</code>. Only set true for repeating events.
          </li>
          <li>
            <strong>recurrenceDays</strong> — Days of week separated by <code>;</code> or <code>|</code>.{' '}
            Use 3-letter lower-case: <code>mon|tue|wed|thu|fri|sat|sun</code>. e.g., <em>tue;thu</em>
          </li>
          <li><strong>recurrenceEnd</strong> — Last date (YYYY-MM-DD) when the recurring series stops.</li>
        </ul>
        <details className="mt-4">
          <summary className="cursor-pointer text-cyan font-semibold text-sm">Show an example CSV</summary>
          <pre className="mt-3 bg-deep-navy text-white/90 text-[12px] p-4 rounded-lg overflow-x-auto leading-5">
{`title,date,time,kind,location,notes,recurring,recurrenceDays,recurrenceEnd
Mid-Iowa Open,2026-11-07,All Day,tour,Indianola HS,16 schools,false,,
Dual vs. Johnston Dragons,2026-11-15,5:30 PM,home,"Lions Gym, DMC",Senior Night,false,,
Varsity Practice,2026-11-03,3:45 PM,prac,Wrestling Room,,true,tue;thu,2027-02-28
Sectional Tournament,2027-02-19,10:00 AM,tour,TBD,State qualifier,false,,`}
          </pre>
        </details>
      </section>

      <section className="mt-6 bg-white border border-border rounded-2xl p-6 shadow-soft">
        <h2 className="font-extrabold text-navy text-lg">Upload</h2>
        <ImportEventsForm />
      </section>

      <p className="mt-6 text-[12px] text-muted">
        Done? <Link href="/admin/collections/events" className="text-cyan font-semibold">View all events in admin →</Link>
      </p>
    </main>
  );
};

export default ImportEventsPage;
