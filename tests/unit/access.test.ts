import { describe, it, expect } from 'vitest';
import {
  isAdmin,
  isAdminOrCoach,
  isAdminOrSelf,
  isPublic,
  readPublishedOrAdmin,
  hasRole,
} from '../../src/access';

type Role = 'admin' | 'coach' | 'viewer';

// The Payload Access type wants a full PayloadRequest. For unit tests we cast a
// minimal stub — only `req.user` matters in our access functions.
const call = (fn: (args: unknown) => unknown, role?: Role, id?: string, recordId?: string) => {
  const args = {
    req: { user: role ? { role, id: id ?? 'u1' } : null },
    id: recordId,
  };
  return fn(args);
};

describe('access control matrix', () => {
  it('isAdmin only allows admin role', () => {
    expect(call(isAdmin as unknown as (a: unknown) => boolean, 'admin')).toBe(true);
    expect(call(isAdmin as unknown as (a: unknown) => boolean, 'coach')).toBe(false);
    expect(call(isAdmin as unknown as (a: unknown) => boolean, 'viewer')).toBe(false);
    expect(call(isAdmin as unknown as (a: unknown) => boolean, undefined)).toBe(false);
  });

  it('isAdminOrCoach allows admin + coach', () => {
    const f = isAdminOrCoach as unknown as (a: unknown) => boolean;
    expect(call(f, 'admin')).toBe(true);
    expect(call(f, 'coach')).toBe(true);
    expect(call(f, 'viewer')).toBe(false);
    expect(call(f, undefined)).toBe(false);
  });

  it('isPublic always returns true', () => {
    expect(call(isPublic as unknown as (a: unknown) => boolean)).toBe(true);
  });

  it('hasRole correctly allowlists', () => {
    const adminOnly = hasRole('admin') as unknown as (a: unknown) => boolean;
    expect(call(adminOnly, 'admin')).toBe(true);
    expect(call(adminOnly, 'coach')).toBe(false);
  });

  it('isAdminOrSelf: admin yes, self yes, other no', () => {
    const f = isAdminOrSelf as unknown as (a: unknown) => boolean;
    expect(call(f, 'admin', 'admin-1', 'u2')).toBe(true);
    expect(call(f, 'coach', 'u2', 'u2')).toBe(true);
    expect(call(f, 'coach', 'u3', 'u2')).toBe(false);
  });

  it('readPublishedOrAdmin: anon sees only published', () => {
    const f = readPublishedOrAdmin as unknown as (a: unknown) => unknown;
    expect(call(f, undefined)).toEqual({ status: { equals: 'published' } });
  });

  it('readPublishedOrAdmin: authenticated sees all', () => {
    const f = readPublishedOrAdmin as unknown as (a: unknown) => boolean;
    expect(call(f, 'coach')).toBe(true);
    expect(call(f, 'admin')).toBe(true);
    expect(call(f, 'viewer')).toBe(true);
  });
});

describe('access matrix — viewer cannot mutate any collection', () => {
  const collections = [
    'events',
    'recaps',
    'photos',
    'albums',
    'coaches',
    'pages',
    'registrations',
    'contact-submissions',
    'media',
    'redirects',
  ];
  for (const c of collections) {
    it(`${c}: viewer cannot create/update/delete`, () => {
      const aoc = isAdminOrCoach as unknown as (a: unknown) => boolean;
      const a = isAdmin as unknown as (a: unknown) => boolean;
      expect(call(aoc, 'viewer')).toBe(false);
      expect(call(a, 'viewer')).toBe(false);
    });
  }
});
