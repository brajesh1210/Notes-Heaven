# 📖 Notes Heaven

> Your space to create, organize and never lose your notes.

MERN stack note management app — rich text + code blocks + images, nested folders, tags, instant search, autosave aur 5-day trash safety. UI exactly waisa hai jaisa design me tha (blue `#1D4ED8` primary, Inter font, sidebar layout).

```
notes-heaven/
├── backend/    → Node + Express + MongoDB REST API (JWT auth, Cloudinary, Nodemailer)
├── client/     → React 18 + Vite + TailwindCSS + TipTap editor
├── docs/       → phase-wise setup & deploy guide
└── README.md
```

## 🚦 Phase status

| Phase | Kya bana                                                                                                                                          | Status    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1     | Setup + Backend (auth, notes CRUD, folders, tags, search, uploads) + Frontend core (Landing, Login, Signup, Forgot/Reset, Dashboard, All Notes, Folders, Create Note, Note Editor, Note View, Search, Trash) | ✅ DONE   |
| 2     | Google OAuth + Cloudinary images live + reset-password mail + PDF export polish                                                                    | ⏳ next   |
| 3     | Profile page, dark mode, version history UI, keyboard shortcuts, bulk actions                                                                      | ⏳        |
| 4     | Deployment (Vercel + Render + Atlas)                                                                                                               | ⏳        |
| 5     | Hardening: tests, CI, performance, production checklist                                                                                            | ⏳        |

📄 Phase-wise commands aur "tera part kya hai" guide: [docs/PHASE-1-SETUP.md](docs/PHASE-1-SETUP.md)

## ⚡ Quick start (laptop par)

### 0. Zaroori cheezein

- Node.js v18+ (`node -v`)
- VS Code
- MongoDB Atlas free cluster
- Optional (Phase 2 ke liye): Cloudinary free account, Google Cloud OAuth, Gmail App Password

### 1. Dependencies

```bash
cd notes-heaven
npm run install:all
```

### 2. Backend .env banao

```bash
cd backend
copy .env.example .env      # Windows
# cp .env.example .env      # Mac/Linux
```

`.env` me kam se kam ye 3 cheezein bharo:

```env
MONGO_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/notes-heaven?retryWrites=true&w=majority
JWT_SECRET=koi_bhi_lamba_random_string
CLIENT_URL=http://localhost:5173
```

> Atlas me **Network Access → 0.0.0.0/0** allow karna zaroori hai, warna connection fail hoga.

JWT secret generate karne ke liye:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Backend chalao

```bash
cd backend
npm run dev
```

→ http://localhost:5000/api/health par `{ "success": true, ... }` dikhna chahiye.

### 4. Seed data (optional but recommended)

```bash
cd backend
npm run seed
```

Demo login: **demo@notesheaven.app / demo1234** — design jaisa dashboard (Class 12, JEE Preparation folders + 9 notes + 1 trash note).

### 5. Frontend chalao

```bash
cd client
npm run dev
```

→ http://localhost:5173 kholo. Vite `/api` ko auto-proxy karta hai backend par, isliye client me koi env change ki zarurat nahi.

## 🎛️ Useful scripts

| Command            | Kahan   | Kya karta hai                                        |
| ------------------ | ------- | ---------------------------------------------------- |
| `npm run dev`      | backend | nodemon se API start                                 |
| `npm run seed`     | backend | demo user + folders + notes                          |
| `npm run dev`      | client  | Vite dev server (proxy ke saath)                     |
| `npm run dev:demo` | client  | demo mode — bina backend ke poora UI sample data ke saath |
| `npm run build`    | client  | production build → client/dist                       |

## ✨ Features (Phase 1 me hi kaam kar rahe hain)

- **Notes**: create, edit (autosave + Ctrl+S), delete (soft delete → trash), restore, permanently delete, duplicate, pin, favorite
- **Editor**: TipTap — headings, bold/italic/underline/strike, bullet/number/task lists, quote, inline code, syntax-highlighted code blocks, links, horizontal rule, images, undo/redo
- **Folders**: unlimited nesting (Class 12 → Physics → Optics), rename, move (cycle protection), delete with "notes move karo ya trash me bhejo"
- **Tags**: create on-the-fly, per-tag note counts, filter
- **Search**: title + content search, instant suggestions dropdown, filters (folder, tag, date range, favorite, pinned, trash), sort options
- **Trash**: 5-day auto-delete (MongoDB TTL + cleanup job), days-left indicator, recover, empty trash
- **Auth**: email/password (JWT in httpOnly cookie), forgot-password (email link, 30 min), change password, delete account (cascade)
- **UI**: 100% responsive (mobile drawer sidebar), toasts, confirm dialogs, skeletons, empty states, table + card views

## 🔌 API overview

```
POST   /api/auth/register            POST   /api/auth/login         POST /api/auth/logout
GET    /api/auth/me                  PUT    /api/auth/profile       PUT  /api/auth/change-password
POST   /api/auth/forgot-password     GET    /api/auth/verify-reset-token/:token
PUT    /api/auth/reset-password/:token
GET    /api/auth/google              (Phase 2 - env bharne par auto-enable)

GET    /api/notes                    POST   /api/notes
GET    /api/notes/:id                PUT    /api/notes/:id          DELETE /api/notes/:id        (→ trash)
PATCH  /api/notes/:id/autosave       PATCH  /api/notes/:id/restore
DELETE /api/notes/:id/permanent      DELETE /api/notes/trash/empty  GET  /api/notes/trash
POST   /api/notes/:id/duplicate      PATCH  /api/notes/:id/pin      PATCH /api/notes/:id/favorite
GET    /api/notes/stats/dashboard    GET    /api/notes/export/markdown
GET    /api/notes/:id/versions       POST   /api/notes/:id/versions/:index/restore

GET/POST /api/folders                GET/PUT/DELETE /api/folders/:id  PATCH /api/folders/:id/favorite
GET/POST /api/tags                   PUT/DELETE /api/tags/:id
GET    /api/search                   GET    /api/search/suggestions
POST   /api/uploads/image            DELETE /api/uploads/image
GET    /api/health
```

## 🧱 Tech stack

- **Backend**: Node 18, Express 4, MongoDB + Mongoose 8, JWT (httpOnly cookie), bcryptjs, Multer → Cloudinary, Nodemailer, Helmet, express-rate-limit, Passport (Google OAuth)
- **Frontend**: React 18, Vite 5, React Router 6, TailwindCSS 3, TipTap 2 (+ lowlight code blocks), axios, lucide-react

## 📄 License

Ye project tere naam par hai — MIT jaisa khul ke use kar. Built for students, by a student. 🎓
