# Notes Heaven

A clean, fast note-management web app for students and lifelong learners. Create rich-text notes with formatted code blocks and images, organize them into nested folders, tag them, search them instantly, and never lose anything — autosave, pin, favorites, a 5-day trash and one-click PDF export are built in.

## Features

- **Rich text editor** — headings, lists, task lists, quotes, links, inline code and syntax-highlighted code blocks
- **Image insertion** — drag-and-drop or paste screenshots; images are uploaded to cloud storage
- **Nested folders** — unlimited depth (`Class 12 → Physics → Optics`), with breadcrumbs and per-folder note counts
- **Tags & filtering** — color-coded tags, filter by folder / tag / favorite / pinned, sort by recency or title
- **Instant search** — searches titles, content, tags and folder names, with live suggestions and advanced filters
- **Autosave** — debounced background saving with a visible save-status indicator
- **Pin & favorites** — keep important notes on top
- **Trash with 5-day safety** — deleted notes are recoverable for 5 days, then permanently removed (manual restore / permanent delete available at any time)
- **Export** — any note (or all notes) to PDF or Markdown
- **Authentication** — email + password (JWT in an httpOnly cookie), Google OAuth, and a forgot-password email flow
- **Profile & account** — avatar upload, name/email editing, password change and account deletion with cascade cleanup
- **Dark mode** — OS-preference aware with a manual toggle, light design untouched
- **Keyboard shortcuts** — Ctrl+K search, Ctrl+S save, Ctrl+/ help, editor formatting keys
- **Version history UI** — every manual save keeps a restoreable snapshot
- **Bulk actions** — select notes to move, tag, pin, favorite or trash in one go
- **Templates** — lecture notes, meeting notes and revision sheets pre-fill the editor
- **Fully responsive** — the same experience on mobile, tablet and desktop

## Tech Stack

| Layer    | Technology                                              |
| -------- | ------------------------------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS, TipTap editor, React Router |
| Backend  | Node.js, Express, Mongoose                              |
| Database | MongoDB (Atlas)                                          |
| Auth     | JWT (httpOnly cookie) + Google OAuth (Passport)          |
| Images   | Cloudinary                                               |
| Mail     | Nodemailer (SMTP)                                        |

## Repository Layout

```
notes-heaven/
├── backend/          # Express REST API (src/: controllers, models, routes, middleware, services)
├── client/           # React + Vite frontend (src/: pages, components, context, hooks, lib)
└── docs/             # Setup guide (PHASE-1-SETUP.md) and project roadmap (ROADMAP.md)
```

## Quick Start

Prerequisites: Node.js 18+, a MongoDB Atlas cluster (free tier is fine).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then fill in MONGO_URI, JWT_SECRET, CLIENT_URL (see .env.example comments)
npm run seed                # optional demo data (demo@notesheaven.app / demo1234)
npm run dev                 # http://localhost:5000/api/health
```

### 2. Frontend

```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

No backend handy? Run the UI in demo mode (in-memory data, no database needed):

```bash
cd client
npm run dev:demo
```

Step-by-step Atlas setup, environment variables and a full test checklist: see [`docs/PHASE-1-SETUP.md`](docs/PHASE-1-SETUP.md).
Production deployment (Render + Vercel + Atlas): see [`docs/PHASE-4-DEPLOY.md`](docs/PHASE-4-DEPLOY.md).
Planned work: see [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Tests & CI

```bash
cd backend && npm test    # API integration suite (in-memory MongoDB)
cd client  && npm test    # unit tests (vitest)
```

GitHub Actions (`.github/workflows/ci.yml`) runs both suites plus a production build on every push and pull request.

## API Overview

All endpoints are prefixed with `/api`.

- `GET /api/health` — liveness probe
- `POST /api/auth/register` · `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me`
- `POST /api/auth/forgot-password` · `GET /api/auth/verify-reset-token/:token` · `PUT /api/auth/reset-password/:token`
- `GET /api/auth/google` — Google OAuth (enabled when credentials are configured)
- `GET|POST /api/notes` · `GET|PUT|DELETE /api/notes/:id`
- `PATCH /api/notes/:id/autosave` · `PATCH /api/notes/:id/restore` · `DELETE /api/notes/:id/permanent`
- `POST /api/notes/:id/duplicate` · `PUT /api/notes/:id/pin` · `PUT /api/notes/:id/favorite`
- `GET /api/notes/trash` · `DELETE /api/notes/trash/empty` · `GET /api/notes/:id/versions`
- `GET /api/notes/stats/dashboard` · `GET /api/notes/export/markdown`
- `GET|POST /api/folders` · `PUT|DELETE /api/folders/:id`
- `GET|POST /api/tags` · `PUT|DELETE /api/tags/:id`
- `GET /api/search?q=` · `GET /api/search/suggestions?q=`
- `POST /api/uploads/image` · `DELETE /api/uploads/image`

## API & Route Verification (production)

Every screenshot below was captured against the **live production deployment**
(frontend `https://notes-heaven.vercel.app`, API `https://notes-heaven-api.onrender.com`).
API screenshots show the real HTTP method, URL, status code and response body returned by the server.

### Backend API endpoints

| # | Method | Endpoint | Purpose | Status | Screenshot |
|---|--------|----------|---------|--------|------------|
| 1 | `GET` | `/api/health` | Service health check | 200 | [view](docs/screenshots/api/01-health.png) |
| 2 | `GET` | `/api/auth/providers` | Enabled auth providers (local / Google / uploads) | 200 | [view](docs/screenshots/api/02-auth-providers.png) |
| 3 | `POST` | `/api/auth/register` | Email + password sign-up (JWT issued) | 201 | [view](docs/screenshots/api/03-auth-register.png) |
| 4 | `POST` | `/api/auth/login` | Login (httpOnly JWT cookie + token) | 200 | [view](docs/screenshots/api/04-auth-login.png) |
| 5 | `GET` | `/api/auth/me` | Current session user | 200 | [view](docs/screenshots/api/05-auth-me.png) |
| 6 | `PUT` | `/api/auth/profile` | Update name / email / avatar | 200 | [view](docs/screenshots/api/06-auth-profile.png) |
| 7 | `POST` | `/api/notes` | Create note with rich text, tags | 201 | [view](docs/screenshots/api/07-notes-create.png) |
| 8 | `GET` | `/api/notes` | List notes (pagination, filters) | 200 | [view](docs/screenshots/api/08-notes-list.png) |
| 9 | `GET` | `/api/notes/:id` | Fetch a single note | 200 | [view](docs/screenshots/api/09-notes-get.png) |
| 10 | `PUT` | `/api/notes/:id` | Update note content / meta | 200 | [view](docs/screenshots/api/10-notes-update.png) |
| 11 | `PATCH` | `/api/notes/:id/autosave` | Debounced autosave payload | 200 | [view](docs/screenshots/api/11-notes-autosave.png) |
| 12 | `PATCH` | `/api/notes/:id/pin` | Pin / unpin note | 200 | [view](docs/screenshots/api/12-notes-pin.png) |
| 13 | `PATCH` | `/api/notes/:id/favorite` | Favorite / unfavorite note | 200 | [view](docs/screenshots/api/13-notes-favorite.png) |
| 14 | `GET` | `/api/notes/:id/versions` | Version history snapshots | 200 | [view](docs/screenshots/api/14-notes-versions.png) |
| 15 | `POST` | `/api/folders` | Create folder | 201 | [view](docs/screenshots/api/15-folders-create.png) |
| 16 | `POST` | `/api/folders (parent)` | Create nested sub-folder | 201 | [view](docs/screenshots/api/16-folders-nested.png) |
| 17 | `GET` | `/api/folders` | Folder tree + per-folder counts | 200 | [view](docs/screenshots/api/17-folders-list.png) |
| 18 | `GET` | `/api/folders/:id` | Fetch one folder + breadcrumbs | 200 | [view](docs/screenshots/api/18-folders-get.png) |
| 19 | `PUT` | `/api/folders/:id` | Rename / recolor / re-parent folder | 200 | [view](docs/screenshots/api/19-folders-update.png) |
| 20 | `GET` | `/api/tags` | All tags with colors | 200 | [view](docs/screenshots/api/20-tags-list.png) |
| 21 | `GET` | `/api/search?q=` | Full-text search across notes | 200 | [view](docs/screenshots/api/21-search.png) |
| 22 | `GET` | `/api/search/suggestions?q=` | Live type-ahead suggestions | 200 | [view](docs/screenshots/api/22-search-suggestions.png) |
| 23 | `POST` | `/api/uploads/image` | Image upload to Cloudinary | 200 | [view](docs/screenshots/api/23-upload-image.png) |
| 24 | `GET` | `/api/notes/stats/dashboard` | Dashboard statistics | 200 | [view](docs/screenshots/api/24-notes-stats.png) |
| 25 | `DELETE` | `/api/notes/:id` | Move note to trash (5-day safety) | 200 | [view](docs/screenshots/api/25-notes-trash.png) |
| 26 | `GET` | `/api/notes/trash` | List trashed notes | 200 | [view](docs/screenshots/api/26-notes-trash-list.png) |
| 27 | `PATCH` | `/api/notes/:id/restore` | Restore note from trash | 200 | [view](docs/screenshots/api/27-notes-restore.png) |
| 28 | `DELETE` | `/api/auth/account` | Delete account + cascade cleanup | 200 | [view](docs/screenshots/api/28-auth-delete-account.png) |

### Frontend routes

| # | Route | Page | Screenshot |
|---|-------|------|------------|
| 1 | `/` | Public landing page | [view](docs/screenshots/routes/01-landing.png) |
| 2 | `/login` | Login (email + Google) | [view](docs/screenshots/routes/02-login.png) |
| 3 | `/signup` | Sign-up with password strength meter | [view](docs/screenshots/routes/03-signup.png) |
| 4 | `/forgot-password` | Forgot-password email flow | [view](docs/screenshots/routes/04-forgot-password.png) |
| 5 | `/dashboard` | Stats, recents, persistence | [view](docs/screenshots/routes/05-dashboard.png) |
| 6 | `/notes` | Notes table, bulk select, filters | [view](docs/screenshots/routes/06-all-notes.png) |
| 7 | `/notes/new` | Create note + templates | [view](docs/screenshots/routes/07-create-note.png) |
| 8 | `/notes/:id` | Read-only view with timestamps | [view](docs/screenshots/routes/08-note-view.png) |
| 9 | `/notes/:id/edit` | Editor with autosave indicator | [view](docs/screenshots/routes/09-note-edit.png) |
| 10 | `/folders` | Folder grid + tree | [view](docs/screenshots/routes/10-folders.png) |
| 11 | `/folders/:id` | Nested folder + breadcrumbs | [view](docs/screenshots/routes/11-folder-detail.png) |
| 12 | `/search?q=` | Search results page | [view](docs/screenshots/routes/12-search-results.png) |
| 13 | `/trash` | Trash with restore / permanent delete | [view](docs/screenshots/routes/13-trash.png) |
| 14 | `/profile` | Profile, password, danger zone | [view](docs/screenshots/routes/14-profile.png) |
| 15 | `* (unknown)` | 404 page | [view](docs/screenshots/routes/15-not-found.png) |
## License

Private project — all rights reserved.
