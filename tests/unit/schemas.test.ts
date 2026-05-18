import { describe, it, expect } from 'vitest';
import { contactSchema, registerSchema, MIN_FORM_DURATION_MS } from '../../src/lib/schemas';

const baseContact = {
  firstName: 'Sam',
  lastName: 'Smith',
  email: 'sam@example.com',
  message: 'Hi there!',
  startedAt: Date.now() - MIN_FORM_DURATION_MS - 1000,
  website: '',
  marketingOptIn: false,
};

describe('contactSchema', () => {
  it('accepts a valid submission', () => {
    expect(contactSchema.safeParse(baseContact).success).toBe(true);
  });

  it('rejects missing email', () => {
    const bad = { ...baseContact, email: '' };
    expect(contactSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects honeypot when filled', () => {
    const bad = { ...baseContact, website: 'http://spam.example' };
    expect(contactSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects short message', () => {
    const bad = { ...baseContact, message: 'hi' };
    expect(contactSchema.safeParse(bad).success).toBe(false);
  });
});

describe('registerSchema', () => {
  const base = {
    wFirst: 'Eli',
    wLast: 'Jones',
    dob: '2013-05-12',
    school: 'DMC',
    grade: '6',
    weight: '92',
    gender: 'boy' as const,
    address: '123 Main St, Cumming IA 50061',
    parentName: 'Jane Jones',
    parentPhone: '5155551234',
    parentEmail: 'jane@example.com',
    consent: true as const,
    updates: true,
    startedAt: Date.now() - MIN_FORM_DURATION_MS - 1000,
    website: '',
  };

  it('accepts a valid registration', () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it('requires consent === true', () => {
    const bad = { ...base, consent: false } as unknown;
    expect(registerSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects malformed dob', () => {
    const bad = { ...base, dob: '5/12/2013' };
    expect(registerSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects invalid gender', () => {
    const bad = { ...base, gender: 'other' } as unknown;
    expect(registerSchema.safeParse(bad).success).toBe(false);
  });
});
