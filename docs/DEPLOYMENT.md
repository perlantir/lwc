# Deployment Guide

A step-by-step playbook for taking the Lions Wrestling site from a local checkout to a live `lionswrestling.dmcschools.org`. All services on free tiers.

> The autonomous build run does NOT deploy this site. It prepares everything for the user to execute the deploy by following this doc.

---

## 0. What you'll need

- A GitHub account with push access to `perlantir/lwc`.
- A domain or subdomain on `dmcschools.org` (or wherever) with DNS access.
- About **45 minutes** for the first deploy.

You're about to provision six free services. Have a password manager open.

---

## 1. Neon (Postgres)

1. Sign up at https://neon.tech.
2. **Create project** → name it `lwc-prod`. Region: `aws-us-east-2` (Ohio) for proximity to Iowa.
3. After creation, copy the **connection string** (pooled, with `?sslmode=require&channel_binding=require`).
4. Save it as `DATABASE_URL`. It will look like:
   ```
   postgresql://<user>:<pwd>@ep-xxxx.us-east-2.aws.neon.tech/lwc?sslmode=require
   ```
5. Settings → Branches → enable **point-in-time restore (7 days)**. (On free tier, this is included.)
6. Roles → create a least-privilege role `lwc_app` with `CONNECT`, `CREATE`, `USAGE`, `SELECT/INSERT/UPDATE/DELETE` only. Use this for the prod env, not the owner.

---

## 2. Cloudflare R2 (media storage)

1. Sign up / sign in to https://dash.cloudflare.com.
2. **R2** → Create bucket: `lions-wrestling-media`. Location: Automatic.
3. **Settings → Public access**: leave private (we serve via signed URLs through Payload).
4. **R2 → Manage API Tokens** → Create API token:
   - Permissions: **Object Read & Write**.
   - Scope: the `lions-wrestling-media` bucket only.
   - Save: `S3_ACCESS_KEY_ID` + `S3_SECRET_ACCESS_KEY`.
5. The endpoint URL is `https://<account-id>.r2.cloudflarestorage.com`. Save as `S3_ENDPOINT`.
6. (Optional) Create a Cloudflare custom domain `media.lionswrestling.dmcschools.org` pointing at the bucket. Save as `S3_PUBLIC_URL`.

Env vars:
```
S3_BUCKET=lions-wrestling-media
S3_REGION=auto
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_PUBLIC_URL=https://media.lionswrestling.dmcschools.org
```

---

## 3. Resend (transactional email)

1. Sign up at https://resend.com.
2. **Domains → Add domain**: `dmcschools.org` (or use a dedicated subdomain like `mail.dmcschools.org`).
3. Add these DNS records (Cloudflare DNS or wherever the domain lives):

   | Type | Name | Value | Notes |
   |---|---|---|---|
   | `TXT` | `dmcschools.org` (or `mail.dmcschools.org`) | `v=spf1 include:amazonses.com ~all` | SPF |
   | `TXT` | `resend._domainkey` | (long key from Resend dashboard) | DKIM |
   | `TXT` | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:lionswrestling@dmcschools.org` | DMARC |
   | `MX` | `send` | `feedback-smtp.us-east-1.amazonses.com` priority 10 | Bounces |

4. Wait for **Verified** badge in the dashboard (usually 5–15 minutes).
5. **API Keys → Create API key**: scope = "Sending access" to `dmcschools.org`. Save as `RESEND_API_KEY`.
6. Set `EMAIL_FROM=lionswrestling@dmcschools.org` (or a subdomain like `coach@lionswrestling.dmcschools.org`).

**Fallback if DNS access isn't available immediately:** set `EMAIL_FROM=onboarding@resend.dev`. Emails will still send, but with a Resend-branded From address.

---

## 4. Upstash (Redis for rate limiting)

1. Sign up at https://upstash.com.
2. **Console → Create database**: name `lwc-prod`, region `us-east-1`.
3. Save:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

Without these, the app falls back to in-memory rate limiting — acceptable but per-instance, so prefer Upstash in prod.

---

## 5. Cloudflare Turnstile (bot defense)

1. Cloudflare dashboard → **Turnstile → Add site**.
2. Domain: `lionswrestling.dmcschools.org`.
3. Mode: **Managed**.
4. Save:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public)
   - `TURNSTILE_SECRET_KEY` (server-side, never expose)

After deploy, turn on **Enable Turnstile** in `/admin → Site Config → Contact Config`.

---

## 6. Sentry (error tracking)

1. Sign up at https://sentry.io.
2. **Create project** → platform: **Next.js**.
3. Save the DSN as `NEXT_PUBLIC_SENTRY_DSN`.
4. Verify the first deploy errors are captured (intentionally throw in `/api/contact` once with a malformed body to test).

---

## 7. Vercel (host)

1. Sign in at https://vercel.com.
2. **New Project → Import** from GitHub → select `perlantir/lwc`.
3. **Framework Preset**: Next.js (auto-detected).
4. **Build Command**: leave default (`pnpm build`).
5. **Install Command**: `pnpm install --frozen-lockfile`.
6. **Environment Variables** — add all from §8 below.
7. **Domains** → add `lionswrestling.dmcschools.org`. Follow DNS prompts.
8. **Deploy**.

After first deploy:
```bash
# Run migrations + seed against prod DB:
# (locally with prod env vars in a temp .env.production)
DATABASE_URL=<prod-url> pnpm migrate
DATABASE_URL=<prod-url> SEED_ADMIN_EMAIL=admin@dmcschools.org SEED_ADMIN_PASSWORD='<strong>' pnpm seed
```

> Alternatively, run the seed once via a one-off Vercel function or directly in a `vercel exec` shell.

---

## 8. Production env vars

Paste into Vercel → Project → Settings → Environment Variables. All scoped to **Production**.

```
DATABASE_URL=postgresql://lwc_app:<password>@ep-xxxx.us-east-2.aws.neon.tech/lwc?sslmode=require
PAYLOAD_SECRET=<openssl rand -hex 32>
SITE_URL=https://lionswrestling.dmcschools.org
IP_HASH_SALT=<openssl rand -hex 16>

SEED_ADMIN_EMAIL=admin@dmcschools.org
SEED_ADMIN_PASSWORD=<openssl rand -base64 24>

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=lionswrestling@dmcschools.org
EMAIL_REPLY_TO=lionswrestling@dmcschools.org

UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

TURNSTILE_SECRET_KEY=0x4AAAAAAB...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAB...

S3_BUCKET=lions-wrestling-media
S3_REGION=auto
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_PUBLIC_URL=https://media.lionswrestling.dmcschools.org

NEXT_PUBLIC_SENTRY_DSN=https://...@o123.ingest.sentry.io/123
```

---

## 9. DNS records — full picture

Add at the domain registrar / Cloudflare DNS:

| Type | Name | Value | Purpose |
|---|---|---|---|
| `CNAME` | `lionswrestling` | `cname.vercel-dns.com.` | Site root |
| `CNAME` | `media.lionswrestling` | (Cloudflare R2 custom domain CNAME) | Media |
| `TXT` | `dmcschools.org` | `v=spf1 include:amazonses.com ~all` | SPF for Resend |
| `TXT` | `resend._domainkey` | (key from Resend) | DKIM |
| `TXT` | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:lionswrestling@dmcschools.org` | DMARC |
| `MX` | `send` | `feedback-smtp.us-east-1.amazonses.com` (priority 10) | Bounce handling |

Wait for Vercel to issue the SSL cert (typically <2 minutes after DNS propagates).

---

## 10. First deploy commands

```bash
# Push to main triggers a Vercel deploy.
git push origin main

# Once deployed, run migrations and seed against the prod DB.
# (You only need to do this once.)
DATABASE_URL='<prod-url>' \
  PAYLOAD_SECRET='<prod-secret>' \
  pnpm migrate

DATABASE_URL='<prod-url>' \
  PAYLOAD_SECRET='<prod-secret>' \
  SEED_ADMIN_EMAIL='admin@dmcschools.org' \
  SEED_ADMIN_PASSWORD='<strong>' \
  pnpm seed
```

---

## 11. Smoke test checklist

After first deploy, walk through these in order. Each should pass before announcing the site:

- [ ] `https://lionswrestling.dmcschools.org/` loads with the hero and seeded mission text.
- [ ] `/about`, `/schedule`, `/results`, `/gallery`, `/contact`, `/register` all render without errors.
- [ ] `/schedule` lists seeded events from the handoff.
- [ ] `/events.ics` returns a 200 with `Content-Type: text/calendar` and at least one `BEGIN:VEVENT` block.
- [ ] Submit a contact form (real email) → arrives at `lionswrestling@dmcschools.org`. Auto-reply arrives at the sender.
- [ ] Submit a registration form (test email) → confirmation arrives at parent email; notification arrives at coaches.
- [ ] Honeypot test: open browser devtools, fill the hidden `website` field, submit → form silently accepts (200) but no email lands.
- [ ] Fast-bot test: open `/contact`, immediately submit (<2s after page load) → returns 429.
- [ ] `/admin` redirects to login. Log in with the seed admin. Enroll 2FA on first login.
- [ ] Create a test event via the admin → `/schedule` updates within 60 seconds.
- [ ] Upload a test photo → mark featured → it appears in homepage gallery strip.
- [ ] Toggle maintenance mode on → public site shows "We'll be back shortly" page. Toggle off.
- [ ] Hit a `viewer` role's URL (you can manually create a viewer user) and confirm they cannot mutate.
- [ ] Lighthouse on `/` and `/schedule`: Perf ≥ 90, A11y == 100, Best Practices ≥ 95, SEO == 100.

---

## 12. Ongoing costs (per month)

| Service | Free tier limit | Estimated club usage | Cost |
|---|---|---|---|
| Vercel Hobby | 100GB bandwidth, 100K invocations | Far under | $0 |
| Neon Free | 0.5 GB storage, 191 compute hrs | Under | $0 |
| Cloudflare R2 | 10 GB + free egress | Under | $0 |
| Resend Free | 3,000 emails/month, 100/day | Under | $0 |
| Upstash Redis | 10K cmds/day | Under | $0 |
| Cloudflare Turnstile | Unlimited | Unlimited | $0 |
| Sentry Free | 5K errors/month | Under | $0 |
| Domain | — | — | ~$12/year |

Total ongoing: **~$1/month** (just the domain).

---

## 13. Rolling secrets

To rotate any secret:

1. Generate the new value (e.g. `openssl rand -hex 32` for `PAYLOAD_SECRET`).
2. Update in Vercel env vars (Production).
3. Trigger a redeploy (`vercel --prod` or push a no-op commit).
4. The old value is invalid the moment the new build serves.

For `PAYLOAD_SECRET`: rotating invalidates existing admin sessions and 2FA secrets (because TOTP secrets are encrypted at rest with it). Rotate only with a planned admin re-enrollment.

---

## 14. Production deploy is NOT executed by the autonomous build

This doc is what the user runs after the autonomous build hands off. No external accounts were created; no DNS was modified; no secrets were copied anywhere outside the local `.env` (which is gitignored).
