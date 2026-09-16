# Phase 1 Setup Guide

Follow these steps in order. Every command is meant to be run from the folder mentioned above it.

---

## Step 1 — Install the project

Extract the zip (or clone the repo), then install dependencies:

```bash
cd backend
npm install

cd ../client
npm install
```

---

## Step 2 — MongoDB Atlas (one-time, ~5 minutes)

1. **Create a free cluster** — atlas.mongodb.com → *Build a Database* → **M0 Free** → pick a region close to you (e.g. Mumbai) → name it `NotesHeaven`.
2. **Create a database user** — sidebar → *Database & Network Access* → *Database Users* → **Add New Database User** → username `notesadmin` → *Autogenerate Secure Password* → **copy the password into a notepad** → privileges: *Read and write to any database* → **Add Database User**.
3. **Allow network access** — same page → *Network Access / IP Access List* tab → **+ Add IP Address** → type `0.0.0.0/0` in *Access List Entry* (keep the "temporary" toggle OFF) → **Confirm**.
4. **Copy the connection string** — *Project Overview* → cluster card → **Connect** → **Drivers**.
   - If `mongodb+srv://...` fails to connect on your network, switch the **SRV Connection String** toggle OFF and copy the standard `mongodb://...` string instead.
   - Replace `<db_username>` with `notesadmin` and `<db_password>` with your saved password.
   - If your password contains `@ : / # ?` characters, URL-encode them (`@` → `%40`, `:` → `%3A`, `/` → `%2F`).
   - Add the database name before the `?`: `...mongodb.net/notes-heaven?appName=NotesHeaven`

Result (example):

```
mongodb+srv://notesadmin:YOUR_PASSWORD@notesheaven.xxxxx.mongodb.net/notes-heaven?appName=NotesHeaven
```

---

## Step 3 — Backend environment file

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in at least:

```ini
MONGO_URI=mongodb+srv://notesadmin:YOUR_PASSWORD@notesheaven.xxxxx.mongodb.net/notes-heaven?appName=NotesHeaven
JWT_SECRET=<paste output of the command below>
CLIENT_URL=http://localhost:5173
```

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Optional (features degrade gracefully when missing): `GOOGLE_CLIENT_ID/SECRET` (Google login), `CLOUDINARY_*` (image upload), `SMTP_*` (real reset emails), `TRASH_RETENTION_DAYS=5`.

---

## Step 4 — Run the backend

```bash
cd backend
npm run seed     # optional: demo user + sample notes (demo@notesheaven.app / demo1234)
npm run dev      # http://localhost:5000/api/health should return success:true
```

Expected log: `MongoDB connected` + `Server running on http://localhost:5000`.

---

## Step 5 — Run the frontend

```bash
cd client
npm run dev      # open http://localhost:5173
```

Log in with the seeded demo account (`demo@notesheaven.app / demo1234`) or register a new account.

> No backend available? `npm run dev:demo` runs the UI with in-memory demo data.

---

## Step 6 — Test checklist

Tick these off in the running app:

1. Register a new account → starter folders appear on the dashboard
2. Create a note: title + folder + tags + rich text (heading, list, code block) → Save
3. Edit the note → autosave indicator shows "Saving…" then "Saved"
4. Insert an image (needs Cloudinary keys; without them a clear error toast appears)
5. Create a nested folder (`Class 12 → Physics`) and move a note into it
6. Pin a note and mark another as favorite → filters show them correctly
7. Search for a word from note content → result + snippet appears
8. Delete a note → it appears in Trash with a "5 days left" badge → Restore works
9. Permanent delete from Trash → note is gone for good
10. Export a note as PDF (print dialog) and as Markdown (download)
11. Log out → log back in → everything persisted
12. Resize the window / open on a phone → layout adapts (sidebar becomes a drawer)

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `MongoDB connection failed: querySrv ECONNREFUSED` | Your DNS blocks SRV lookups — use the standard (non-SRV) connection string, or set your DNS to `8.8.8.8` / `1.1.1.1` |
| `MongoDB connection failed (auth)` | Wrong password in `MONGO_URI`, or password characters not URL-encoded |
| `MongoDB connection failed (timeout)` | Network Access missing your IP — add `0.0.0.0/0` |
| Frontend shows "Cannot reach the backend" | Backend not running, or `VITE_API_URL` wrong; make sure `npm run dev` is up in `backend/` |
| Google button missing | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` not set in `backend/.env` |
| Reset email not received | Without `SMTP_*` keys the reset link is printed in the backend terminal and shown on-screen in dev mode |
| Port already in use | Change `PORT` in `backend/.env` and `CLIENT_URL` accordingly |

---

## Keeping your copy in sync (every phase)

Merge a new phase zip into your project folder without touching `node_modules` or your `.env`:

```bat
robocopy "C:\Downloads\notes-heaven" "C:\Projects\notes-heaven" /E /XD node_modules dist .git /XF .env /NFL /NDL /NJH /NJS
```

First push to GitHub:

```bat
git init
git branch -M main
git add .
git commit -m "Phase 1: MERN setup + backend APIs + frontend UI"
git remote add origin https://github.com/brajesh1210/Notes-Heaven.git
git push -u origin main
```

Later phases:

```bat
git add .
git commit -m "Phase 2: <short description>"
git push origin main
```
