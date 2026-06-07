# Deployment Guide

## Architecture

```
Vercel (FE SPA) ────→ Render (BE API) ────→ Supabase Postgres
                                              ├── Google Gemini API
                                              └── Rule-based fallback (no key needed)
```

## Prerequisites

- [ ] GitHub account with repo push access
- [ ] Render account (free tier)
- [ ] Vercel account (hobby tier)
- [ ] Supabase account (free tier)
- [ ] Google Gemini API key (optional — fallback works without it)

---

## 1. Supabase — Production Database

1. Create project at [supabase.com](https://supabase.com)
   - Region: **Mumbai (ap-south-1)**
   - Database password: save securely
2. Once created, go to **Project Settings → Database → Connection string**
   - Copy `URI` (port `6543` with `?pgbouncer=true`) → `DATABASE_URL`
   - Copy `Direct connection` (port `5432`) → `DATABASE_DIRECT_URL`
3. Run migrations:
   ```bash
   cd backend
   DATABASE_DIRECT_URL="postgresql://..." npm run migrate up
   ```
4. Verify tables:
   ```bash
   psql "<DATABASE_DIRECT_URL>" -c "\dt"
   # Should show: users, lesson_plans, pgmigrations
   ```

---

## 2. Render — Backend API

1. Sign in to [dashboard.render.com](https://dashboard.render.com)
2. Click **New + → Web Service**
3. Connect your GitHub repo (`IrfanCodesBTW/AI-Lesson-Generator`)
4. Configure:
   - **Name**: `ai-lesson-generator-api`
   - **Region**: `Singapore` (closest to ap-south-1 Supabase)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install --no-audit --no-fund && npm run build`
   - **Start Command**: `cd backend && node dist/src/server.js`
   - **Plan**: Free
5. Add environment variables:

| Key                   | Value                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------- |
| `NODE_ENV`            | `production`                                                                              |
| `PORT`                | `10000` (Render injects this)                                                             |
| `DATABASE_URL`        | Supabase pooled URI (port 6543 with `?pgbouncer=true&connection_limit=1`)                 |
| `DATABASE_DIRECT_URL` | Supabase direct URI (port 5432)                                                           |
| `JWT_SECRET`          | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN`      | `24h`                                                                                     |
| `CORS_ORIGIN`         | `https://your-app.vercel.app`                                                             |
| `GEMINI_API_KEY`      | Your Gemini key (leave empty for template fallback)                                       |
| `GEMINI_MODEL`        | `gemini-1.5-flash`                                                                        |
| `GEMINI_TIMEOUT_MS`   | `8000`                                                                                    |
| `LOG_LEVEL`           | `info`                                                                                    |

6. Click **Create Web Service** and wait for the build (~3–5 min)
7. Verify: visit `https://your-app.onrender.com/health`

---

## 3. Vercel — Frontend SPA

1. Sign in to [vercel.com](https://vercel.com)
2. Click **Add New → Project**
3. Import your GitHub repo (`IrfanCodesBTW/AI-Lesson-Generator`)
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --no-audit --no-fund`
5. Add environment variable:
   - `VITE_API_BASE`: `https://your-app.onrender.com`
6. Click **Deploy**
7. Vercel automatically detects `frontend/vercel.json` for SPA rewrites
8. Verify: visit your Vercel URL → should see the app

---

## 4. Post-Deployment Verification

```bash
# Health check
curl https://your-app.onrender.com/health

# Register a user
curl -X POST https://your-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo","email":"demo@example.com","password":"demo-password"}'

# Generate a lesson (use the token from register)
TOKEN="eyJ..."
curl -X POST https://your-app.onrender.com/api/lessons/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ageGroup":"4-5","theme":"Animals"}'

# List lessons
curl https://your-app.onrender.com/api/lessons \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5. Production Checklist

- [ ] `JWT_SECRET` is a long random string (not the dev default)
- [ ] `CORS_ORIGIN` matches your Vercel domain exactly
- [ ] `DATABASE_URL` uses Supabase pooled connection (port 6543 with `pgbouncer=true`)
- [ ] `DATABASE_DIRECT_URL` is the direct connection (port 5432) — used by migrations
- [ ] Gemini API key is set (optional; fallback works without it)
- [ ] Render health check at `/health` returns 200
- [ ] Vercel rewrites work for all routes (not just `/`)
- [ ] `Cache-Control` headers are set on static assets
- [ ] Security headers (`X-Content-Type-Options`, `X-Frame-Options`, etc.) are present

---

## 6. Rollback

**Render:** Dashboard → Web Service → Manual Deploy → Deploy previous commit

**Vercel:** Dashboard → Deployments → select previous → ⋮ → Promote to Production

**Database:** Run migration down, then up with previous:

```bash
DATABASE_DIRECT_URL="..." npm run migrate down
```
