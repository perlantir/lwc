import { z } from 'zod';

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, 'Required').max(80),
  lastName: z.string().trim().min(1, 'Required').max(80),
  email: z.string().trim().email('Valid email required').max(120),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  grade: z.string().trim().max(60).optional().or(z.literal('')),
  experience: z.string().trim().max(60).optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Tell us a bit more').max(4000),
  marketingOptIn: z.boolean().optional().default(false),
  // Anti-spam
  website: z.string().max(0, 'Spam detected').optional().default(''),
  startedAt: z.number().int().nonnegative(),
  turnstileToken: z.string().optional(),
  mathA: z.number().int().nonnegative(),
  mathB: z.number().int().nonnegative(),
  mathAnswer: z.string().trim().min(1, 'Answer the math question'),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const verifyMathChallenge = (a: number, b: number, answer: string): boolean => {
  const n = Number(answer.trim());
  if (!Number.isFinite(n)) return false;
  return n === a + b;
};

export const registerSchema = z.object({
  wFirst: z.string().trim().min(1).max(80),
  wLast: z.string().trim().min(1).max(80),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  school: z.string().trim().min(1).max(120),
  grade: z.string().trim().min(1).max(60),
  weight: z.string().trim().min(1).max(20),
  gender: z.enum(['boy', 'girl']),
  address: z.string().trim().min(5).max(400),
  parentName: z.string().trim().min(1).max(120),
  relationship: z.string().trim().max(60).optional().or(z.literal('')),
  parentPhone: z.string().trim().min(7).max(40),
  parentEmail: z.string().trim().email().max(120),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent required' }) }),
  updates: z.boolean().optional().default(false),
  // Anti-spam
  website: z.string().max(0).optional().default(''),
  startedAt: z.number().int().nonnegative(),
  turnstileToken: z.string().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const MIN_FORM_DURATION_MS = 2000;
