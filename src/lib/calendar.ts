/**
 * Calendar helpers lifted from handoff/schedule.html.
 * ICS generation, date/time parsing, formatting.
 */

export interface CalendarEvent {
  id: number | string;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'All Day' | '5:30 PM' etc.
  title: string;
  kind: 'home' | 'away' | 'tour' | 'prac';
  location?: string;
  notes?: string;
  sequence?: number;
  updatedAt?: string;
  recurring?: boolean;
  recurrenceDays?: Array<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'>;
  recurrenceEnd?: string; // YYYY-MM-DD
}

const DOW_TO_INDEX: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

/** Expand recurring events into individual occurrences within [windowStart, windowEnd]. Pass-through for non-recurring. */
export const expandOccurrences = (
  events: CalendarEvent[],
  windowStart: string,
  windowEnd: string,
): CalendarEvent[] => {
  const start = parseDate(windowStart);
  const end = parseDate(windowEnd);
  const out: CalendarEvent[] = [];
  for (const e of events) {
    if (!e.recurring || !e.recurrenceDays || e.recurrenceDays.length === 0) {
      out.push(e);
      continue;
    }
    const seriesStart = parseDate(e.date.slice(0, 10));
    const seriesEnd = e.recurrenceEnd ? parseDate(e.recurrenceEnd.slice(0, 10)) : end;
    const cursorStart = seriesStart > start ? seriesStart : start;
    const cursorEnd = seriesEnd < end ? seriesEnd : end;
    const dayBits = new Set(e.recurrenceDays.map((d) => DOW_TO_INDEX[d]).filter((x) => x !== undefined));
    const cursor = new Date(cursorStart);
    let safetyCounter = 0;
    while (cursor <= cursorEnd && safetyCounter < 500) {
      if (dayBits.has(cursor.getDay())) {
        const iso = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`;
        out.push({ ...e, id: `${e.id}:${iso}`, date: iso, recurring: false });
      }
      cursor.setDate(cursor.getDate() + 1);
      safetyCounter++;
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
};

export interface KindMeta {
  cat: 'match' | 'practice';
  label: string;
}

export const KINDS: Record<CalendarEvent['kind'], KindMeta> = {
  home: { cat: 'match', label: 'Home' },
  away: { cat: 'match', label: 'Away' },
  tour: { cat: 'match', label: 'Tournament' },
  prac: { cat: 'practice', label: 'Practice' },
};

export const pad = (n: number): string => String(n).padStart(2, '0');

export const mkDate = (y: number, m: number, d: number): string =>
  `${y}-${pad(m + 1)}-${pad(d)}`;

export const parseDate = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const monthName = (m: number): string =>
  [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ][m];

export const shortMo = (m: number): string =>
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m];

export const parseTime = (s: string): [number, number] => {
  const m = s.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!m) return [12, 0];
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = (m[3] ?? '').toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return [h, min];
};

const icsEscape = (s: string): string =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

const fmtUTC = (d: Date): string => {
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${y}${m}${day}T${hh}${mm}${ss}Z`;
};

export const eventToICS = (e: CalendarEvent): string => {
  const d = parseDate(e.date);
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  let dtStart: string;
  let dtEnd: string;
  let dtType: string;

  if (e.time === 'All Day' || /^all\s*day$/i.test(e.time)) {
    dtStart = `${y}${m}${day}`;
    const end = new Date(d);
    end.setDate(end.getDate() + 1);
    dtEnd = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}`;
    dtType = 'VALUE=DATE';
  } else {
    const [hh, mm] = parseTime(e.time);
    dtStart = `${y}${m}${day}T${pad(hh)}${pad(mm)}00`;
    const endH = (hh + 2) % 24;
    dtEnd = `${y}${m}${day}T${pad(endH)}${pad(mm)}00`;
    dtType = '';
  }

  const lastMod = e.updatedAt ? fmtUTC(new Date(e.updatedAt)) : fmtUTC(new Date());
  const lines = [
    'BEGIN:VEVENT',
    `UID:event-${e.id}@lionswrestling.dmcschools.org`,
    `SUMMARY:${icsEscape(e.title)}`,
    `LOCATION:${icsEscape(e.location ?? '')}`,
    `DESCRIPTION:${icsEscape(e.notes ?? '')}`,
    `DTSTAMP:${fmtUTC(new Date())}`,
    `LAST-MODIFIED:${lastMod}`,
    `SEQUENCE:${e.sequence ?? 0}`,
  ];
  if (dtType === 'VALUE=DATE') {
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
  } else {
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
  }
  lines.push('END:VEVENT');
  return lines.join('\r\n');
};

export const buildCalendarFeed = (events: CalendarEvent[], calName = 'DMC Lions Wrestling'): string => {
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lions Wrestling Club//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(calName)}`,
    'X-WR-TIMEZONE:America/Chicago',
  ];
  const body = events.map(eventToICS);
  const footer = ['END:VCALENDAR'];
  return [...header, ...body, ...footer].join('\r\n');
};

export const eventLabel = (e: CalendarEvent): string => {
  if (e.kind === 'home')
    return (
      'vs ' +
      e.title
        .replace(/^Dual vs\.?\s*/i, '')
        .replace(/^Home Match vs\.?\s*/i, '')
        .replace(/^vs\.?\s*/i, '')
    );
  if (e.kind === 'away') return e.title.startsWith('@') ? e.title : '@ ' + e.title.replace(/^Tri @\s*/, '');
  if (e.kind === 'tour') return e.title.replace(/^Tournament\s*/i, '').slice(0, 22);
  if (e.kind === 'prac')
    return (
      (e.title.includes('Youth') ? 'Youth ' : 'Practice ') +
      e.time.replace(' PM', 'p').replace(' AM', 'a')
    );
  return e.title;
};

export const downloadICS = (filename: string, content: string): void => {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** EVENTS seed data lifted verbatim from handoff/schedule.html for first-run seeding. */
export const SEED_EVENTS: CalendarEvent[] = [
  { id: 1, date: '2026-01-03', time: 'All Day', title: 'Mid-Iowa Open', kind: 'tour', location: 'Indianola HS', notes: '18 schools' },
  { id: 2, date: '2026-01-08', time: '6:00 PM', title: '@ Valley Tigers', kind: 'away', location: 'Valley HS', notes: 'CIML matchup' },
  { id: 3, date: '2026-01-10', time: 'All Day', title: 'Cedar Falls Invite', kind: 'tour', location: 'Cedar Falls HS', notes: '' },
  { id: 4, date: '2026-01-15', time: '5:30 PM', title: 'Dual vs. Johnston', kind: 'home', location: 'Lions Gym, DMC', notes: 'Senior Night' },
  { id: 5, date: '2026-01-22', time: 'All Day', title: 'Tournament @ Waukee', kind: 'tour', location: 'Waukee HS', notes: '14 schools' },
  { id: 6, date: '2026-01-23', time: 'All Day', title: 'Waukee Day 2 — Finals', kind: 'tour', location: 'Waukee HS', notes: '' },
  { id: 7, date: '2026-01-29', time: '5:30 PM', title: 'Home Match vs. Ankeny', kind: 'home', location: 'Lions Gym, DMC', notes: 'Youth Night' },
  { id: 8, date: '2026-01-31', time: '10:00 AM', title: 'Sectional Prep Tournament', kind: 'tour', location: 'TBD', notes: '' },
  { id: 9, date: '2026-02-05', time: '6:00 PM', title: 'Tri @ Valley', kind: 'away', location: 'Valley HS', notes: 'vs. Lions · Lewis Central' },
  { id: 10, date: '2026-02-12', time: '9:00 AM', title: 'CIML Conference Duals', kind: 'tour', location: 'Hosted by SE Polk', notes: '' },
  { id: 11, date: '2026-02-19', time: '10:00 AM', title: 'Sectional Tournament', kind: 'tour', location: 'TBD', notes: 'State qualifier' },
  { id: 101, date: '2026-01-05', time: '3:45 PM', title: 'Varsity Practice', kind: 'prac', location: 'Lions Wrestling Room', notes: '' },
  { id: 102, date: '2026-01-06', time: '3:45 PM', title: 'Varsity Practice', kind: 'prac', location: 'Lions Wrestling Room', notes: '' },
  { id: 103, date: '2026-01-07', time: '3:45 PM', title: 'Varsity Practice', kind: 'prac', location: 'Lions Wrestling Room', notes: '' },
  { id: 104, date: '2026-01-12', time: '3:45 PM', title: 'Varsity Practice', kind: 'prac', location: 'Lions Wrestling Room', notes: '' },
  { id: 105, date: '2026-01-13', time: '6:00 PM', title: 'Youth Night', kind: 'prac', location: 'Lions Wrestling Room', notes: 'K – 6 grade' },
  { id: 106, date: '2026-01-14', time: '3:45 PM', title: 'Varsity Practice', kind: 'prac', location: 'Lions Wrestling Room', notes: 'Live go Friday' },
  { id: 107, date: '2026-01-19', time: '3:45 PM', title: 'Varsity Practice', kind: 'prac', location: 'Lions Wrestling Room', notes: '' },
  { id: 108, date: '2026-01-20', time: '6:00 PM', title: 'Youth Night', kind: 'prac', location: 'Lions Wrestling Room', notes: 'K – 6 grade' },
  { id: 109, date: '2026-01-21', time: '3:45 PM', title: 'Varsity Practice', kind: 'prac', location: 'Lions Wrestling Room', notes: '' },
  { id: 110, date: '2026-01-26', time: '3:45 PM', title: 'Varsity Practice', kind: 'prac', location: 'Lions Wrestling Room', notes: '' },
  { id: 111, date: '2026-01-27', time: '6:00 PM', title: 'Youth Night', kind: 'prac', location: 'Lions Wrestling Room', notes: 'K – 6 grade' },
  { id: 112, date: '2026-01-28', time: '3:45 PM', title: 'Varsity Practice', kind: 'prac', location: 'Lions Wrestling Room', notes: 'Live go Friday' },
  { id: 113, date: '2026-01-31', time: '9:00 AM', title: 'Saturday Open Mat', kind: 'prac', location: 'Lions Wrestling Room', notes: 'All ages' },
  { id: 114, date: '2026-02-02', time: '3:45 PM', title: 'Varsity Practice', kind: 'prac', location: 'Lions Wrestling Room', notes: '' },
  { id: 115, date: '2026-02-03', time: '6:00 PM', title: 'Youth Night', kind: 'prac', location: 'Lions Wrestling Room', notes: '' },
  { id: 116, date: '2026-02-04', time: '3:45 PM', title: 'Varsity Practice', kind: 'prac', location: 'Lions Wrestling Room', notes: '' },
];
