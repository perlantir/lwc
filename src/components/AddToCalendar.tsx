'use client';
import dynamic from 'next/dynamic';
import type { CalendarEvent } from '@/lib/calendar';
import { parseTime } from '@/lib/calendar';

const AddToCalendarButton = dynamic(
  () => import('add-to-calendar-button-react').then((m) => m.AddToCalendarButton),
  { ssr: false },
);

const formatDate = (s: string): string => s.slice(0, 10);

const formatTime = (s: string): { start: string; end: string } | null => {
  if (s === 'All Day' || /^all\s*day$/i.test(s)) return null;
  const [h, m] = parseTime(s);
  const startH = String(h).padStart(2, '0');
  const startM = String(m).padStart(2, '0');
  const endH = String((h + 2) % 24).padStart(2, '0');
  return { start: `${startH}:${startM}`, end: `${endH}:${startM}` };
};

export const AddToCalendar = ({ event }: { event: CalendarEvent }) => {
  const t = formatTime(event.time);
  const sharedProps = {
    name: event.title,
    description: event.notes ?? '',
    location: event.location ?? '',
    startDate: formatDate(event.date),
    options: ['Apple', 'Google', 'iCal', 'Microsoft365', 'Outlook.com', 'Yahoo'] as Array<
      'Apple' | 'Google' | 'iCal' | 'Microsoft365' | 'Outlook.com' | 'Yahoo'
    >,
    buttonStyle: 'round' as const,
    label: 'Add to Calendar',
    lightMode: 'light' as const,
    hideBackground: true,
  };
  if (t) {
    return (
      <AddToCalendarButton
        {...sharedProps}
        startTime={t.start}
        endDate={formatDate(event.date)}
        endTime={t.end}
        timeZone="America/Chicago"
      />
    );
  }
  return <AddToCalendarButton {...sharedProps} endDate={formatDate(event.date)} />;
};
