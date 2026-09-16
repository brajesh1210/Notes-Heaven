# Notes Heaven — 5 Phase Roadmap

Har phase ke baad: zip file + robocopy command + git push command.
Har phase me mera part (code) aur tera part (commands + accounts + testing) clearly likha rahega.

---

## Phase 1 — Foundation ✅ (ye wala zip)

**Mera part (ho gaya):**

- Monorepo structure (backend/ + client/), .gitignore, env templates
- Backend: Express app, MongoDB models (User, Note, Folder, Tag), JWT cookie auth
  (register/login/logout/me/profile/change-password/delete-account), forgot-password flow
  (token + mail), notes CRUD + autosave + trash/restore/permanent-delete/duplicate/pin/favorite,
  folders (nested, move, delete modes), tags, search + suggestions, image upload route (Cloudinary wired),
  dashboard stats, markdown export, trash auto-cleanup job, rate limiting, error handling, seed script
- Frontend: design wala pura UI — Landing, Signup, Login, Forgot/Reset password, Dashboard,
  All Notes (table + filters), Folders + Folder Detail (nested), Create Note, Note Editor (TipTap +
  autosave + Ctrl+S), Note View, Search Results, Trash, 404, toasts, confirm dialogs, responsive drawer

**Tera part:** Atlas cluster + .env + npm install + run + GitHub push
→ Guide: [PHASE-1-SETUP.md](PHASE-1-SETUP.md)

---

## Phase 2 — Google OAuth + Images + Export polish ⏳

Karne wale kaam:

- Google Cloud Console se OAuth client banao (tera part — main exact steps dunga)
- `.env` me `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` bharo
- Cloudinary free account → API keys `.env` me → note editor me image upload live
- Gmail App Password → forgot-password mail asli inbox me aane lage
- PDF export ko direct download banane ka option (discussion karenge)
- Note share (public read-only link) — optional

Test: Google button se login, image drag-drop, reset mail inbox me.

---

## Phase 3 — UX polish + extra features ⏳

- Profile page (naam, avatar upload, theme toggle, password change UI)
- Dark mode (design system me tokens already tayyar hain)
- Version history UI (purana version dekh ke restore karo — API ready hai)
- Keyboard shortcuts panel (`/` search, `N` new note, Ctrl+S, Ctrl+B/I/U)
- Bulk actions (multi-select → move folder / trash)
- Note templates (Chapter notes, DSA question, Meeting notes)
- Offline draft (naya note internet ke bina bhi likha jaye)

---

## Phase 4 — Deployment ⏳

- Backend → Render (env vars, health check `/api/health`, cookie `sameSite=None; secure`)
- Frontend → Vercel (`VITE_API_URL` set karna)
- Atlas IP whitelist + DB backup
- Custom domain (optional) + favicon/OG image polish
- Post-deploy smoke test checklist

---

## Phase 5 — Hardening ⏳

- Automated tests (Jest + supertest) — Phase 1 me maine locally 59 API checks pass karaye the, unhe proper test suite bana dena
- CI/CD: GitHub Actions (lint + build + test on push)
- Security: helmet CSP tuning, refresh tokens, audit logs
- Performance: pagination everywhere, virtualized lists, image CDN transforms, query indexes review
- Final documentation + portfolio-ready README with screenshots

---

## Kaam karne ka tareeka (har phase me wahi)

1. Main phase ka code likh kar zip deta hoon.
2. Main robocopy command deta hoon jo zip ka content teri existing repo folder me merge kar de.
3. Tu commands chalata hai, app chalata hai, checklist tick karta hai.
4. Bugs aayein to mujhe error paste kar — main fix karke next zip deta hoon (ya patch file).
5. Sab kaam hone par git push command chalti hai.

Isse teri GitHub me phase-wise clean commit history banti jayegi — interview me dikhane layak. 🚀
