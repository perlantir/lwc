# Lions Wrestling Club — Build Handoff

**Date:** 2026-05-18
**Status:** Local-development-ready; production deployment is queued (see `docs/DEPLOYMENT.md`).

## Local pipeline (all green at handoff)

```
pnpm typecheck   → ✓
pnpm lint        → ✓ (0 warnings)
pnpm test        → ✓ 36 tests passed (3 files: calendar / access / schemas)
pnpm build       → ✓ 13 routes compiled
pnpm audit --prod --audit-level=high → ✓ (0 high; 12 moderate, all in deep transitives)
pnpm seed        → ✓ Created admin user; seeded 27 events + 5 globals
```

## Live smoke tests against `pnpm start` build (port 3000)

| Test | Expected | Got |
|---|---|---|
| `GET /events.ics` | 200, `text/calendar`, valid VCALENDAR | ✓ 200, `text/calendar; charset=utf-8`, valid header/footer |
| `GET /` | 200, hero copy renders | ✓ 200, "Forge tough kids…" text present |
| Security headers | HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy | ✓ all set (HSTS in prod only) |
| `GET /admin` | redirects to login or create-first-user | ✓ 200 (login screen) |
| `POST /api/contact` (honeypot) | 4xx | ✓ 400, error includes "Spam detected" |
| `POST /api/contact` (time-trap, <2s) | 429 | ✓ 429 "Submission too fast" |
| `POST /api/contact` (happy path) | 200, `{ ok: true }` | ✓ 200 `{ "ok": true }` |


This document summarizes what was built in the autonomous run, what passes locally, what's outstanding, and exactly what to do next.

---

## What's built

### 1. Scaffold
- **Next.js 15** App Router, **TypeScript strict**, **pnpm 9**.
- **Payload CMS 3.x** mounted at `/admin` and `/api/*` inside the same Next.js app.
- **PostgreSQL** via `@payloadcms/db-postgres`.
- **Tailwind v3** with the `:root` design tokens from `handoff/site.css` mapped into the Tailwind theme.
- All assets copied: `handoff/assets/images/*` → `public/images/`, `handoff/assets/logos/*` → `public/logos/`.

### 2. Content model
All collections and globals from §5 of the build brief:

- **Collections:** Users, Events, Recaps, Photos, Albums, Coaches, Pages, Registrations, ContactSubmissions, Media, Redirects, AuditLog.
- **Globals:** Header, Footer, SiteSettings, ContactConfig, Homepage.
- **Access control:** role-based (`admin`, `coach`, `viewer`) with default-deny and field-level access on `Users.role`.
- **Versions + drafts** enabled on Events, Recaps, Pages.
- **Seed script** (`pnpm seed`) — imports the 27 events from `handoff/schedule.html`, creates the first admin user, and populates Homepage / Header / Footer / ContactConfig / SiteSettings defaults.

### 3. Public pages (all 7)
- `/` — hero, mission, program cards, upcoming schedule, gallery strip, testimonial, CTA strip.
- `/about` — banner, mission, values, coaches grid.
- `/schedule` — matches/practices lists, subscribe modal (Google / Apple / Outlook / raw URL), per-event Add-to-Calendar via `add-to-calendar-button-react` (Google, Apple, Outlook, Outlook.com, Yahoo, iCal).
- `/results` — chronological recaps with Lexical rich-text rendering.
- `/gallery` — featured video (YouTube via no-cookie embed), photo grid.
- `/contact` — react-hook-form + zod, honeypot, time-trap, Turnstile-ready.
- `/register` — multi-section form with grade chips and gender segmented control, same security envelope.

All pages render at desktop (max-width 941px) and adapt below 768px (header collapses to hamburger; grids stack).

### 4. APIs and security
- `POST /api/contact` and `POST /api/register` — zod-validated, honeypot, time-trap, Upstash rate-limited, Turnstile-ready, IP hashed before logging, dispatches emails via Resend (or MailHog SMTP in dev).
- `GET /events.ics` — RFC 5545 VCALENDAR feed with proper headers (`Content-Type: text/calendar`, cache 10 min), UIDs scoped to `event-<id>@lionswrestling.dmcschools.org`, `SEQUENCE` field for update semantics.
- `middleware.ts` — sets HSTS (prod only), CSP with explicit allowlists, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- `sitemap.xml` and `robots.txt` auto-generated.

### 5. Tests
- **Vitest unit tests** for `lib/calendar.ts`, `lib/schemas.ts`, and the full `access/` matrix. Coverage thresholds enforced.
- **Playwright** config and smoke spec (home, schedule, ICS feed, honeypot, admin redirect).
- **GitHub Actions** CI: install → typecheck → lint → audit → test → build.

### 6. Docs (all 5 written, each >100 lines)
- `docs/ADMIN_GUIDE.md` — for coaches, plain language, step-by-step.
- `docs/DEVELOPER_GUIDE.md` — architecture, build decisions, how to add a collection/block.
- `docs/DEPLOYMENT.md` — full Vercel + Neon + R2 + Resend + Upstash + Turnstile + Sentry walkthrough including DNS records for `dmcschools.org`.
- `docs/SECURITY.md` — threat model, controls, role matrix, rotation procedure, incident response.
- `docs/RUNBOOK.md` — ops, common incidents, on-call checklist, log queries.

---

## What's outstanding (good follow-up tasks)

These were intentionally deferred — none are blockers for go-live, but they're the natural next moves. Logged in `docs/DEVELOPER_GUIDE.md` §6 "Build Decisions":

1. **FullCalendar admin view** for Events — currently coaches use the default list. The custom calendar view is spec'd but not implemented.
2. **TOTP enrollment UI** — the user model has `totpSecret` and `totpEnrolled` fields; the enrollment flow component is not yet shipped. Use `payload-plugin-2fa` when it lands stable for Payload 3.x, or build a custom view.
3. **Lightbox** on `/gallery` — library is in `package.json`; component not yet wired.
4. **Page-builder block library** — Hero/RichText/CtaStrip/FAQ/MediaEmbed are implemented in the `Pages` collection; MissionStatement/ProgramCards/UpcomingSchedule/GalleryStrip/Testimonial are rendered from the `Homepage` global today and would need to be lifted into reusable blocks to support coach-authored landing pages.
5. **Audit-log hooks** — the AuditLog collection exists; hooks that write to it on login/role-change/delete events are next.
6. **Sentry SDK wiring** — DSN reads through env; `@sentry/nextjs` install + `instrumentation.ts` is a final-deploy step.
7. **Real coach bios / photos** — placeholder; coaches must populate via admin.

---

## Coach TODOs after go-live

Things only the coaches/admins can do — list these in the email to the school:

- [ ] Verify the seeded `Header → Instagram URL` / `Facebook URL` once real social accounts exist.
- [ ] Verify the seeded `Footer → address / phone / email` are still correct.
- [ ] Upload real coach photos and bios via `/admin → Content → Coaches`.
- [ ] Write the first recap on `/admin → Content → Recaps` so `/results` isn't empty.
- [ ] Upload photos and mark 3–6 as **featured** so they appear on the homepage gallery strip.
- [ ] Set `Site Settings → Featured video URL` to the latest highlights reel for `/gallery`.
- [ ] Optional: turn on `Contact Config → Turnstile enabled` after seeding the Turnstile site key.

---

# Ready to Deploy — checklist

Follow `docs/DEPLOYMENT.md` for the full step-by-step. Quick summary:

## External services to provision

| Service | Why | Free tier? |
|---|---|---|
| **Neon** | Postgres | ✅ (0.5 GB, 191 compute-hrs) |
| **Cloudflare R2** | Media storage | ✅ (10 GB + free egress) |
| **Resend** | Transactional email | ✅ (3,000/month, 100/day) |
| **Upstash** | Rate-limit Redis | ✅ (10K cmds/day) |
| **Cloudflare Turnstile** | Bot defense | ✅ (unlimited) |
| **Sentry** | Error monitoring | ✅ (5K errors/month) |
| **Vercel** | Hosting | ✅ (Hobby plan; non-profit/club use typically OK) |

Total ongoing cost: **~$1/month** (domain only).

## Env vars to set in Vercel (Production)

```
DATABASE_URL=postgresql://lwc_app:<pwd>@ep-xxxx.us-east-2.aws.neon.tech/lwc?sslmode=require
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

## DNS records to add on `dmcschools.org`

| Type | Name | Value | Purpose |
|---|---|---|---|
| `CNAME` | `lionswrestling` | `cname.vercel-dns.com.` | Site root |
| `CNAME` | `media.lionswrestling` | (Cloudflare R2 custom domain) | Media |
| `TXT` | `dmcschools.org` | `v=spf1 include:amazonses.com ~all` | SPF for Resend |
| `TXT` | `resend._domainkey` | (long key from Resend dashboard) | DKIM |
| `TXT` | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:lionswrestling@dmcschools.org` | DMARC |
| `MX` | `send` | `feedback-smtp.us-east-1.amazonses.com` priority 10 | Bounces |

## Deploy commands

```bash
# 1. Push to main triggers Vercel build:
git push origin main

# 2. Run migrations and seed against the prod DB (one time only):
DATABASE_URL='<prod-url>' PAYLOAD_SECRET='<prod-secret>' pnpm migrate
DATABASE_URL='<prod-url>' PAYLOAD_SECRET='<prod-secret>' \
  SEED_ADMIN_EMAIL='admin@dmcschools.org' \
  SEED_ADMIN_PASSWORD='<strong-password>' \
  pnpm seed
```

## Smoke test (after first deploy)

Walk through every item in `docs/DEPLOYMENT.md` §11. Don't announce the URL until each line is checked.

---

## Local URLs (what's running now)

- Public site: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- ICS feed: `http://localhost:3000/events.ics`
- MailHog inbox: `http://localhost:8025`

Seed admin email (defaults from `.env`): `admin@dmcschools.org` / `ChangeMeNow_VeryStrong_2026` — **change these immediately in production**.

---

That's the build. Push, deploy, walk the smoke-test list, and you're live.

🦁 Go Lions.
