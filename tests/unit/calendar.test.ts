import { describe, it, expect } from 'vitest';
import {
  buildCalendarFeed,
  eventToICS,
  parseDate,
  parseTime,
  pad,
  mkDate,
  SEED_EVENTS,
  type CalendarEvent,
} from '../../src/lib/calendar';

describe('calendar lib', () => {
  it('pad zero-pads single digits', () => {
    expect(pad(0)).toBe('00');
    expect(pad(9)).toBe('09');
    expect(pad(15)).toBe('15');
  });

  it('mkDate formats yyyy-mm-dd with 1-indexed month', () => {
    expect(mkDate(2026, 0, 15)).toBe('2026-01-15');
    expect(mkDate(2026, 11, 1)).toBe('2026-12-01');
  });

  it('parseDate round-trips with mkDate', () => {
    const d = parseDate('2026-01-15');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0);
    expect(d.getDate()).toBe(15);
  });

  it('parseTime handles AM/PM correctly', () => {
    expect(parseTime('5:30 PM')).toEqual([17, 30]);
    expect(parseTime('5:30 AM')).toEqual([5, 30]);
    expect(parseTime('12:00 PM')).toEqual([12, 0]);
    expect(parseTime('12:00 AM')).toEqual([0, 0]);
    expect(parseTime('10:00 AM')).toEqual([10, 0]);
  });

  it('eventToICS emits a full VEVENT block with proper fields for timed events', () => {
    const e: CalendarEvent = {
      id: 4,
      date: '2026-01-15',
      time: '5:30 PM',
      title: 'Dual vs. Johnston',
      kind: 'home',
      location: 'Lions Gym, DMC',
      notes: 'Senior Night',
      sequence: 0,
    };
    const ics = eventToICS(e);
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('UID:event-4@lionswrestling.dmcschools.org');
    expect(ics).toContain('SUMMARY:Dual vs. Johnston');
    expect(ics).toContain('LOCATION:Lions Gym\\, DMC');
    expect(ics).toContain('DESCRIPTION:Senior Night');
    expect(ics).toContain('DTSTART:20260115T173000');
    expect(ics).toContain('DTEND:20260115T193000');
    expect(ics).toContain('SEQUENCE:0');
    expect(ics).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
  });

  it('eventToICS emits VALUE=DATE for All Day events', () => {
    const e: CalendarEvent = {
      id: 1,
      date: '2026-01-03',
      time: 'All Day',
      title: 'Mid-Iowa Open',
      kind: 'tour',
      location: 'Indianola HS',
      notes: '18 schools',
    };
    const ics = eventToICS(e);
    expect(ics).toContain('DTSTART;VALUE=DATE:20260103');
    expect(ics).toContain('DTEND;VALUE=DATE:20260104');
  });

  it('eventToICS escapes commas, semicolons, and backslashes', () => {
    const e: CalendarEvent = {
      id: 99,
      date: '2026-01-15',
      time: 'All Day',
      title: 'Test; with, commas',
      kind: 'home',
      notes: 'a\nb',
    };
    const ics = eventToICS(e);
    expect(ics).toContain('SUMMARY:Test\\; with\\, commas');
    expect(ics).toContain('DESCRIPTION:a\\nb');
  });

  it('buildCalendarFeed wraps events with VCALENDAR header/footer', () => {
    const feed = buildCalendarFeed(SEED_EVENTS.slice(0, 2));
    expect(feed).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(feed).toContain('VERSION:2.0');
    expect(feed).toContain('PRODID:-//Lions Wrestling Club//Schedule//EN');
    expect(feed).toContain('X-WR-CALNAME:DMC Lions Wrestling');
    expect(feed.split('BEGIN:VEVENT').length - 1).toBe(2);
    expect(feed.trim().endsWith('END:VCALENDAR')).toBe(true);
  });

  it('SEED_EVENTS contains at least 30 entries', () => {
    expect(SEED_EVENTS.length).toBeGreaterThanOrEqual(27); // matches handoff
  });

  it('SEED_EVENTS — all dates parse and all kinds are valid', () => {
    const validKinds = new Set(['home', 'away', 'tour', 'prac']);
    for (const e of SEED_EVENTS) {
      expect(/^\d{4}-\d{2}-\d{2}$/.test(e.date)).toBe(true);
      expect(validKinds.has(e.kind)).toBe(true);
    }
  });

  it('uses CRLF line endings as required by RFC 5545', () => {
    const ics = eventToICS(SEED_EVENTS[0]);
    expect(ics).toMatch(/\r\n/);
  });
});
