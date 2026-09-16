# Phase 5 Guide — Hardening, Tests & Ops

Everything in this phase is already wired into the codebase. This guide explains what protects you and how to run/extend it.

## 1. Automated tests

### Backend (API integration)
```bash
cd backend
npm install        # installs mongodb-memory-server (dev dependency)
npm test           # node:test suite against an in-memory MongoDB
```
The suite (`backend/tests/api.test.js`) covers: auth (register/login/session), starter folders, nested folders + uniqueness, note CRUD + autosave, pin/favorite/duplicate, list filters, search + suggestions, tags, bulk actions, version history + restore, trash/restore/permanent delete, folder delete-with-move, dashboard stats, profile + email uniqueness, password change, account cascade delete, and auth guards.

### Frontend (unit)
```bash
cd client
npm install
npm test           # vitest: utils, date helpers, templates
npm run build      # production build check
```

### CI on GitHub Actions
`.github/workflows/ci.yml` runs on every push/PR: backend `npm ci && npm test`, client `npm ci && npm test && npm run build`. Green tick = safe to merge. First run downloads the in-memory MongoDB binary (~1 min).

## 2. Security measures active in production

- **helmet** security headers + `x-powered-by` disabled
- **Global rate limit**: 300 requests / 5 min per IP on `/api`, plus stricter limits on login/register/forgot-password/mail/upload
- **httpOnly + Secure + SameSite=None cookies** in production, JWT expiry 7 days, bcrypt password hashing
- **Stored-HTML sanitization**: script tags, inline `on*` handlers and `javascript:` URLs are stripped from `contentHtml` on every save (defense in depth; rendering already goes through TipTap, never `dangerouslySetInnerHTML`)
- **CORS allow-list**: your `CLIENT_URL`/`CORS_ORIGINS` (+ `*.vercel.app` during previews); credentials enabled
- **Upload guards**: image MIME whitelist, 8 MB cap
- **Vercel security headers**: nosniff, frame DENY, referrer policy, permissions policy (`client/vercel.json`)
- **Validation** on every write endpoint (express-validator style rules in `middleware/validator.js`)

Run an audit any time:
```bash
cd backend && npm audit
cd ../client && npm audit
```
Fix what npm can: `npm audit fix` (avoid `--force` unless a changelog says it is safe).

## 3. Performance measures active

- **Route-level code splitting**: editor, create, view, search and profile pages load as separate chunks (`React.lazy`), so first paint stays small
- **Lazy images** in note content (`loading="lazy"`)
- **Pagination** on note lists and search (`limit`/`page`)
- **DB indexes**: user+trash+updated, user+pinned+updated, user+folder+trash, text index for search, TTL index for auto-delete, unique (user,parent,name) folders and (user,name) tags

## 4. Error visibility

- Client **ErrorBoundary**: any runtime crash shows a friendly recovery card instead of a blank page
- Backend logs every 5xx with request path (`middleware/errorHandler.js`); Render keeps these logs
- For deeper tracking later: create a free Sentry project and add `@sentry/react` (client) + `@sentry/node` (backend) with your DSN - 15 minutes, optional

## 5. Backup & restore runbook (Atlas)

Free (M0) clusters have no automatic backups - take manual snapshots before risky changes:

**Backup (export your data)**
```bash
mongodump --uri "YOUR_MONGO_URI" --db notes-heaven --out ./backup-$(date +%F)
```
**Restore**
```bash
mongorestore --uri "YOUR_MONGO_URI" --db notes-heaven ./backup-YYYY-MM-DD/notes-heaven
```
(Install MongoDB Database Tools once: https://www.mongodb.com/try/download/database-tools)

Cadence suggestion: manual dump weekly + before every deployment that touches models. On a paid Atlas tier, enable **Cloud Backups** (continuous, point-in-time).

## 6. Ops checklist (monthly, 10 minutes)

1. `npm audit` both packages; apply safe fixes; push; watch CI.
2. Render logs: scan for repeated 4xx/5xx patterns.
3. Atlas: check storage (M0 = 512 MB) and connection count.
4. Take a `mongodump` snapshot; verify the folder size is > 0.
5. Test the production flow once: register (temp email) → note with image → trash → restore → export PDF.
