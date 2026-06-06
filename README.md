# DMCS Lions Wrestling Club

Production website and admin panel for the **Des Moines Christian Lions Wrestling Club**.

- **Framework:** Next.js 15 (App Router) + TypeScript strict
- **CMS / Admin:** Payload CMS 3.x at `/admin`, REST/GraphQL at `/api/*`
- **Database:** PostgreSQL 16+ (Neon in production)
- **Styling:** Tailwind CSS + design tokens lifted from `handoff/site.css`
- **Email:** Resend (production) / MailHog (dev)
- **Media:** Cloudflare R2 (production) / local filesystem (dev)
- **Rate limit:** Upstash Redis (production) / in-memory (dev)
- **Hosting target:** Vercel + Neon

## Quick start (local dev)

Prereqs: Node 22+ (see `.nvmrc`), pnpm 9+, Docker.

```bash
# 1. Install dependencies
pnpm install

# 2. Bring up Postgres, Redis, MailHog
docker compose up -d

# 3. Copy env template; edit if needed
cp .env.example .env

# 4. Run dev server (Payload generates types + migrations on first boot)
pnpm dev
# → http://localhost:3000           (public site)
# → http://localhost:3000/admin     (admin panel)
# → http://localhost:8025           (MailHog inbox)
```

After the first dev boot, run the seed:

```bash
pnpm seed
```

This creates the first admin user (from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env`) and seeds the 27 events from the handoff.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Next.js dev server (Payload mounted at /admin) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint with `--max-warnings 0` |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright e2e suite |
| `pnpm seed` | Idempotent seed (admin + events + globals) |
| `pnpm generate:types` | Regenerate `payload-types.ts` |
| `pnpm migrate` | Run Payload migrations |

## Project layout

See `docs/DEVELOPER_GUIDE.md` for a full architecture tour.

## Docs

- `docs/ADMIN_GUIDE.md` — for coaches (how to add events, write recaps, upload photos, etc.)
- `docs/DEVELOPER_GUIDE.md` — local dev, architecture, build decisions
- `docs/DEPLOYMENT.md` — step-by-step Vercel + Neon + R2 + Resend setup
- `docs/SECURITY.md` — threat model, role matrix, incident response
- `docs/RUNBOOK.md` — backups, common incidents, on-call

## License

Internal project for Des Moines Christian Schools.
