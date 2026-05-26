# Deployment Guide — CUW Nursing Charting App

Production target: **Frontend on Vercel**, **Backend on Railway** (separate origins).
The backend uses an embedded **SQLite** database stored on a Railway **volume**.

> A later migration to school servers is planned but out of scope here. Because the
> database is a single SQLite file, that move is just a file copy.

---

## 1. Backend → Railway

### 1.1 Service
- Create a Railway project, deploy the `server/` directory (root directory = `server`).
- Build command: `npm run build`  •  Start command: `npm start`
- Node 20 (see `.nvmrc` / `engines`). Railway installs deps with `npm ci`, which fetches the `better-sqlite3` prebuilt binary.

### 1.2 Persistent volume (REQUIRED — or data is wiped on every deploy)
- Add a **Volume** and mount it at, e.g., `/data`.
- Set `DATABASE_PATH=/data/app.db` so the SQLite file lives on the volume.

### 1.3 Environment variables (Railway → Variables)
| Variable | Required | Example / Notes |
|----------|----------|-----------------|
| `JWT_SECRET` | ✅ | Strong random string. Server refuses to start without it. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `CORS_ORIGIN` | ✅ | The Vercel URL(s), comma-separated. e.g. `https://your-app.vercel.app` (add the `*-git-*` preview domain if needed) |
| `DATABASE_PATH` | ✅ | `/data/app.db` (on the mounted volume) |
| `ADMIN_USERNAME` | ✅ | e.g. `cuw-admin` |
| `ADMIN_PASSWORD` | ✅ | Strong password. Seeds the initial admin on first boot; **no admin is created if unset**. |
| `NODE_ENV` | ✅ | `production` (enables error scrubbing + info-level logs) |
| `PORT` | — | Injected by Railway automatically |
| `LOG_LEVEL` | — | `info` (default in prod) |

`PORT` is read automatically. The seeded admin is created only when `ADMIN_PASSWORD` is set.

### 1.4 First-boot data
On startup the server creates SQLite tables, imports any legacy `data/*.json` if present
(none in a fresh deploy), then seeds default courses, the admin, default patients, and
invite codes. Course join codes are printed to the logs.

---

## 2. Frontend → Vercel

- Import the repo; set **Root Directory = `client`**. Vercel auto-detects Create React App.
- Build command: `npm run build`  •  Output dir: `build`
- **Environment variable:**
  | Variable | Value |
  |----------|-------|
  | `REACT_APP_BACKEND_URL` | The Railway backend URL, e.g. `https://your-api.up.railway.app` |

  This is baked into the build, so **redeploy the frontend after changing it**. Leave it
  empty only for same-origin deployments (the future school-server setup where Express
  serves the build).

- After the first frontend deploy, copy its URL into the backend's `CORS_ORIGIN` and
  redeploy the backend.

---

## 3. Backups

A backup script creates a crash-consistent SQLite copy and prunes old ones:

```
npm run backup           # writes <volume>/backups/app-<timestamp>.db, keeps last 14
```

Configure with `BACKUP_DIR` (default: `backups/` next to the DB) and `BACKUP_KEEP`
(default 14). Schedule it via a **Railway cron / scheduled job**. For off-site safety,
periodically download a backup or point `BACKUP_DIR` at external storage.

Restore: stop the service, replace `app.db` with a backup copy, restart.

---

## 4. Local development

```
# server
cd server && cp .env.example .env   # fill JWT_SECRET, ADMIN_PASSWORD
npm install && npm run dev           # http://localhost:5001

# client (new terminal)
cd client && npm install && npm run dev   # http://localhost:3000 (proxies API to :5001)
```

The server now fails loudly if its port is already in use (no silent fallback), so
the frontend proxy and backend stay in sync.

Tests: `npm test` in `server` (vitest + supertest) and in `client` (CRA + Testing Library).
CI runs build + tests for both on PRs to `main`.

---

## 5. Follow-ups (tracked, not yet done)
- Per-endpoint Joi schemas for the patient charting routes (`server/src/routes/patients.ts`).
  Currently auth/account/course/patient-creation are validated and request bodies are size-bounded;
  the nested clinical mutations still accept loosely-typed payloads.
- Authorization on charting mutations (verify the caller is enrolled in the patient's course,
  matching the read-side `isEnrolledOrAdmin` check).
- Strict Content-Security-Policy (helmet CSP is currently disabled for SPA compatibility).
- CRA → Vite migration (react-scripts is unmaintained; app is on React 19).
