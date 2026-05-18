# Runbook

Operational reference for incidents, common ops, and on-call. For initial setup, see `DEPLOYMENT.md`. For security incidents specifically, see `SECURITY.md` §5.

---

## 1. Daily / weekly checks

| Frequency | What | Where |
|---|---|---|
| Daily | Sentry error count | https://sentry.io project dashboard |
| Daily | New form submissions | `/admin → Submissions` |
| Weekly | Lighthouse audit on `/` and `/schedule` | Chrome DevTools → Lighthouse |
| Weekly | `pnpm audit --prod` | local checkout |
| Monthly | Rotate any soon-to-expire third-party tokens | Resend / Upstash / etc. |
| Monthly | Review Audit Log for unusual activity | `/admin → Audit Log` |

---

## 2. Common ops

### Run a one-off migration

```bash
DATABASE_URL='<prod-url>' PAYLOAD_SECRET='<secret>' pnpm migrate
```

If migrations conflict (e.g. schema drift), `payload migrate:status` first.

### Run a one-off seed

```bash
DATABASE_URL='<prod-url>' \
  PAYLOAD_SECRET='<secret>' \
  SEED_ADMIN_EMAIL='admin@dmcschools.org' \
  SEED_ADMIN_PASSWORD='<strong>' \
  pnpm seed
```

The seed is idempotent — it only inserts records that don't already exist.

### Force a public-site revalidation

The collection hooks call `revalidatePath` automatically. To manually force:

```bash
curl -X POST 'https://lionswrestling.dmcschools.org/api/revalidate?path=/'
```

(Add this endpoint if you need manual control. Today, revalidation happens on every `afterChange`.)

### Tail production logs

Vercel → Project → Logs → set environment to Production. Filter by route or status code.

### Reset a coach's 2FA

Admin only. `/admin → Users → [coach]` → uncheck `2FA enrolled` → save. They'll re-enroll on next login. If they've also lost their password, send a password reset link from the same page.

### Add a new admin user

`/admin → Admin → Users → Create new`. Fill name, email, role = admin. Save. They'll get an email (if Resend is configured) with a link to set their password and enroll 2FA.

---

## 3. Backups

### Database

Neon free tier: 7-day point-in-time restore. To restore:

1. Neon dashboard → project → Branches → "Create branch from PITR" → pick the timestamp.
2. Update `DATABASE_URL` in Vercel to point to the new branch.
3. Redeploy.

### Media

Cloudflare R2 doesn't auto-version; we don't have an automated media backup. For now, the source images live in `handoff/assets/` in this repo (gitted). Add a quarterly manual export job if media volume grows.

### Code

GitHub: https://github.com/perlantir/lwc — clone is the source of truth. Tag every prod deploy: `git tag prod-2026-05-18 && git push --tags`.

---

## 4. Incidents

### Site is down (5xx on every page)

1. Check Vercel deployment status → was there a recent deploy that broke?
   - **Yes**: redeploy the previous green commit (Vercel → Deployments → "Promote to Production").
2. Check Neon status: https://status.neon.tech
3. Check Vercel status: https://www.vercel-status.com
4. If Neon is down: maintenance mode is your friend — but you can't enable it via admin if admin is down. Add a manual redirect at the Vercel level to a static maintenance page if needed.
5. Page the on-call dev.

### Admin is locked out (everyone)

1. SSH-equivalent: locally with prod env, run `pnpm seed` — it's idempotent and will not overwrite an existing admin, so this alone won't help.
2. To reset: connect to Neon SQL editor, run:
   ```sql
   UPDATE users SET locked_until = NULL, login_attempts = 0 WHERE email = 'admin@dmcschools.org';
   ```
3. If 2FA is the issue, reset via:
   ```sql
   UPDATE users SET totp_enrolled = false, totp_secret = NULL WHERE email = 'admin@dmcschools.org';
   ```
4. The admin can log in with just their password, then re-enroll 2FA.

### Forms aren't sending emails

1. Check `/admin → Audit Log` for errors.
2. Resend dashboard → recent activity. Are emails being attempted?
3. If "Suspended for unverified domain": redo DNS verification (`DEPLOYMENT.md` §3).
4. Fallback: edit `Contact Config` → recipient emails → forward to a different address.

### A spammer is filling the contact form

1. `/admin → Site Config → Contact Config` → toggle `Turnstile enabled` ON. Save.
2. Optionally drop `rateLimitPerHour` from 5 to 2.
3. Sentry should already be quiet — these submissions are rejected at validation, not crashed.

### A photo upload caused a crash

1. Open Sentry, find the trace.
2. Inspect the file: was it >10MB, wrong MIME, or corrupt?
3. Delete the half-uploaded record via `/admin → Gallery → Photos → [bad row] → Delete`.
4. Re-upload after the user converts the file.

---

## 5. Log queries (Sentry / Vercel)

| Question | Where | Query |
|---|---|---|
| "Show me 500s in the last hour" | Vercel Logs | `status:500` |
| "Show me failed form submissions" | Vercel Logs | `path:/api/contact AND status>=400` |
| "Was a specific IP rate-limited?" | Vercel Logs | grep the salted IP hash — raw IPs are never logged |
| "Find unhandled exceptions" | Sentry | default project view |
| "Who created/deleted a record at time T?" | Admin → Audit Log | filter by date range and user |

---

## 6. On-call checklist (when handing off)

- [ ] You can log into Vercel + Neon + Sentry + Resend.
- [ ] You have the `PAYLOAD_SECRET` and `DATABASE_URL` in your password manager.
- [ ] You know how to enable maintenance mode (`/admin → Site Settings → Maintenance Mode`).
- [ ] You have a phone number for at least one head coach.
- [ ] You know how to reset a coach's 2FA via Neon SQL.

---

## 7. Useful commands

```bash
# Quick local smoke test
pnpm typecheck && pnpm lint && pnpm test && pnpm build

# Drop and recreate local DB
docker compose down -v && docker compose up -d
pnpm migrate && pnpm seed

# Check what's running in the admin
curl -I http://localhost:3000/admin

# Validate the ICS feed
curl -s http://localhost:3000/events.ics | head -30

# Hit the contact form locally (replace startedAt with Date.now()-5000)
curl -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"Sam","lastName":"Smith","email":"sam@example.com","message":"hi there","startedAt":1700000000000,"website":""}'
```
