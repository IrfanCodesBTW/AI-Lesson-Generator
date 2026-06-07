# Deployment Guide

## Architecture

```
Vercel (FE SPA) ────→ Railway (BE API + Postgres) ────→ Google Gemini API
                                                        └── Rule-based fallback (no key needed)
```

## Prerequisites

- [ ] GitHub account with repo push access
- [ ] Railway account (free tier) — `https://railway.app`
- [ ] Vercel account (hobby tier) — `https://vercel.com`
- [ ] Google Gemini API key (optional — fallback works without it)

---

## 1. Railway — Backend API + Postgres

Railway hosts both the Node.js backend and a managed PostgreSQL database in a single project.

### 1.1 Create the project

1. Sign in to [railway.app](https://railway.app) with GitHub
2. Click **New Project → Deploy PostgreSQL** — name it `Postgres`
3. In the same project, click **+ New → GitHub Repo** → select `IrfanCodesBTW/AI-Lesson-Generator`
4. Configure the new service:
   - **Name**: `Backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` (migrations run automatically on startup)
   - **Watch Paths**: `backend/**`

### 1.2 Wire env vars on the Backend service

| Variable            | Value                                                                                |
| ------------------- | ------------------------------------------------------------------------------------ |
| `DATABASE_URL`      | `${{Postgres.DATABASE_URL}}` (Railway reference)                                     |
| `JWT_SECRET`        | `<32+ char random string>` (e.g. `prod-jwt-secret-2f8a3b1c7d4e9f6a5b0c3d8e1f7a4b2c`) |
| `JWT_EXPIRES_IN`    | `24h`                                                                                |
| `GEMINI_API_KEY`    | `<your Gemini API key>` (optional)                                                   |
| `GEMINI_MODEL`      | `gemini-1.5-flash`                                                                   |
| `GEMINI_TIMEOUT_MS` | `8000`                                                                               |
| `NODE_ENV`          | `production`                                                                         |
| `CORS_ORIGIN`       | `https://<your-vercel-app>.vercel.app` (from step 2.2)                               |
| `LOG_LEVEL`         | `info`                                                                               |

### 1.3 Generate public domain

In the **Backend** service → **Settings** → **Networking** → click **Generate Domain**.
You will get a URL like `https://backend-production-XXXX.up.railway.app`.

### 1.4 Verify

```bash
curl https://backend-production-XXXX.up.railway.app/health
# {"ok":true,"service":"ai-lesson-generator-backend","version":"0.1.0","uptime":...,"gemini":"configured"}
```

The first deploy automatically runs migrations (the backend's `server.ts` calls `runMigrations()` before `app.listen()` in production). The deploy log will show:

```
running database migrations
### MIGRATION 1730000000000_create_users (UP) ###
### MIGRATION 1730000000001_create_lesson_plans (UP) ###
migrations complete
backend started
```

---

## 2. Vercel — Frontend SPA

### 2.1 Create the project

1. Sign in to [vercel.com](https://vercel.com) with GitHub
2. Click **Add New → Project** → import `IrfanCodesBTW/AI-Lesson-Generator`
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.2 Wire env var

In **Settings → Environment Variables**, add:

| Key             | Value                                                            | Target     |
| --------------- | ---------------------------------------------------------------- | ---------- |
| `VITE_API_BASE` | `https://backend-production-XXXX.up.railway.app` (from step 1.3) | Production |

### 2.3 Deploy

Click **Deploy**. Once done, your app is live at `https://<project>.vercel.app`.

---

## 3. Smoke test the full stack

1. Open `https://<project>.vercel.app` in a browser
2. Click **Sign up** → register a test teacher account
3. From the dashboard, click **Generate lesson** → enter age group + theme → submit
4. Verify a lesson appears with objective, activity, rhyme, worksheet, materials
5. Open the lesson → click **Download PDF** → a PDF downloads
6. Refresh the page → the lesson persists in the dashboard

---

## 4. Updating the CORS origin

If you ever change the Vercel domain, update the `CORS_ORIGIN` env var on the Railway **Backend** service to match. Railway will redeploy automatically.

---

## 5. Updating the Gemini key

Edit the `GEMINI_API_KEY` env var on the Railway **Backend** service. Railway redeploys. New generations will use Gemini. Old lessons retain the `source` they were generated with (`gemini` or `fallback`).

---

## 6. Local development

The local dev DB runs in Docker on port `5433`:

```bash
cd backend
cp .env.example .env  # if present, otherwise create your own
DATABASE_URL=postgresql://lesson:lesson@localhost:5433/lesson_dev npm run dev
```

Frontend:

```bash
cd frontend
echo "VITE_API_BASE=http://localhost:4000" > .env
npm run dev
```
