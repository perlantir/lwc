# DMC Lions Wrestling Club — Build Brief (CLAUDE.md)

> **How this file is used:** Place this file at the project root as `./CLAUDE.md`. Claude Code auto-loads it as project context. The accompanying `/goal` condition (see `goal-condition.md`) is the short, ≤4000-character directive that defines the finish line and starts the autonomous run.

You are building the **Des Moines Christian Lions Wrestling Club** production website and admin panel. This is a single, autonomous build. Do not pause for sign-off between sections — work through to completion, then deliver a single handoff at the end. Ask the user ONLY if a question is truly blocking (see §13).

The completed design + content handoff is provided at `./handoff/`. Read it first, then execute.

---

## 1. Source materials (read these first, in order)

1. `./handoff/CLAUDE.md` — the original design handoff with page-by-page intent.
2. `./handoff/site.css` — shared design tokens, header, footer, buttons. Treat the `:root` variables as the canonical design system.
3. `./handoff/*.html` — 7 fully designed pages. **Match the visual design exactly** when porting to components. Colors, type, spacing, and component shapes are approved. Only change: make the fixed 941px desktop layout fluid-responsive (breakpoint at `< 768px`).
4. `./handoff/assets/images/` and `./handoff/assets/logos/` — copy these into the project at `public/images/` and `public/logos/` and serve via `next/image` (raster) or as-is (PNG logos).

Inline JS in `schedule.html` contains a complete `EVENTS` array with seed data and helpers (`eventToICS`, `parseTime`, `downloadICS`, `parseDate`, `mkDate`). Lift these into `src/lib/calendar.ts` and seed the database with the existing entries on first run.

---

## 2. Tech stack (locked — do not substitute)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router)** + TypeScript strict | SSR/ISR, same codebase for site + admin |
| CMS / Admin | **Payload CMS 3.x** | Free MIT forever, self-hosted, modern admin UI, block-based page builder, live preview, drafts/versions, built-in auth + RBAC, runs *in the same Next.js app* — the user gets one deploy, one URL, one codebase |
| Database | **PostgreSQL 16+** | Payload's recommended adapter. Use **Neon** free tier in production (0.5GB, ample for this site) |
| Styling | **Tailwind CSS v4** | Map the `site.css` `:root` tokens directly into Tailwind theme |
| Forms (frontend) | `react-hook-form` + `zod` | Type-safe validation matching server schemas |
| Calendar UI / sync | **`@fullcalendar/react`** (admin calendar view) + **`add-to-calendar-button`** (per-event multi-provider) + native ICS feed | Free, MIT, covers Google/Apple/Outlook/Yahoo from one component |
| Email | **Resend** | Free tier: 3,000/month, 100/day — well within club volume |
| Media | **Cloudflare R2** via `@payloadcms/storage-s3` | 10GB free storage, free egress (matters for the gallery) |
| Rate limiting | `@upstash/ratelimit` + Upstash Redis free tier (10K cmds/day) | |
| Bot defense | **Cloudflare Turnstile** (free, GDPR-friendly, no Google) | |
| Analytics | **Cloudflare Web Analytics** (free, cookieless) | Toggle on via SiteSettings; load nothing if not configured |
| Observability | **Sentry** free tier (5K errors/month) + `pino` structured logs | |
| Testing | **Vitest** (unit) + **Playwright** (e2e + visual regression) | |
| Hosting | **Vercel** free tier (Next.js) + Neon (Postgres) | Confirmed target. All-free production setup. The only ongoing cost is the domain (~$12/year). |

**Why Payload over building a custom admin or using WordPress:**
- Custom = 3–6 months extra work, less secure.
- WordPress = PHP/MySQL split from a Next.js frontend, plugin sprawl, weekly attack surface.
- Payload = same Next.js codebase; coaches get drag/drop page editing, live preview, calendar view, image management, user roles, audit log, 2FA — out of the box, all free.

**Node:** Latest LTS at build time. Pin via `.nvmrc` + `engines` in `package.json`. Use **pnpm**.

---

## 3. Architecture & folder layout

Mount Payload's admin at `/admin` and Payload's REST/GraphQL at `/api/*` inside the Next.js app. The public site reads via Payload's **Local API** (in-process, no HTTP hop).

```
/
├── src/
│   ├── app/
│   │   ├── (frontend)/              # public site
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # home (porting "Lions Wrestling Club.html")
│   │   │   ├── about/page.tsx
│   │   │   ├── schedule/page.tsx
│   │   │   ├── results/page.tsx
│   │   │   ├── gallery/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── [slug]/page.tsx       # CMS-authored pages
│   │   │   ├── events.ics/route.ts   # public ICS calendar feed
│   │   │   ├── sitemap.ts
│   │   │   ├── robots.ts
│   │   │   ├── not-found.tsx
│   │   │   ├── error.tsx
│   │   │   └── api/
│   │   │       ├── register/route.ts   # POST register form
│   │   │       └── contact/route.ts    # POST contact form
│   │   └── (payload)/                  # admin + payload api
│   │       ├── admin/[[...segments]]/page.tsx
│   │       └── api/[...slug]/route.ts
│   ├── collections/
│   │   ├── Events.ts
│   │   ├── Recaps.ts
│   │   ├── Photos.ts
│   │   ├── Albums.ts
│   │   ├── Coaches.ts
│   │   ├── Pages.ts
│   │   ├── Registrations.ts            # registration submissions (read-mostly)
│   │   ├── ContactSubmissions.ts       # contact form submissions (read-mostly)
│   │   ├── Media.ts                    # generic uploads (for non-gallery)
│   │   ├── Users.ts                    # admin staff
│   │   └── Redirects.ts
│   ├── globals/
│   │   ├── Header.ts
│   │   ├── Footer.ts
│   │   ├── SiteSettings.ts
│   │   ├── ContactConfig.ts
│   │   └── Homepage.ts                 # hero copy, mission, CTA, testimonial
│   ├── blocks/
│   │   ├── Hero/
│   │   ├── MissionStatement/
│   │   ├── ProgramCards/
│   │   ├── UpcomingSchedule/
│   │   ├── GalleryStrip/
│   │   ├── Testimonial/
│   │   ├── CtaStrip/
│   │   ├── FaqAccordion/
│   │   ├── RichText/
│   │   └── MediaEmbed/
│   ├── components/                     # SiteHeader, SiteFooter, Calendar, EventList, etc.
│   ├── lib/
│   │   ├── calendar.ts                 # eventToICS, parseTime, parseDate, mkDate, downloadICS
│   │   ├── rate-limit.ts
│   │   ├── email.ts                    # Resend wrapper + React Email templates
│   │   ├── turnstile.ts
│   │   └── revalidate.ts
│   ├── access/                         # Payload access control functions
│   ├── hooks/                          # collection hooks (revalidation, notifications)
│   ├── emails/                         # React Email templates
│   ├── styles/
│   │   └── tokens.css                  # CSS vars mirroring site.css :root
│   ├── payload.config.ts
│   ├── env.ts                          # zod-validated env at boot
│   └── middleware.ts                   # redirects + security headers + rate limit
├── tests/
│   ├── unit/
│   ├── e2e/
│   └── fixtures/
├── public/
│   ├── images/                         # copied from handoff/assets/images
│   └── logos/                          # copied from handoff/assets/logos
├── docs/
│   ├── ADMIN_GUIDE.md
│   ├── DEVELOPER_GUIDE.md
│   ├── DEPLOYMENT.md
│   ├── SECURITY.md
│   └── RUNBOOK.md
├── docker-compose.yml                  # local Postgres + Redis + MailHog
├── .env.example
├── .nvmrc
└── README.md
```

---

## 4. Design system (extract directly from `./handoff/site.css`)

Encode these CSS variables in `src/styles/tokens.css` exactly, then map to Tailwind in `tailwind.config.ts`. Components consume tokens via Tailwind classes, never raw hex.

```css
:root {
  --navy: #061B3A;
  --deep-navy: #03142B;
  --royal: #003A78;
  --cyan: #12AEEA;
  --cyan-dark: #079DDB;
  --white: #FFFFFF;
  --off-white: #F8FBFF;
  --text-navy: #071C3D;
  --muted: #6E7C8E;
  --border: #E3EAF3;
  --card-shadow: 0 20px 45px rgba(0, 31, 68, .16);
  --soft-shadow: 0 10px 30px rgba(0, 31, 68, .12);
}
```

- **Font:** Inter (400/500/600/700/800) self-hosted via `next/font/google` with `display: swap`. No runtime Google Fonts request.
- **Radii:** buttons 8px, cards 12–16px, pills 24px.
- **Page background:** `#ECEEF1`. Content card background: `--off-white`.
- **Container:** desktop max-width 941px centered; below 768px, fluid full-width with 20px gutters. Header nav collapses to a hamburger on mobile.
- **Active nav state:** white text + 2px cyan underline 6px below baseline.
- **Buttons:** `.btn-cyan` (filled, glow shadow) and `.btn-outline` (1.5px cyan border, transparent). Implement as a single `<Button variant="cyan|outline" size="md|lg">` component.
- **Page banner:** the `<section class="page-banner">` pattern used on every subpage — navy bg, cta-bg overlay at 22% opacity, lion-head decoration top-right at 18% opacity. Implement as `<PageBanner eyebrow title body crumbs />`.
- **CTA strip:** the navy `.cta-strip` block — implement as a block, used at the bottom of most pages.

Header: lion head mark on the left (no wordmark), nav center, Instagram/Facebook icon buttons, "Join the Lions" cyan CTA on the right.

Footer: lion head mark + Quick Links (Home, About, Schedule, Results, Gallery, Contact) + Contact column (address, phone, email, social pills). Bottom legal line.

Social URLs (replace before launch — coaches will provide):
- `https://instagram.com/dmclionswrestling`
- `https://facebook.com/dmclionswrestling`

Club contact (already correct, verify on admin onboarding):
- Address: 9730 Woodland, Cumming, IA 50061
- Phone: 515-844-3947
- Email: lionswrestling@dmcschools.org

---

## 5. Content model

### 5.1 Collections

**Events** — wrestling schedule.
```ts
{
  title: string (required),
  date: date (required, indexed),
  time: string,                  // "5:30 PM" | "All Day" | "10:00 AM"
  allDay: boolean,
  kind: select<'home' | 'away' | 'tour' | 'prac'>  // home match | away match | tournament | practice
  location: string,
  notes: string (textarea),
  status: select<'draft' | 'published'> (default 'published'),
  // Payload built-ins: drafts + versions enabled
}
```
- Admin view: a custom **Calendar** view using `@fullcalendar/react` (month/week/list), alongside the default list view. Coaches can click a date to add an event, click an event to edit.
- Public: `/schedule` shows calendar grid + Matches/Practices tabs (port the existing UI exactly). Each event has an "Add to Calendar" button that calls `eventToICS()`.
- Indexes: `date`, `kind`, `status`.
- Seed: import all 30+ entries from `EVENTS` in `schedule.html` on first migration.

**Recaps** — coach-written recent results.
```ts
{
  date: date (required, indexed),
  kicker: string,                // "Away Dual · CIML"
  title: string (required),      // "Lions storm Valley HS, 52 – 18"
  body: richText (Lexical),
  tags: array<{ icon: select, label: string }>,  // chips: bout record, pins, location, etc.
  featured: boolean,
  status: select<'draft' | 'published'>,
}
```
- Public: `/results` reverse-chronological list. Port the existing date-stamp + body + chips layout.
- Seed: optional — leave empty for coaches to populate, or seed the 6 existing entries from `results.html`.

**Photos** — gallery images.
```ts
{
  image: upload (relationship to Media, required),
  caption: string,
  date: date,
  album: relationship<Albums> (optional),
  featured: boolean,             // surfaces in homepage gallery strip
  order: number,
}
```
- Use the Photos collection as both the storage and the gallery model. Auto-generate responsive sizes (thumbnail 300, card 600, feature 1200) via Payload's image resize.
- Public: `/gallery` masonry layout, filterable by album. Lightbox on click.

**Albums** — groupings of photos by event.
```ts
{
  title: string (required),
  slug: string (unique, auto-generated),
  date: date,
  coverPhoto: relationship<Photos>,
  description: string,
}
```

**Coaches** — staff bios for `/about`.
```ts
{
  name: string (required),
  role: string,                  // "Head Coach" | "Assistant"
  photo: upload,
  bio: richText,
  email: string,
  order: number,
}
```

**Pages** — admin-composed pages via the block-based page builder (for future pages like "Booster Club," "Camps," etc. that coaches add without dev help).
```ts
{
  title: string,
  slug: string (unique),
  layout: blocks[],              // see §5.3
  seo: { metaTitle, metaDescription, ogImage, canonical, noIndex },
  status: select<'draft' | 'published'>,
  publishedAt: date,
}
```

**Registrations** — wrestler signup submissions.
```ts
{
  wrestlerFirstName, wrestlerLastName, dob: date, school, grade, weight, gender,
  address,
  parentName, relationship, parentPhone, parentEmail,
  consent: boolean (required true),
  marketingOptIn: boolean,
  status: select<'new' | 'contacted' | 'enrolled' | 'archived'>,
  submittedAt: date (auto),
  ipHash: string (SHA-256 of IP),
  userAgent: string,
  internalNotes: string (admin only),
}
```
- Coaches: read + update `status` and `internalNotes` only. Cannot edit submitted data. Cannot hard-delete (soft archive only).
- Export to CSV from the admin list view.

**ContactSubmissions** — contact form submissions.
```ts
{
  firstName, lastName, email, phone,
  grade,                          // "K – 2 (Mini Lions)" | "3 – 6 (Youth)" | ...
  experience,                     // "Brand new" | "1 – 2 seasons" | "3+ seasons"
  message,
  marketingOptIn: boolean,
  status: select<'new' | 'read' | 'replied' | 'archived' | 'spam'>,
  submittedAt: date (auto),
  ipHash, userAgent,
  internalNotes: string,
}
```

**Media** — generic uploads (used by Pages, Coaches, Recaps richtext). Distinct from Photos so the gallery stays clean.
- Required `alt` text — enforce in `beforeChange` hook (reject save if missing).
- Mime allowlist: jpg/png/webp/avif/svg, PDF. Magic-byte sniffing, not extension trust. SVGs sanitized via `dompurify` (jsdom).
- Max sizes: 10MB images, 25MB PDF.

**Users** — admin staff (coaches).
- Roles defined in `src/access/roles.ts`:
  - `admin` — full access including user management and site settings.
  - `coach` — manage Events, Recaps, Photos, Albums, ContactSubmissions, Registrations. Cannot manage Users or SiteSettings.
  - `viewer` — read-only.
- **2FA (TOTP) mandatory** for all users via Payload's auth + a TOTP plugin (`payload-plugin-2fa` or equivalent maintained option — if unavailable, implement with `otplib` and require enrollment on first login).
- Password policy: min 14 chars, zxcvbn score ≥ 3.
- Account lockout: 5 failed logins → 15 min lock.
- Sessions: HttpOnly + Secure + SameSite=Lax. 8h idle / 12h absolute timeout. Rotate session ID on login and privilege change.

**Redirects** — managed in admin.
```ts
{ from: string (unique), to: string, type: select<'301' | '302'>, enabled: boolean }
```
- `middleware.ts` reads cached redirects; invalidates cache on Payload `afterChange`.

### 5.2 Globals (singletons)

**Header** — `navItems` array (label, type: page|url, page rel, url, openInNewTab, children up to 2 levels), `ctaLabel`, `ctaHref`, `instagramUrl`, `facebookUrl`.

**Footer** — `quickLinks` array, `address`, `phone`, `email`, `instagramUrl`, `facebookUrl`, `copyrightText`.

**SiteSettings** — `siteName`, `tagline`, `defaultOgImage`, `favicon`, `cloudflareAnalyticsToken` (optional — site loads CF Web Analytics only if set), `maintenanceMode` (boolean).

**ContactConfig** — `recipientEmails` (array — defaults to `lionswrestling@dmcschools.org`), `subjectPrefix`, `autoReplyEnabled`, `autoReplySubject`, `autoReplyBody` (richtext with `{{name}}` merge tag), `turnstileEnabled`, `rateLimitPerHour` (default 5).

**Homepage** — `heroEyebrow`, `heroHeading`, `heroSubheading`, `heroBackgroundImage`, `heroPrimaryCta`, `heroSecondaryCta`, `missionHeading`, `missionBody`, `missionPhoto`, `programCards` (array), `testimonialQuote`, `testimonialAuthor`, `testimonialRole`. Everything coaches might want to tweak on the homepage without touching code.

### 5.3 Blocks (page builder, for the generic `Pages` collection)

Implement each as `{ slug, fields[], Component }`. Required minimum: **Hero**, **RichText**, **MissionStatement**, **ProgramCards**, **UpcomingSchedule**, **GalleryStrip**, **Testimonial**, **CtaStrip**, **FaqAccordion**, **MediaEmbed**. Match the visual design of the corresponding sections in the handoff HTML files.

Every block must:
1. Be fully responsive at `< 768px`.
2. Pass `@axe-core` accessibility checks (zero violations).
3. Be typed end-to-end (Payload schema → React props, no `any`).
4. Render in Payload's live preview.

---

## 6. Page-by-page build (porting the static HTML)

For each page below: port the markup from `./handoff/<file>` into a Next.js page or block component. **Preserve the visual design exactly.** Replace inline data with Payload reads.

### 6.1 `/` (home) — from `Lions Wrestling Club.html`
- Hero, mission, program cards, upcoming schedule preview (3 rows), gallery thumbnail row (6 most recent featured photos), testimonial, CTA strip.
- Data sources: `Homepage` global, `Events` (filter `date >= today`, sort asc, limit 3), `Photos` (filter `featured = true`, sort `date desc`, limit 6), `Testimonial` from `Homepage` global.
- ISR: revalidate when Homepage global or Events/Photos change (via `afterChange` hook → `revalidatePath('/')`).

### 6.2 `/about` — from `about.html`
- Banner, mission section, values, coaches grid (from `Coaches` collection sorted by `order`).
- Replace placeholder bios with real content — coaches will populate via admin.

### 6.3 `/schedule` — from `schedule.html` **(highest priority for dynamic backend)**
- Port the calendar grid + Matches/Practices tabs exactly.
- Lift `eventToICS`, `parseTime`, `downloadICS`, `parseDate`, `mkDate` into `src/lib/calendar.ts`.
- Remove the demo `TODAY = '2026-01-15'` constant — use `new Date()`.
- Data source: `Events` collection where `status = published`.
- **Calendar sync — three layers** (all on this page):
  1. **Subscribe to feed.** A "Subscribe" button next to the page title opens a modal with the full subscription URL and one-tap actions:
     - **Google Calendar**: link to `https://calendar.google.com/calendar/r?cid=<encoded-https-url>` — opens Google with the feed pre-filled.
     - **Apple Calendar / iOS**: link uses the `webcal://` protocol (e.g. `webcal://yoursite.com/events.ics`) — Apple Calendar registers as the handler and prompts to subscribe.
     - **Outlook**: copy-URL with instructions ("In Outlook: Add calendar → Subscribe from web → paste this URL").
     - **Raw URL + Copy button** for any other client.
     - Note in the modal: "Google polls every ~12–24 hours; Apple typically refreshes within 15 minutes."
  2. **Add a single event.** Each event card gets an "Add to Calendar" dropdown via the **`add-to-calendar-button`** library (`atcb-action` package, MIT, framework-agnostic, supports Google, Apple, Outlook, Outlook.com, Yahoo, and ICS download from one component). Install with `pnpm add add-to-calendar-button`. Wire each event's `date`, `time`, `title`, `location`, `notes` into the component's props.
  3. **Public ICS feed** at `/events.ics` — full subscribable calendar (all upcoming events). Set headers: `Content-Type: text/calendar; charset=utf-8`, `Cache-Control: public, max-age=600`. UID per event: `event-<id>@lionswrestling.dmcschools.org`. Include `DTSTAMP`, `LAST-MODIFIED`, `SEQUENCE` (increment on edit) for proper update semantics when subscribers re-fetch.
- **Future enhancement (do not build now, document only in DEVELOPER_GUIDE.md):** two-way Google Calendar sync via Google Calendar API + OAuth. Adds complexity (refresh tokens, conflict resolution, per-coach OAuth flow) without clear benefit for a wrestling club. Revisit only if coaches request near-real-time Google sync.

### 6.4 `/results` — from `results.html`
- Port the date-stamp + body + chips layout.
- Reverse-chronological list of `Recaps` where `status = published`.
- Render `body` (Lexical) via the Payload Lexical-to-React serializer (sanitized).

### 6.5 `/gallery` — from `gallery.html`
- Featured video section (keep as YouTube embed for now — admin enters a URL in `SiteSettings.featuredVideoUrl`).
- Masonry grid of `Photos`, filterable by `Albums`.
- Lightbox on click (use `yet-another-react-lightbox` or similar tiny lib).
- "Submit Photos" CTA opens a `mailto:` to `lionswrestling@dmcschools.org` for now.

### 6.6 `/contact` — from `contact.html`
- Port the reason picker + form + FAQ accordion + coach contacts side panel.
- Form fields: `firstName*, lastName*, email*, phone, grade, experience, message*, marketingOptIn`.
- Submit handler: `POST /api/contact`.
  - Server validates with zod (matching schema).
  - Honeypot field named `website` (hidden via CSS; reject if non-empty).
  - Time-trap: reject submissions completed in < 2 seconds (track render timestamp).
  - Turnstile token verification (if enabled in ContactConfig).
  - Rate limit per `ContactConfig.rateLimitPerHour` per IP.
  - Insert into `ContactSubmissions`.
  - Send notification email to `ContactConfig.recipientEmails` via Resend with a React Email template.
  - Send auto-reply if enabled.
  - Return 200 + success state, or 4xx with field errors.

### 6.7 `/register` — from `register.html` **(2nd highest priority)**
- Port the multi-section form exactly: grade chips, gender segmented control, all inputs.
- Re-implement grade chips and gender segmented control as controlled inputs (React state). Selected chip: cyan bg + white text. Unselected: white bg + navy border.
- Form fields (exact names from handoff): `wFirst*, wLast*, dob*, school*, grade*, weight*, gender*, address*, parentName*, relationship, parentPhone*, parentEmail*, consent*, updates`.
- Submit: `POST /api/register`. Same security envelope as contact form (zod, honeypot, time-trap, Turnstile, rate limit).
- On success:
  - Insert into `Registrations`.
  - Send confirmation email to parent (`parentEmail`) — friendly "Welcome to the Lions" template, what to expect next.
  - Send notification to `ContactConfig.recipientEmails` (or a separate `RegistrationConfig.recipients` if you want to split).
  - Swap the form view to the success state already designed: show the "Thank you for registering, [name]!" card, interpolating `wFirst` into the heading.

---

## 7. Admin panel — what coaches must be able to do

A non-technical coach logging into `/admin` must be able to, without dev help:

- [ ] **Log in** with email + password + TOTP code. Enroll TOTP on first login (QR code + manual key).
- [ ] **See a dashboard** with: count of new registrations, count of new contact submissions, count of upcoming events this week, recent activity.
- [ ] **Add/edit/delete events** in a calendar view (FullCalendar embedded). Drag to reschedule. Click date to add. Set kind, time, location, notes.
- [ ] **Write a recap** in a rich-text editor. Add date, kicker, title, body, chip tags. Save as draft or publish.
- [ ] **Upload photos** (drag-drop), tag with an album, set caption + date, mark as featured (appears on homepage).
- [ ] **Create albums** and assign photos.
- [ ] **Edit coach bios** — name, role, photo, bio, email, sort order.
- [ ] **Edit homepage hero copy, mission, program cards, testimonial** via the `Homepage` global.
- [ ] **Reorder main navigation**, add/remove items, link items to internal pages (picker) or external URLs.
- [ ] **Edit site name, tagline, OG image, favicon, social URLs, analytics token.**
- [ ] **View registrations**, mark status (new / contacted / enrolled / archived), add internal notes, export CSV.
- [ ] **View contact submissions**, mark status, reply via mailto link, archive.
- [ ] **Manage redirects** without code (e.g., old `/camps-2025` → `/camps`).
- [ ] **Enable maintenance mode** (takeover page with the lion logo + "We'll be back shortly" — design-system styled).
- [ ] **Compose a new generic page** with the block-based page builder (Hero + RichText + CtaStrip etc.), set SEO, preview, publish.
- [ ] **Use live preview** — see edits render in-place before publishing.
- [ ] **Restore a previous version** of any page, recap, or event (Payload's built-in versions).
- [ ] **Schedule a recap or page** to publish at a future date/time.
- [ ] **Manage admin users** (admins only): invite by email, set role, deactivate. New users get an email with a one-time link to set password + enroll 2FA.
- [ ] **See audit log** of who changed what when (auth events, role changes, deletes, settings changes).

**Branding the admin**: set Payload's admin meta to "Lions Wrestling Club Admin", favicon to `lion-head-blue-transparent.png`, login screen background tinted navy, accent color `#12AEEA`. The admin should *feel* like part of the site.

---

## 8. Security (non-negotiable — all must ship)

### Auth & sessions
- Argon2id password hashing (Payload default).
- 2FA mandatory, enrolled on first login.
- Account lockout: 5 failed → 15 min. Exponential backoff after repeat.
- Sessions: HttpOnly + Secure + SameSite=Lax cookies. Rotate session ID on login + privilege change.
- CSRF protection on all state-changing admin endpoints (verify Payload's built-in is on).
- Password reset: single-use token, 1-hour TTL, rate-limited.

### Authorization
- Default-deny in every collection's `access` config. Explicitly grant per role.
- Field-level access: `Users.role` only editable by `admin`, never by self.
- Vitest tests cover the access matrix: every collection × role × operation (read/create/update/delete).

### Input handling
- All form inputs validated server-side with zod. Client validation is UX only.
- Rich text rendered with a sanitizing Lexical serializer; never `dangerouslySetInnerHTML` on user content.
- SVG uploads sanitized with `dompurify` (jsdom on server).
- File uploads: magic-byte sniffing (`file-type` package), mime allowlist, size cap, reject double extensions.

### Transport & headers (set in `middleware.ts`)
- HTTPS only, HSTS `max-age=63072000; includeSubDomains; preload`.
- CSP: strict `default-src 'self'`; explicit allowlists for Cloudflare Analytics, Resend, Cloudflare R2, Turnstile, YouTube (gallery video). Use nonces for inline scripts/styles required by Next.js. No `unsafe-inline` in production CSS.
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (admin: SAMEORIGIN), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` locked down (no camera/mic/geolocation).
- CORS: deny by default. Public API is same-origin.

### Rate limiting (Upstash)
- `/api/contact`: 5/hour/IP (configurable in ContactConfig).
- `/api/register`: 3/hour/IP.
- `/admin` login: 10/hour/IP.
- Password reset: 3/hour/email + 5/hour/IP.

### Bot defense
- Honeypot field on both forms (default name `website`, configurable).
- Time-trap: reject if completed in < 2 seconds.
- Cloudflare Turnstile (toggle in ContactConfig). Server-side verification.

### Secrets & config
- Zero secrets in code. `src/env.ts` uses zod; app refuses to boot if any required env is missing or malformed.
- `.env.example` documents every variable with a comment.
- Production secrets via Vercel + Neon's secret management.

### Logging & monitoring
- Structured JSON via `pino`. Redact passwords, tokens, cookies. Hash IPs (SHA-256, salted) before storage or logging — never store raw IPs.
- Sentry for unhandled exceptions, PII scrubbing on.
- Audit log collection captures: login success/fail, password change, 2FA enroll/disable, role change, user create/delete, collection record delete, settings change.

### Database
- Connections via TLS only.
- Least-privilege DB user — no superuser in production.
- Daily automated Neon backups (free tier includes point-in-time within 7 days).

### Dependency hygiene
- `pnpm audit --prod` clean at build time (CI gate).
- Renovate config committed.
- Lockfile committed. `pnpm install --frozen-lockfile` in CI.

### Pre-launch checks
- `pnpm audit`, `eslint-plugin-security`, `semgrep --config=auto` clean (or documented exceptions in `docs/SECURITY.md`).
- Lighthouse Best Practices ≥ 95.
- Manually attempt to access a coach-only endpoint as a `viewer` and verify denial.

---

## 9. Performance, accessibility, SEO

- **Core Web Vitals targets** (4G mobile profile): LCP < 2.0s, INP < 200ms, CLS < 0.05 on home + schedule. CI runs Lighthouse on PRs; fail below Perf 90 / A11y 100 / Best Practices 95 / SEO 100.
- **Images:** `next/image` only for content. Lazy by default, `priority` for hero. Width/height always set. Convert raster assets to WebP + AVIF.
- **Fonts:** Inter self-hosted via `next/font/google`, `display: swap`. Subset to Latin.
- **Bundle:** no single client JS chunk > 200KB gzipped. Audit with `@next/bundle-analyzer` in CI.
- **ISR:** pages, events, recaps, photos revalidated on Payload `afterChange` via `revalidatePath` / `revalidateTag`.
- **Accessibility:** WCAG 2.1 AA minimum. Keyboard-reachable interactive elements with visible focus rings (cyan). Form errors via `aria-describedby`. Color contrast ≥ 4.5:1 on body text — verify the cyan-on-navy combos pass.
- **SEO:** per-page metadata via Next.js Metadata API. JSON-LD for Organization, BreadcrumbList, Event (for `/schedule` and individual event detail pages if added), FAQPage (for `/contact` FAQ accordion). `sitemap.xml` and `robots.txt` generated from Payload. Open Graph + Twitter Card on every page using `SiteSettings.defaultOgImage` as fallback.

---

## 10. Build sequence (autonomous — work straight through)

Do these in order. Do **not** stop to ask for sign-off between steps. If a step has a genuine blocker (missing third-party account, ambiguous design), use §13's escalation rules.

1. **Scaffold.** `pnpm create next-app` (TS strict, App Router, Tailwind, ESLint). Add Payload 3.x with Postgres adapter mounted at `/admin` + `/api`. Configure Tailwind v4 with the design tokens from §4. Install all stack deps from §2. Set up Husky + lint-staged + Prettier + ESLint security plugin. Write `src/env.ts` with zod. Write `docker-compose.yml` with Postgres + Redis + MailHog. Wire Sentry (no-op in dev). Configure GitHub Actions: install → typecheck → lint → unit test → Lighthouse on PR → build. Set `.nvmrc`, `engines`, README with one-command bootstrap.

2. **Copy design assets.** Move `handoff/assets/images/*` → `public/images/`, `handoff/assets/logos/*` → `public/logos/`. Convert raster source images to WebP siblings (keep originals as fallbacks).

3. **Implement collections + globals + access control + hooks** per §5. Generate Payload migrations. Write the seed script: imports the EVENTS array from `schedule.html` into `Events`, creates default SiteSettings/ContactConfig/Header/Footer/Homepage globals, creates the first admin user from env vars (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`).

4. **Build shared components:** `SiteHeader`, `SiteFooter`, `PageBanner`, `Button`, `Calendar` (FullCalendar wrapper), `EventList`, `EventCard`, `RecapEntry`, `PhotoGrid`, `Lightbox`, `CtaStrip`, `Container`. Match the handoff design 1:1. Verify desktop + mobile.

5. **Build blocks** per §5.3.

6. **Port pages** per §6 — home, about, schedule, results, gallery, contact, register. Wire data to Payload Local API in RSCs. Add `loading.tsx` and `error.tsx`.

7. **Build API routes:** `POST /api/register`, `POST /api/contact`. Full security envelope (zod, honeypot, time-trap, Turnstile, rate limit). React Email templates for: registration confirmation (to parent), registration notification (to coaches), contact notification (to coaches), contact auto-reply (optional).

8. **Build ICS endpoint** `/events.ics` serving the full upcoming calendar.

9. **Build sitemap + robots + OG image generation** (`@vercel/og` for dynamic OGs on pages, with the lion logo + navy bg).

10. **Customize the Payload admin:** branding, calendar custom view for Events, dashboard custom view with the metrics from §7. Build the CSV export action on Registrations and ContactSubmissions list views.

11. **Security pass:** middleware (headers + redirects + rate-limit), audit log collection + hooks that write to it. Run `pnpm audit`, `semgrep`, ESLint security. Resolve findings.

12. **Tests:**
    - Vitest unit tests for: access matrix (collection × role × op), zod schemas, calendar helpers (`eventToICS`, recurrence if added), rate-limit logic, email composers.
    - Playwright e2e: login + 2FA flow, create event in admin and verify it appears on `/schedule`, submit contact form happy path + spam path (honeypot tripped), submit registration happy path + verify confirmation email received in MailHog, navigate header/footer links, mobile viewport sanity.
    - Visual regression: home, schedule, contact at desktop + mobile.
    - Coverage threshold: 70% lines on `src/lib`, `src/access`, `src/hooks`. CI fails below.

13. **Documentation** (write all five — coaches will use `ADMIN_GUIDE.md` daily):
    - `docs/ADMIN_GUIDE.md` — for coaches. Screenshots. How to: log in + enroll 2FA, add an event, write a recap, upload photos, manage registrations, edit homepage, invite another coach. Keep it < 2000 words, plain language.
    - `docs/DEVELOPER_GUIDE.md` — local setup (`pnpm bootstrap`), architecture, how to add a block, how to add a collection.
    - `docs/DEPLOYMENT.md` — step-by-step: provision Neon Postgres, Cloudflare R2 bucket + API token, Resend domain + DKIM/SPF/DMARC records, Upstash Redis, Turnstile site key, Vercel project, env vars, first deploy, run migrations + seed.
    - `docs/SECURITY.md` — threat model, role matrix, credential rotation, what to do if a token leaks.
    - `docs/RUNBOOK.md` — backup/restore, common incidents, log query examples, on-call checklist.

14. **Production-deploy preparation (do not execute the deploy autonomously — the user does this following docs).** Generate a single "Ready to Deploy" report printed to the transcript listing:
    - Every external service to provision (Neon, Cloudflare R2, Resend, Upstash, Turnstile, Sentry, Vercel) with the exact account/project names to create.
    - Every env var the user must set, with example values.
    - Every DNS record to add (Resend DKIM/SPF/DMARC for `dmcschools.org` — if they can't get DNS access, fallback is to use Resend's `onboarding@resend.dev` sender, documented).
    - The exact commands to run for first deploy.
    - A smoke-test checklist for the user to run after deployment.

15. **Final handoff:** print to the chat a single summary containing:
    - Local dev URL (the running `pnpm dev` instance) + admin URL (`http://localhost:3000/admin`) + seeded admin email.
    - Test/build status (all green with command output excerpts).
    - The full "Ready to Deploy" report from step 14.
    - List of TODOs for the coaches (verify social URLs, upload real coach photos, write first recap, mark a few photos as featured).

---

## 11. Performance / cost reality check

At normal club traffic this stack costs **$0/month** plus the domain (~$12/year). Specifically:
- Vercel free hobby plan (Next.js hosting). Note: the school should review Vercel's commercial-use clause; for a non-profit club website it's typically fine. If a question is ever raised, Cloudflare Pages is a drop-in alternative — but the build defaults to Vercel.
- Neon free tier: 0.5 GB storage, 191 compute hours/month.
- Cloudflare R2: 10 GB storage + free egress.
- Resend: 3,000 emails/month, 100/day.
- Upstash Redis: 10K commands/day.
- Cloudflare Turnstile + Web Analytics: unlimited free.
- Sentry: 5K errors/month free.

Document this in `DEPLOYMENT.md` so the school knows what they're signing up for and at what scale they'd need to upgrade.

---

## 12. Anti-patterns — do not do

- Do **not** change the visual design. Colors, type, spacing, component shapes are approved. The only design change is making the 941px fixed layout responsive below 768px.
- Do **not** invent copy. Use what's in the handoff. Where the handoff has placeholder bios/recaps, leave them as documented placeholders and list them in the final handoff TODOs — do not fabricate quotes or coach names.
- Do **not** disable TypeScript strict mode or use `any`. Solve the type.
- Do **not** ship `// TODO` or `console.log` in committed code.
- Do **not** roll custom auth, custom rate limiting, custom crypto, custom session handling. Use Payload + the listed libraries.
- Do **not** put secrets in `next.config.js`, client components, `NEXT_PUBLIC_*`, or commit history.
- Do **not** use `dangerouslySetInnerHTML` on user input. Ever.
- Do **not** mock or stub production paths. Mocks only in tests.
- Do **not** skip the access-control test matrix.
- Do **not** add features outside the brief. If something seems missing, log it as a follow-up in the final handoff — don't build it.

---

## 13. When to ask vs. proceed

This build runs autonomously inside `/goal`. **Default behavior: do not ask the user questions during the run.** When a decision is ambiguous, pick the conservative option, log it in `docs/DEVELOPER_GUIDE.md` under a "Build Decisions" section, and continue.

**Proceed without asking when:**
- The brief or the handoff files specify an answer.
- A best practice clearly applies and §12 doesn't forbid it.
- A library decision is within the stack of §2.
- A third-party credential isn't yet available — use docker-compose locally (Postgres, Redis, MailHog) and document the missing prod credentials in the "Ready to Deploy" report instead of blocking.

**Genuine blockers (rare — pause only if hit):**
- The handoff files are missing or unreadable.
- A breaking change has occurred in Payload/Next.js that makes the stack non-viable; report it and stop.

For everything else: document the assumption and move on.

---

## 14. Definition of done

The build is complete only when **all** of these are true:

- [ ] All 7 designed pages render at desktop + mobile, visually matching the handoff.
- [ ] Every §7 admin capability works end-to-end (verified by Playwright admin suite).
- [ ] Every §8 security control is implemented and verified.
- [ ] Every §9 perf/a11y/SEO threshold is met in Lighthouse CI on the built site.
- [ ] Calendar sync layers all working: `/events.ics` valid, `webcal://` subscribe modal, per-event multi-provider Add-to-Calendar buttons.
- [ ] Tests green (`pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e && pnpm build` all exit 0); coverage thresholds met.
- [ ] All 5 docs written and accurate.
- [ ] "Ready to Deploy" report printed (§10, step 14) — production deployment is queued for the user to execute via `docs/DEPLOYMENT.md`, not performed autonomously.
- [ ] Final handoff message printed (§10, step 15).
- [ ] Zero `console.log`, zero committed secrets, zero `@ts-ignore` without justification, zero `// TODO` in shipped code.

---

## Begin

Start by reading `./handoff/CLAUDE.md`, `./handoff/site.css`, and `./handoff/schedule.html` (specifically the `EVENTS` array and helper functions). Then scaffold per §10 step 1 and work through the sequence without pausing. Print progress as you complete each numbered step. At the end, deliver the final handoff message per §10 step 15.

**Operate autonomously.** Do not ask the user clarifying questions during the run. When a decision is ambiguous and §13 doesn't require an ask, pick the conservative option, document the choice in `docs/DEVELOPER_GUIDE.md` under a "Build Decisions" section, and continue.
