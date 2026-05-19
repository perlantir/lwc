import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { headers as nextHeaders } from 'next/headers';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

type ParsedRow = {
  title: string;
  date: string;
  time?: string;
  kind: 'home' | 'away' | 'tour' | 'prac';
  location?: string;
  notes?: string;
  recurring?: boolean;
  recurrenceDays?: string[];
  recurrenceEnd?: string;
};

const ALLOWED_KINDS = new Set(['home', 'away', 'tour', 'prac']);
const ALLOWED_DAYS = new Set(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

const parseCsv = (text: string): { rows: ParsedRow[]; errors: string[] } => {
  const errors: string[] = [];
  const rows: ParsedRow[] = [];
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    errors.push('CSV is empty.');
    return { rows, errors };
  }
  // Simple CSV split — handles quoted commas
  const splitLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += c;
      }
    }
    result.push(current);
    return result.map((s) => s.trim());
  };
  const header = splitLine(lines[0]!).map((h) => h.toLowerCase());
  const need = ['title', 'date', 'kind'];
  for (const key of need) {
    if (!header.includes(key)) {
      errors.push(`Missing required column '${key}' (CSV must have headers: title, date, time, kind, location, notes, recurring, recurrenceDays, recurrenceEnd)`);
    }
  }
  if (errors.length > 0) return { rows, errors };
  const col = (h: string) => header.indexOf(h);
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]!);
    const title = cells[col('title')] ?? '';
    const date = cells[col('date')] ?? '';
    const kind = (cells[col('kind')] ?? 'home').toLowerCase() as ParsedRow['kind'];
    if (!title) { errors.push(`Row ${i + 1}: missing title`); continue; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { errors.push(`Row ${i + 1}: date must be YYYY-MM-DD, got '${date}'`); continue; }
    if (!ALLOWED_KINDS.has(kind)) { errors.push(`Row ${i + 1}: kind must be one of home/away/tour/prac, got '${kind}'`); continue; }
    const r: ParsedRow = { title, date, kind };
    const t = cells[col('time')] ?? '';
    if (t) r.time = t;
    const loc = cells[col('location')] ?? '';
    if (loc) r.location = loc;
    const notes = cells[col('notes')] ?? '';
    if (notes) r.notes = notes;
    const recVal = (cells[col('recurring')] ?? '').toLowerCase();
    if (recVal === 'true' || recVal === '1' || recVal === 'yes') {
      r.recurring = true;
      const daysRaw = (cells[col('recurrencedays')] ?? '').toLowerCase();
      const days = daysRaw
        .split(/[;|]/)
        .map((d) => d.trim().substring(0, 3))
        .filter((d) => ALLOWED_DAYS.has(d));
      if (days.length > 0) r.recurrenceDays = days;
      const end = cells[col('recurrenceend')] ?? '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(end)) r.recurrenceEnd = end;
    }
    rows.push(r);
  }
  return { rows, errors };
};

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  // Require admin auth via session cookie
  const payload = await getPayload({ config });
  const headers = await nextHeaders();
  const { user } = await payload.auth({ headers });
  if (!user || (user.role !== 'admin' && user.role !== 'coach')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const contentType = req.headers.get('content-type') ?? '';
  let csvText: string;
  if (contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    const file = fd.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing 'file' field (multipart)" }, { status: 400 });
    }
    csvText = await file.text();
  } else {
    // Allow raw text/csv body
    csvText = await req.text();
  }
  if (!csvText.trim()) {
    return NextResponse.json({ error: 'CSV body is empty' }, { status: 400 });
  }

  const { rows, errors } = parseCsv(csvText);
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, parseErrors: errors, parsed: rows.length }, { status: 400 });
  }
  if (rows.length === 0) {
    return NextResponse.json({ error: 'No event rows parsed' }, { status: 400 });
  }

  const created: number[] = [];
  const failed: Array<{ row: ParsedRow; error: string }> = [];
  for (const row of rows) {
    try {
      const doc = await payload.create({
        collection: 'events',
        data: {
          title: row.title,
          date: row.date,
          time: row.time ?? 'All Day',
          allDay: !row.time || row.time === 'All Day',
          kind: row.kind,
          location: row.location ?? '',
          notes: row.notes ?? '',
          status: 'published',
          sequence: 0,
          recurring: row.recurring ?? false,
          recurrenceDays: row.recurrenceDays ?? [],
          recurrenceEnd: row.recurrenceEnd ?? undefined,
        },
        context: { disableRevalidate: true },
      });
      created.push(doc.id as number);
    } catch (e) {
      failed.push({ row, error: (e as Error).message });
    }
  }

  return NextResponse.json({ ok: true, createdCount: created.length, failedCount: failed.length, failed });
};
