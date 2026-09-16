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
Planned work: see [`docs/ROADMAP.md`](docs/ROADMAP.md).

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

