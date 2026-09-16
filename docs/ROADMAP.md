# Roadmap

Notes Heaven is delivered in five phases. Each phase ships as a zip with a merge command and a git push, and is fully testable before the next one starts.

## Phase 1 — Foundation (done)

- MERN monorepo: Express REST API + React/Vite/Tailwind frontend
- Custom auth (JWT httpOnly cookie): register, login, logout, session restore
- Forgot-password flow with reset tokens (email when SMTP is configured, dev link otherwise)
- Notes CRUD with TipTap rich text: headings, lists, task lists, quotes, links, code blocks with syntax highlighting
- Autosave with visible save status + manual save (Ctrl+S)
- Nested folders (create / rename / move / delete with move-or-trash choice), breadcrumbs
- Tags with colors, tag filtering, tag suggestions
- Search across title / content / tags / folders with live suggestions and advanced filters (date range, folder, favorite, pinned, trash)
- Pin, favorite, duplicate
- Trash with 5-day auto-delete, restore, restore-all, permanent delete, empty trash
- Dashboard stats, note versions (history kept on save), Markdown export, PDF export via print dialog
- Full UI matching the approved design, mobile responsive (sidebar drawer, adaptive tables/grids)
- Demo mode (`npm run dev:demo`) with in-memory data for UI-only runs

## Phase 2 — Integrations go live (done)

- Google OAuth end-to-end (Google Cloud console setup walk-through included)
- Cloudinary image upload in the editor (drag-drop, paste, resize), image delete on note/image removal
- Real SMTP forgot-password + welcome emails (Gmail/SES setup guide)
- Profile page: avatar upload, name/email edit, change password, delete account

## Phase 3 — UX polish

- Dark mode with system preference + manual toggle
- Note version history UI (view & restore old versions)
- Keyboard shortcuts (Ctrl+S save, Ctrl+K search, Esc close dialogs) with a shortcuts help modal
- Bulk actions: select multiple notes → move, tag, pin, trash
- Note templates (lecture notes, meeting notes, revision sheet)
- Sortable columns, list/grid view toggle, recent-notes rail

## Phase 4 — Deployment

- Backend to Render (health check, env vars, auto-deploy from GitHub)
- Frontend to Vercel (env vars, preview deploys)
- MongoDB Atlas production hardening (dedicated DB user, restricted IP if possible, backups on)
- CORS/cookie configuration for production domains, rate limits review
- Custom domain checklist (optional)

## Phase 5 — Hardening & scale

- Automated tests: API integration tests (supertest) + frontend component tests (Vitest/Testing Library)
- CI on GitHub Actions: lint + test + build on every push
- Security pass: helmet, strict CORS, input sanitization, dependency audit, security headers
- Performance: pagination everywhere, image lazy-loading, route-level code splitting, DB index review
- Error tracking + request logging in production (Sentry or similar)
- Backup & restore runbook for user data
