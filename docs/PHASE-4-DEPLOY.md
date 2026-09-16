# Phase 4 Guide — Deploy to Render + Vercel + Atlas

Goal: your app live at `https://notes-heaven-xxxx.vercel.app` with the API at `https://notes-heaven-api.onrender.com`, both talking to MongoDB Atlas.

There is one chicken-and-egg: Render needs the Vercel URL (for CORS/cookies) and Vercel needs the Render URL (for API calls). We deploy Render first with a placeholder, then Vercel, then paste the Vercel URL back into Render. Total ~25 minutes.

---

## Step 0 — Push everything to GitHub

Make sure your latest code (all phases) is pushed to `main`. Both Render and Vercel build from GitHub.

---

## Step 1 — MongoDB Atlas production check

1. Atlas → *Database Access*: your `notesadmin` user is fine for production on the free tier.
2. *Network Access*: keep `0.0.0.0/0` (Render's outgoing IPs change). If you ever move to a paid cluster, restrict this.
3. Copy your connection string again (you'll paste it into Render next).

---

## Step 2 — Backend on Render

1. render.com → **New → Web Service** → connect your GitHub account → pick `Notes-Heaven`.
2. Settings:
   - **Name**: `notes-heaven-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance**: Free
3. Environment variables:
   | Key | Value |
   | --- | --- |
   | `MONGO_URI` | your Atlas connection string (with `/notes-heaven` db name) |
   | `JWT_SECRET` | a new long random string (same command as Phase 1) |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | `http://localhost:5173` (placeholder — replaced in Step 4) |
   | `CORS_ORIGINS` | `http://localhost:5173` (placeholder — replaced in Step 4) |
   | `TRASH_RETENTION_DAYS` | `5` |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional now, can add later |
   | `CLOUDINARY_*` | recommended now so images work in production |
   | `SMTP_*` | optional |
4. **Create Web Service** → wait for deploy → open `https://notes-heaven-api.onrender.com/api/health` → should return `"success": true`.
   (First request on the free instance can take ~30s to wake up.)
5. **Copy the Render URL** — you need it in Step 3.

---

## Step 3 — Frontend on Vercel

1. vercel.com → **Add New... → Project** → import the same GitHub repo.
2. Configure:
   - **Root Directory**: `client` (click Edit)
   - Framework preset: **Vite** (auto-detected)
   - Build command: `npm run build` · Output: `dist` (defaults are correct)
3. Environment variables (add one):
   | Key | Value |
   | --- | --- |
   | `VITE_API_URL` | `https://notes-heaven-api.onrender.com` (your Render URL, no trailing slash) |
4. **Deploy** → wait → you get `https://notes-heaven-xxxx.vercel.app`.
5. Open it → the landing page loads from Vercel, login/register hits Render. Register a fresh account and create a note — it persists in Atlas.
6. **Copy the Vercel URL** — needed in Step 4.
   (`client/vercel.json` already handles SPA routing, so `/dashboard` etc. work on refresh.)

---

## Step 4 — Connect the two (final wiring)

Back in **Render → your service → Environment**:
- `CLIENT_URL` = `https://notes-heaven-xxxx.vercel.app`
- `CORS_ORIGINS` = `https://notes-heaven-xxxx.vercel.app`

Save → Render redeploys automatically. Now cookies (SameSite=None, Secure) and OAuth redirects work cross-domain.

If you use **Google login in production**: Google Cloud Console → Credentials → your OAuth client → *Authorized redirect URIs* → add:
```
https://notes-heaven-api.onrender.com/api/auth/google/callback
```

If you use **SMTP**: nothing extra — reset links are built from `CLIENT_URL`, so mails now point at your Vercel domain.

---

## Step 5 — Production test checklist

1. `https://<vercel>/` loads; register a new account → welcome mail (if SMTP set).
2. Create note with code block + image (Cloudinary) → save → reload → content intact.
3. Log out → log in on a **phone** (different network) → note is there (Atlas persistence).
4. Forgot password → mail link opens `https://<vercel>/reset-password/...` → reset works.
5. Google login (if configured) → redirects back to the app, logged in.
6. Trash a note → Trash page shows the days-left badge.
7. Hard refresh on `/notes` or `/trash` → no 404 (SPA rewrite works).

---

## Step 6 — Custom domain (optional)

1. Buy/own a domain → Vercel project → **Settings → Domains** → add `notesheaven.yourdomain.com` → set the DNS records Vercel shows (usually a CNAME to `cname.vercel-dns.com`).
2. Render: `CLIENT_URL` and `CORS_ORIGINS` = `https://notesheaven.yourdomain.com`; add the same origin to Google OAuth redirect URIs if used.
3. Redeploy/restart Render. HTTPS is automatic on both platforms.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Render logs: `MONGO_URI missing` | env var not saved on Render (`.env` files are NOT uploaded) |
| Vercel page loads but API calls fail with CORS | Step 4 not done — Render's `CORS_ORIGINS` must equal the Vercel URL exactly (https, no slash) |
| Login works but reload logs you out on Vercel | Cookies are cross-site: needs `CLIENT_URL` set (cookies already use SameSite=None + Secure in production); Bearer-token backup also covers this |
| Render health URL 502/503 after idle | Free instance sleeps; first hit wakes it (~30s). Paid instance removes this |
| 404 on refresh of /dashboard | `client/vercel.json` missing — make sure it was pushed to GitHub |
