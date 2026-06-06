import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Payload + DB
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PAYLOAD_SECRET: z.string().min(32, 'PAYLOAD_SECRET must be >= 32 chars'),
  PAYLOAD_PUBLIC_SERVER_URL: z.string().url().optional(),

  // Seed
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(14).optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('lionswrestling@dmcschools.org'),
  EMAIL_REPLY_TO: z.string().email().default('Topher.ewing@dmcs.org'),
  SMTP_URL: z.string().optional(),

  // Rate limiting
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Turnstile
  TURNSTILE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),

  // IP hash salt
  IP_HASH_SALT: z.string().min(16).default('dev-only-change-me-in-prod-pls'),

  // R2 / S3 (production media)
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),

  // Sentry
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Site
  SITE_URL: z.string().url().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env: Env = parsed.data;
