# Phase 2 Setup Guide — Google Login, Image Uploads & Real Emails

Phase 2 adds three external services. Each one is optional per-feature: until you configure it, the app keeps working and simply hides/disables that feature.

| Service   | What it enables                          | Env vars                                  |
| --------- | ---------------------------------------- | ----------------------------------------- |
| Google OAuth | "Continue with Google" button         | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Cloudinary   | Image upload in the editor + avatars  | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| Gmail SMTP   | Real forgot-password + welcome emails | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |

After changing any env var, restart the backend (`npm run dev`).

---

## A. Google Sign-In (~7 minutes)

1. Open **console.cloud.google.com** → sign in with your Google account.
2. Top bar → select/create a project → name it `Notes Heaven`.
3. Left menu → **APIs & Services → OAuth consent screen**:
   - User type: **External** → Create
   - App name: `Notes Heaven`, support email: your email, developer contact: your email → Save & Continue
   - **Scopes**: click *Add or Remove Scopes* → tick `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid` → Update → Save & Continue
   - **Test users**: click *Add Users* and add your own Gmail address → Save & Continue → Back to Dashboard
     (While the app is in *Testing* mode only test users can log in — that is fine for now.)
4. Left menu → **APIs & Services → Credentials** → **+ Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Name: `Notes Heaven Web`
   - **Authorized redirect URIs** → *Add URI* → paste:
     ```
     http://localhost:5000/api/auth/google/callback
     ```
     (When you deploy in Phase 4, add the production URI here too.)
   - Create → copy the **Client ID** and **Client Secret**.
5. Put them in `backend/.env`:
   ```ini
   GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxx
   ```
6. Restart the backend. Open the login page — the **Google button is now active**. Click it, choose your test user, and you should land on the dashboard with starter folders created.

**Errors you may see**
- `redirect_uri_mismatch` → the redirect URI in Google Cloud must match *exactly* (including `/api/auth/google/callback`).
- `Access denied / Error 403` → your Gmail is not in the *Test users* list, or the consent screen got reset.

---

## B. Cloudinary Image Uploads (~3 minutes)

1. Sign up free at **cloudinary.com** (Google login works).
2. Dashboard → **Getting started** card shows: *Cloud name*, *API key*, *API secret* (click the eye icon for the secret).
3. `backend/.env`:
   ```ini
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxx
   ```
4. Restart the backend → open any note editor → toolbar **image button** → pick a PNG/JPG (≤8 MB).
   You will see an instant local preview, then the image swaps to the uploaded Cloudinary URL. Avatars on the Profile page use the same upload.

**Errors you may see**
- `Invalid signature` → API secret copied with a space/missing character.
- Toast says image upload not configured → env vars missing or backend not restarted.

---

## C. Real Emails via Gmail SMTP (~4 minutes)

1. Your Google account → **Security** → turn **2-Step Verification ON** (required for app passwords).
2. Open **myaccount.google.com/apppasswords** → select *Mail* → *Other (Custom name)*: `Notes Heaven` → Generate → copy the 16-character password (spaces don't matter).
3. `backend/.env`:
   ```ini
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=yourgmail@gmail.com
   SMTP_PASS=abcdefghijklmnop
   SMTP_FROM=yourgmail@gmail.com
   ```
4. Restart the backend → use **Forgot password** with your registered email → a real mail arrives (check Spam once). The same transport sends the welcome email on register.

> Without SMTP configured the app still works: the reset link is printed in the backend terminal and shown on-screen in dev mode.

---

## D. New in this phase (test checklist)

1. **Profile page** — user menu → *Profile*: change name + email → Save → topbar avatar/name update.
2. **Avatar upload** — *Change photo* → pick image → Save changes → avatar persists after reload (needs Cloudinary).
3. **Email uniqueness** — try changing your email to another existing user's email → clear error message.
4. **Password change** — update password → log out → log in with the new password (old one fails).
5. **Google login** — button active after setup → sign in → starter folders created for a brand-new Google account.
6. **Editor images** — insert an image → saved note shows it in Note View and PDF export.
7. **Forgot password mail** — real inbox mail with a working reset link (needs SMTP).
8. **Delete account** — Profile → Danger zone → confirm → everything removed and you are logged out.

---

## E. Sync + push this phase

```bat
robocopy "C:\Downloads\notes-heaven" "C:\Projects\notes-heaven" /E /XD node_modules dist .git /XF .env /NFL /NDL /NJH /NJS
```
(run it in **CMD**, not Git Bash — Git Bash rewrites `/E` into a path)

```bat
git add .
git commit -m "Phase 2: Google OAuth, Cloudinary uploads, SMTP mail, profile page"
git push origin main
```

⚠️ Never commit `.env` — it is already in `.gitignore`; your secrets stay on your machine.
