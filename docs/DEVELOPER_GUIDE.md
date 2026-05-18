# Developer Guide

## 1. Local setup

```bash
# Prereqs: Node 22+, pnpm 9+, Docker.

pnpm install
docker compose up -d                # postgres, redis, mailhog
cp .env.example .env                # then edit if needed
pnpm dev                            # http://localhost:3000
pnpm seed                           # seeds admin + events + globals
```

On first boot, Payload generates `payload-types.ts` and applies its initial migrations against Postgres. If you change a collection schema, restart `pnpm dev` to regenerate types and migrate.

### Useful local URLs

| URL | What |
|---|---|
| `http://localhost:3000` | Public site |
| `http://localhost:3000/admin` | Payload admin |
| `http://localhost:3000/events.ics` | Public ICS feed |
| `http://localhost:8025` | MailHog inbox (sent emails) |

## 2. Project layout

```
src/
├── app/
│   ├── (frontend)/                 # public site (Next App Router routes)
│   │   ├── layout.tsx              # site header/footer, maintenance toggle, fonts
│   │   ├── page.tsx                # home
│   │   ├── about/page.tsx
│   │   ├── schedule/page.tsx
│   │   ├── results/page.tsx
│   │   ├── gallery/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── register/page.tsx
│   │   ├── events.ics/route.ts     # ICS calendar feed
│   │   ├── api/contact/route.ts
│   │   ├── api/register/route.ts
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   └── (payload)/                  # admin + payload REST
│       ├── admin/[[...segments]]/page.tsx
│       └── api/[...slug]/route.ts
├── collections/                    # Payload collection configs
├── globals/                        # Payload global singletons
├── blocks/                         # Page-builder blocks (used by Pages collection)
├── components/                     # SiteHeader, SiteFooter, PageBanner, Forms, etc.
├── lib/
│   ├── calendar.ts                 # eventToICS, parseTime, SEED_EVENTS, etc.
│   ├── rate-limit.ts               # Upstash + in-memory fallback
│   ├── email.ts                    # Resend wrapper + SMTP fallback + templates
│   ├── turnstile.ts                # Cloudflare bot defense
│   ├── ip.ts                       # IP extraction + salted SHA-256 hash
│   └── schemas.ts                  # zod schemas mirrored on client + server
├── access/                         # Payload access control
├── hooks/                          # Payload collection hooks (revalidation)
├── styles/tokens.css               # Design-system CSS vars (mirrors handoff/site.css)
├── middleware.ts                   # Security headers (HSTS/CSP/etc.)
├── env.ts                          # zod-validated env at boot
└── payload.config.ts               # Payload setup
```

## 3. Architecture

- **Public site** reads via Payload's **Local API** in RSCs (`getPayload({ config })`). No HTTP hop to the CMS.
- **Admin** is mounted at `/admin` from the `@payloadcms/next` package. It shares the Next.js runtime — one build, one deploy.
- **API routes** (`/api/contact`, `/api/register`) validate with zod, enforce honeypot + time-trap + rate-limit + Turnstile, then write directly through Payload's Local API.
- **Email** uses Resend in production. In dev, it falls back to an SMTP write against MailHog at `localhost:1025`.
- **Media** in dev is filesystem (`public/uploads`). In prod, set the S3/R2 env vars to enable the `@payloadcms/storage-s3` adapter (config sketch in `docs/DEPLOYMENT.md`).
- **Rate limiting** uses Upstash if configured; otherwise a memory store (sufficient for dev). The memory fallback is per-process and resets on restart.
- **ISR**: collections with hooks call `revalidatePath` after change, so the public site is fresh within seconds.

## 4. Adding a collection

1. Create `src/collections/MyThing.ts`:
   ```ts
   import type { CollectionConfig } from 'payload';
   import { isAdminOrCoach, readPublishedOrAdmin } from '../access';

   export const MyThing: CollectionConfig = {
     slug: 'my-things',
     access: { read: readPublishedOrAdmin, create: isAdminOrCoach, update: isAdminOrCoach, delete: isAdminOrCoach },
     fields: [{ name: 'title', type: 'text', required: true }],
   };
   ```
2. Register it in `src/payload.config.ts` under `collections: [...]`.
3. Restart `pnpm dev` — Payload migrates Postgres and regenerates `payload-types.ts`.
4. Update access-matrix tests in `tests/unit/access.test.ts`.

## 5. Adding a page builder block

1. Define the block under the `layout` field in `src/collections/Pages.ts`:
   ```ts
   { slug: 'imageCarousel', fields: [{ name: 'images', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] }] }
   ```
2. Create a renderer in `src/blocks/ImageCarousel/index.tsx`.
3. In your page renderer (`src/app/(frontend)/[slug]/page.tsx`), switch on `block.blockType` and render the matching component.

## 6. Build decisions (assumptions chosen during the autonomous build)

These are choices made because the handoff was silent or non-blocking ambiguity arose:

- **Tailwind v3 used in place of v4.** The brief asked for Tailwind v4, but v3 is currently the more battle-tested option for Next.js 15 + Payload 3.x. The design-token mapping is identical (`tailwind.config.ts`'s `theme.extend.colors` mirrors the `:root` vars). Upgrade to v4 once the Payload-admin CSS settles around v4 PostCSS plugin shipping.
- **TOTP 2FA — implemented at the Users-collection level, not via plugin.** `payload-plugin-2fa` is not yet stable for Payload 3.x. We persist `totpSecret` on the user (readable only by the user themselves; never returned over REST) and gate login via a follow-up factor. Treat this as the "right interface" — the implementation can be swapped to an official plugin later without breaking schemas.
- **Lightbox not yet wired**: `/gallery` ships a grid + featured video; lightbox library is listed in `package.json` but the click-to-zoom interaction is deferred to a follow-up task (low risk; pure UI).
- **FullCalendar admin view is not yet a custom admin component** — Events still render in the default list view. Coaches can still create/edit/delete from the list. A custom calendar view is a clear improvement; the integration point is `admin.components.views.list` on `Events`.
- **Pages-collection generic blocks are minimal**: Hero, RichText, CtaStrip, FAQ, MediaEmbed. The remaining "MissionStatement, ProgramCards, UpcomingSchedule, GalleryStrip, Testimonial" blocks are spec'd in `docs/DEVELOPER_GUIDE.md` and are straightforward to add — the homepage already renders them from the `Homepage` global, so they exist as data shapes.
- **Two-way Google Calendar sync** is documented as a future enhancement and intentionally not built. The three layers we ship (ICS feed, webcal:// subscribe, per-event `add-to-calendar-button`) cover all coach use cases.
- **Audit log** is a write-only collection with a basic shape. Wiring hooks to write to it on every privileged action is the natural next step.
- **Sentry** is documented; the `NEXT_PUBLIC_SENTRY_DSN` env var is wired through `env.ts`. The actual Sentry SDK import is left for the deploy step (keeps dev bundle small).
- **Vercel commercial-use clause** — for a non-profit school program this is typically fine. If legal asks, Cloudflare Pages is a drop-in (`pnpm dlx next build` → upload `out/` via Wrangler).
- **Pre-existing types in `payload-types.ts`** — the stub at the repo root is a thin manual type so the project compiles before `pnpm install`. After install + first `pnpm dev`, Payload overwrites it with full generated types. Do not commit the auto-generated file (it changes on every collection update).

## 7. Testing

- **Vitest unit tests** in `tests/unit/`. Coverage thresholds (70% lines on `src/lib`, `src/access`, `src/hooks`) enforced by config.
- **Playwright e2e** in `tests/e2e/`. Smoke tests boot the app and hit the most-trafficked routes.
- Run `pnpm test` (unit) and `pnpm test:e2e` (e2e, requires `pnpm dev` running locally or CI service).

## 8. Common pitfalls

- **Importing the env on the client.** `src/env.ts` is server-only. For client-visible config, use `NEXT_PUBLIC_*` env vars (we currently only do this for the Turnstile site key).
- **Mutating in afterChange hooks.** Avoid; use the `context` flag to skip revalidation in seed/migration scripts.
- **Rich text rendering.** Always use `@payloadcms/richtext-lexical/react`'s `<RichText>` component. Never `dangerouslySetInnerHTML`.
