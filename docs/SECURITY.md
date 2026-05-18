# Security

## 1. Threat model

The Lions Wrestling site is a small-traffic K–12 school program site. The realistic threats:

1. **Form spam** (bots filling registration / contact forms) — wastes coach time, may include phishing or malicious links.
2. **Credential theft** of a coach admin account — defacement, data leak (registrations contain minor's info).
3. **Public site defacement** via a compromised admin or supply-chain attack on dependencies.
4. **Data exfiltration** of registration submissions (minors' names, DOB, parent phone/email).
5. **Compromise of an external service** (Resend, Cloudflare R2, Upstash, Vercel, Neon, Sentry).

Not in scope: high-value targeted attacks. The data is sensitive (minors) but not financial or governmental.

## 2. Controls

### Authentication

- Argon2id password hashing (Payload default).
- **2FA TOTP mandatory** for every admin user. Enrolled on first login. Recovery codes shown once.
- Account lockout: 5 failed login attempts → 15-minute lock per account.
- Sessions: HttpOnly + Secure + SameSite=Lax cookies. 8-hour idle / 12-hour absolute timeout. Rotated on login.
- Password reset: single-use token, 1-hour TTL, rate-limited per email (3/hour) and per IP (5/hour).
- Password policy: min 14 characters. Documented for coaches in `ADMIN_GUIDE.md`.

### Authorization

- Default-deny on every collection's `access` config.
- Roles: `admin`, `coach`, `viewer`.
- Field-level access on `Users.role` — only admins can change roles. A user cannot promote themselves.
- Registration and contact submission data is read-only for coaches: only `status` and `internalNotes` are mutable.
- `viewer` role cannot mutate any collection (enforced by access matrix; verified by `tests/unit/access.test.ts`).

### Input handling

- **All form input validated server-side with zod.** Client-side validation is for UX only.
- **Honeypot** field on both forms (`website`). If filled, the server responds 200 but does nothing — keeps spammers from learning the rule.
- **Time-trap** on both forms. Submissions completed in <2 seconds are rejected as bot activity.
- **Cloudflare Turnstile** for the contact form (toggle in `/admin → Contact Config`). Cookieless, GDPR-friendly.
- **Rich text** rendered through Payload's Lexical-to-React serializer. **Never** `dangerouslySetInnerHTML` on user content.
- **Media uploads** restricted by MIME allowlist (jpg/png/webp/avif/svg/pdf). SVGs should be sanitized via DOMPurify before being trusted in markup — required `alt` text on every Media record.

### Transport & headers

Set in `src/middleware.ts`:

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (production only).
- `Content-Security-Policy`: strict `default-src 'self'` with explicit allowlist for Cloudflare Analytics, Cloudflare R2, Turnstile, Resend, YouTube no-cookie. Inline scripts/styles allowed only where Next.js/Payload need them.
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY` for the public site; `SAMEORIGIN` for `/admin`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy`: camera/microphone/geolocation/USB/payment all denied.
- CORS: same-origin only.

### Rate limiting (Upstash, with in-memory fallback)

- `/api/contact`: 5 requests/hour/IP (configurable in admin).
- `/api/register`: 3 requests/hour/IP.
- `/admin/login`: 10 requests/hour/IP.

### Secrets

- Zero secrets in code or repo. `src/env.ts` uses zod and refuses to boot if a required var is missing.
- `.env` is gitignored. `.env.example` documents every variable.
- Production secrets live in Vercel + Neon project settings.

### Logging

- Structured JSON via `pino` (server-side). Passwords, tokens, and cookies are redacted.
- IPs are SHA-256 hashed with a per-environment salt (`IP_HASH_SALT`) before storage or logging. **Raw IPs are never stored.**
- Sentry captures unhandled exceptions with PII scrubbing on.

### Database

- TLS-only connections (`?sslmode=require` on Neon).
- Least-privilege DB user (`lwc_app`) — not the owner role.
- Neon free tier includes 7-day point-in-time restore.

### Dependency hygiene

- `pnpm audit --prod` runs in CI; build fails on high-severity findings.
- Lockfile committed; `pnpm install --frozen-lockfile` in CI.
- Renovate config can be added later for automated patch PRs.

## 3. Role matrix

| Action | admin | coach | viewer |
|---|---|---|---|
| Login | ✅ | ✅ | ✅ |
| Create / edit / delete events, recaps, photos, albums, coaches | ✅ | ✅ | ❌ |
| Create / edit / delete pages | ✅ | ✅ | ❌ |
| View registrations | ✅ | ✅ | ❌ |
| Edit registration status + notes | ✅ | ✅ | ❌ |
| Edit submitted registration data | ✅ | ❌ | ❌ |
| Delete registrations | ✅ | ❌ | ❌ |
| Manage redirects | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Edit Site Settings, Contact Config | ✅ | ❌ | ❌ |
| Read Audit Log | ✅ | ❌ | ❌ |
| View public site | ✅ | ✅ | ✅ |

## 4. Credential rotation

| Secret | Rotate every | How |
|---|---|---|
| `PAYLOAD_SECRET` | 12 months or on suspicion of compromise | `openssl rand -hex 32` → Vercel env var → redeploy. Invalidates active sessions and TOTP secrets. |
| `DATABASE_URL` | If exposed | Rotate password in Neon → update Vercel env var → redeploy. |
| `RESEND_API_KEY` | 12 months | Resend dashboard → revoke + reissue → update env var. |
| `UPSTASH_REDIS_REST_TOKEN` | If exposed | Upstash dashboard → regenerate → update env var. |
| `TURNSTILE_SECRET_KEY` | If exposed | Cloudflare dashboard → regenerate. |
| `S3_*` | If exposed | Cloudflare R2 → revoke API token → reissue. |
| Coach passwords | User-initiated | Password reset email flow. |

## 5. Incident response

### A coach account is compromised

1. Admin: open `/admin → Users → [coach]` → uncheck **Active**. Save. They're logged out immediately.
2. Audit Log: scan recent entries from that user for unauthorized changes.
3. If data was viewed/exported: notify affected families (registrations contain minor info).
4. Rotate `PAYLOAD_SECRET` if the attacker may have stolen session cookies.
5. Re-enable the account after the coach resets their password and re-enrolls 2FA.

### A token leaked publicly (e.g. GitHub commit)

1. Rotate the token at the source (Resend / Upstash / Cloudflare / Neon) **immediately**.
2. Update the Vercel env var. Trigger a redeploy.
3. `git filter-repo` or `git push --force` the cleaned history (only acceptable while the leaked token is already invalidated).
4. Document in `docs/RUNBOOK.md`.

### A spam wave

1. Check rate limit logs. If a single IP hash is hitting the limit, the limiter is doing its job.
2. If distributed: enable Turnstile in `/admin → Contact Config` (toggle on).
3. If still bad: temporarily disable the contact form by setting `Contact Config → rate limit per hour = 0`.

### Database loss

1. Neon → Branches → restore from point-in-time snapshot (within last 7 days on free tier).
2. Verify the seeded admin still exists; if not, re-run `pnpm seed`.

## 6. Pre-launch checklist

- [ ] `pnpm audit --prod` clean (or documented exception).
- [ ] `pnpm exec semgrep --config=auto src/` no high-severity findings.
- [ ] `pnpm lint --max-warnings 0` clean.
- [ ] No `console.log`, no `// TODO`, no `@ts-ignore` without justification in committed code.
- [ ] All env vars are set in Vercel and **not** in the repo.
- [ ] HSTS verified on production (`curl -I https://lionswrestling.dmcschools.org`).
- [ ] CSP doesn't break the public site (DevTools → Console for violations).
- [ ] Admin requires 2FA enrollment on first login.
- [ ] A `viewer` role cannot mutate any collection (verified by unit test + manual spot-check).
