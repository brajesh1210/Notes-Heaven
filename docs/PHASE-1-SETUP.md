# Phase 1 — Setup Guide (tera part kya hai)

Bhai, Phase 1 ka code 100% ready hai. Ab bas ye steps follow kar — har step ke saath exact command diya hai.
Jo command terminal me chalti hai wo copy-paste kar dena.

---

## ✅ Step 0 — Ye check kar le (2 min)

```bash
node -v      # v18 ya usse upar hona chahiye
npm -v
git --version
```

Agar `node -v` par error aaye → nodejs.org se LTS version install kar le (Next → Next → Install).

VS Code me ye extensions install kar le (recommended):

- ES7+ React/Redux snippets (dsznajder)
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

---

## ✅ Step 1 — Zip nikaal aur project folder banao

1. `notes-heaven-phase1.zip` download kar.
2. Uspe right click → **Extract All** → path de: `C:\Projects`
3. Ab ye folder ban jayega: `C:\Projects\notes-heaven`

Confirm karne ke liye:

```bash
dir C:\Projects\notes-heaven
```

Isme `backend`, `client`, `docs`, `README.md` dikhne chahiye.

> Agar folder pehle se bana hai (purana code merge karna hai) to extract ke baad ye robocopy chalana:
>
> ```bat
> robocopy "C:\Downloads\notes-heaven" "C:\Projects\notes-heaven" /E /XD node_modules dist .git /XF .env /NFL /NDL /NJH /NJS
> ```

---

## ✅ Step 2 — MongoDB Atlas (cluster ke aage ke steps) — 5 min

Cluster to tune bana liya hai (Mumbai region ✅). Ab ye 3 kaam:

1. **Database Access** (left menu) → **Add New Database User**:
   - Username: `notesadmin`
   - Password: **Autogenerate** karke kahin note kar le (password me `@ # %` jaise characters ho to URL-encode karna: `@` = `%40`)
   - Role: **Read and write to any database** → Add User
2. **Network Access** → **Add IP Address** → **Allow access from anywhere (0.0.0.0/0)** → Confirm.
3. **Database → Connect → Drivers → Node.js** → connection string copy kar:

   ```
   mongodb+srv://notesadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

   `<password>` ki jagah apna password daal aur `/?retry` ke pehle database name chipka de:

   ```
   mongodb+srv://notesadmin:MeraPass123@cluster0.xxxxx.mongodb.net/notes-heaven?retryWrites=true&w=majority
   ```

---

## ✅ Step 3 — Backend .env banao

```bat
cd C:\Projects\notes-heaven\backend
copy .env.example .env
code .env
```

Ab `.env` me ye lines bhar (baaki abhi khaali chhod de, Phase 2 me bharayenge):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://notesadmin:MeraPass123@cluster0.xxxxx.mongodb.net/notes-heaven?retryWrites=true&w=majority
JWT_SECRET=yahan_lamba_random_string_paste_karo
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
TRASH_RETENTION_DAYS=5
```

JWT secret banane ke liye ye command chala aur output paste kar de:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> ⚠️ `.env` ko kabhi git par push nahi karna. `.gitignore` me already hai, tension na le.

---

## ✅ Step 4 — Backend install + run

```bat
cd C:\Projects\notes-heaven\backend
npm install
npm run dev
```

Terminal me ye dikhna chahiye:

```
[OK]   MongoDB connected -> cluster0-shard-00-xx.mongodb.net/notes-heaven
[OK]   Notes Heaven API live -> http://localhost:5000  [development]
```

Ab browser me khol: **http://localhost:5000/api/health**
`{ "success": true, "message": "Notes Heaven API is healthy ✅", ... }` aa jaye to backend perfect hai. 🎉

> Is terminal ko band mat kar — backend chalta rehna chahiye.

---

## ✅ Step 5 — Demo data daal (recommended)

Naya terminal khol (VS Code me ``Ctrl + Shift + ` ``) aur:

```bat
cd C:\Projects\notes-heaven\backend
npm run seed
```

Output:

```
[OK]   Demo user: demo@notesheaven.app / demo1234
[OK]   7 folders banaye (nested included)
[OK]   10 demo notes insert kiye
```

---

## ✅ Step 6 — Frontend install + run

```bat
cd C:\Projects\notes-heaven\client
npm install
npm run dev
```

Terminal me:

```
VITE v5.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

Browser me **http://localhost:5173** khol → Landing page dikhega.
Ab Login karo: **demo@notesheaven.app / demo1234** → Dashboard, design jaisa exactly. ✅

### Phase 1 checklist (ye sab chala ke dekh):

- [ ] Landing page → Get Started Free → Signup page
- [ ] Naya account banao (email/password) → dashboard khul jaye
- [ ] New Note → title + content likho → Save Note → note ban jaye
- [ ] Note editor me `Ctrl + S` → "Saved" dikhe (autosave bhi chalta hai)
- [ ] Code block insert karke `const x = 1;` likh → coloured dikhe
- [ ] Note View → Edit → title badal ke Save → update ho jaye
- [ ] `...` menu → Move to trash → Trash page → Restore
- [ ] Trash me dusra note permanently delete karo
- [ ] Folders → New Folder → andar jaake New subfolder (nested bana?)
- [ ] Topbar search me `business` type karo → suggestions + Search Results page
- [ ] Mobile view: browser window chhota karo → sidebar drawer ban jaye

Agar ye sab ho gaya to **Phase 1 complete** hai. 💪

---

## ✅ Step 7 — GitHub par push (repo already ready hai)

Teri repo: `https://github.com/brajesh1210/Notes-Heaven.git`

### 7.1 Pehli baar (repo khaali hai)

```bash
cd C:\Projects\notes-heaven
git init
git branch -M main
git add .
git commit -m "Phase 1: MERN setup + backend APIs (auth, notes CRUD) + frontend UI"
git remote add origin https://github.com/brajesh1210/Notes-Heaven.git
git push -u origin main
```

Pehli push par GitHub login maangega → browser me Authorize kar de (ya Personal Access Token use kar).

### 7.2 Aage ke phases (roz ka kaam)

```bash
cd C:\Projects\notes-heaven
git add .
git commit -m "Phase 2: Google OAuth + Cloudinary image upload"
git push origin main
```

> `git status` se dekhna kabhi-kabhi ki `node_modules` ya `.env` galti se add ho raha hai ya nahi — dono `.gitignore` me hain, isliye normally add nahi honge.

---

## 🔁 Step 8 — Agli baar jab project khola (roz ka setup)

```bash
# Terminal 1
cd C:\Projects\notes-heaven\backend
npm run dev

# Terminal 2 (VS Code me Ctrl+Shift+`)
cd C:\Projects\notes-heaven\client
npm run dev
```

Bas. Dono chalu → http://localhost:5173 par kaam karo.

---

## 🧯 Common errors aur fix

| Error                                     | Fix                                                                                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGO_URI missing!`                      | `backend/.env` file bani nahi hai ya galat folder me hai. `copy .env.example .env` dobara chala.                                                                 |
| `MongoDB connection failed: bad auth`     | Atlas password galat hai ya password me special char `@` hai (use `%40`). Database user ka password reset karke naya MONGO_URI daal.                            |
| `MongoDB connection failed: ... IP`       | Atlas → Network Access → `0.0.0.0/0` add kar.                                                                                                                   |
| `EADDRINUSE: port 5000`                   | Purana server chalu hai. Windows me: `netstat -ano \| findstr :5000` → `taskkill /PID <pid> /F`. Ya `.env` me `PORT=5001` kar aur client/vite.config.js me proxy target bhi `http://localhost:5001` kar de. |
| Backend se connect nahi ho pa raha (toast)| Backend band hai / `npm run dev` nahi chala. http://localhost:5000/api/health khol ke check kar.                                                                 |
| `Ye email already registered hai`         | Dusra email use kar ya `demo@notesheaven.app` se login kar.                                                                                                      |
| Signup par Network Error                  | Vite proxy target galat hai, ya backend localhost par band hai.                                                                                                  |
| Image upload fail                         | Phase 1 me Cloudinary env khaali hai — ye expected hai, Phase 2 me enable hoga.                                                                                  |
| `npm install` fail ho jaye                | `del package-lock.json` + `rd /s /q node_modules` phir `npm install` dobara.                                                                                     |
| Password reset mail nahi aaya             | SMTP Phase 2 me setup hoga. Dev me terminal par reset link print hota hai — wohi link browser me khol le.                                                        |

---

## 📁 Folder structure (samajhne ke liye)

```
notes-heaven/
├─ backend/
│  ├─ .env.example              ← isse .env banate hain
│  └─ src/
│     ├─ server.js              ← entry point (DB connect + listen)
│     ├─ app.js                 ← express app, cors, helmet, routes
│     ├─ config/                ← env, db, passport (google)
│     ├─ models/                ← User, Note, Folder, Tag (schemas)
│     ├─ controllers/           ← actual logic (auth, note, folder, tag, search, upload)
│     ├─ routes/                ← URL → controller mapping
│     ├─ middleware/            ← auth (JWT), error handler, rate limit, multer
│     ├─ services/              ← cloudinary, mailer
│     ├─ tasks/                 ← trash auto-cleanup job
│     └─ utils/                 ← token, ApiError, folderTree, seed
└─ client/
   └─ src/
      ├─ main.jsx, App.jsx      ← routes yahan define hain
      ├─ lib/                   ← api client, utils, export (PDF), demo mode
      ├─ context/               ← Auth, Folders, Toast (global state)
      ├─ hooks/                 ← useAutosave, useDebounce
      ├─ components/            ← ui/, layout/, editor/, notes/, folders/, auth/
      └─ pages/                 ← Landing, auth/, notes/, Dashboard, Folders, Trash, Search...
```

---

## 🎁 Bonus — Demo mode (backend ke bina UI dekhna)

Agar kisi ko sirf UI dikhana hai (backend chalane ki fursat nahi):

```bash
cd C:\Projects\notes-heaven\client
npm run dev:demo
```

Isme in-memory sample data chalta hai — login par kuch bhi daal do, UI pura clickable hai.
