# AI Lesson Plan Generator — Master Execution Plan

> **Project:** Web app for preschool teachers to auto-generate age-appropriate lesson plans via Google Gemini with a rule-based fallback.
> **Mandated stack (AGENTS.md):** React + Vite + Tailwind + Axios (FE) · Node + Express (BE) · PostgreSQL (DB) · Google Gemini API (AI) · Vercel (FE) + Render (BE).
> **Status:** Phase 7 — Deployment. Plan is phase-ordered, not date-anchored.

---

## 0. Decision Log

| #   | Decision                                                                                                        | Source      |
| --- | --------------------------------------------------------------------------------------------------------------- | ----------- |
| D1  | Phase-ordered, not date-anchored. No fixed R3 date.                                                             | User        |
| D2  | `.env`-driven `GEMINI_API_KEY`; user fills it in after scaffold.                                                | User        |
| D3  | PDF library = **pdfkit (server-side)**.                                                                         | User        |
| D4  | BE host = **Render (free) + Neon (free DB)** for dev; Render Starter for R3 demo week.                          | User + plan |
| D5  | Age groups = PRD-implied (2–3, 3–4, 4–5, 5–6). Themes = proposed below; user approves before content authoring. | User        |
| D6  | Build order = T13 (Gemini) then T14 (Fallback), original.                                                       | User        |
| D7  | Coverage target = **≥70% on services, ≥50% overall**.                                                           | User        |
| D8  | Two separate `package.json` files (backend/, frontend/) for simplicity over workspaces.                         | Plan        |
| D9  | Tailwind v3 (stable) over v4.                                                                                   | Plan        |
| D10 | **Local Postgres in Docker for dev/test, Supabase for prod**                                                    | User        |
| D11 | **Skip RLS for now** (defer to v2) — Express enforces ownership                                                 | User        |
| D12 | **Install `@supabase/supabase-js`** for future use (admin queries, Storage)                                     | User        |
| D13 | **Password min length 8, no complexity** (NIST 2024 guidance, teacher-friendly)                                 | User        |
| D14 | **Supabase region: Mumbai (ap-south-1)**                                                                        | User        |

### Proposed themes (awaiting user approval)

1. Animals · 2. Colors · 3. Numbers & Counting · 4. Family & Friends · 5. Seasons & Weather · 6. Plants & Gardens · 7. Transport & Vehicles · 8. Water & Bubbles · 9. Shapes · 10. My Body

→ 4 ages × 10 themes = **40 templates** to author in T14.

---

## 1. Scope Lock

**In:** register · login · generate (age+theme+date → 5 fields) · save · list · search-by-theme · detail · delete · PDF export · Gemini primary · rule-based fallback.

**Out:** parent portal, WhatsApp, admin, sharing, analytics, multi-center, mobile, SSO, i18n, payments, password reset, email verify, MFA.

**Hard SLA:** generate + persist + respond ≤ 10 s wall clock. **No silent failure.**

---

## 2. Architecture

```
Vercel SPA (React+Vite+TS+Tailwind+Axios)
        │  Bearer JWT
        ▼
Render (Node 20 + Express + TS) — D4
        │  pg pool (5–10)
        ▼
Postgres (Neon free in dev, Render Postgres on R3)
        │
        ├──► Gemini API  (primary, 8 s timeout, 1 retry)
        │
        └──► Template Engine (age × theme JSON map, fallback)
                │
                └──► pdfkit (PDF buffer) → Content-Type: application/pdf
```

### API contract (locked, will live in `03-design/api-contract.md`)

- `POST /api/auth/register` → `{ name, email, password }` → `201 { user, token }` · 409 duplicate
- `POST /api/auth/login` → `{ email, password }` → `200 { user, token }` · 401 bad creds
- `POST /api/lessons/generate` → `{ ageGroup, theme, date }` → `201 { lesson }` (incl. `source: "gemini"|"fallback"`)
- `GET  /api/lessons?theme=&page=&limit=` → `{ items, total }`
- `GET  /api/lessons/:id` → `{ lesson }` · 404 if not owned
- `DELETE /api/lessons/:id` → `204` · 404 if not owned
- `GET  /api/export/pdf/:id` → `application/pdf` · 404 if not owned
- `GET  /health` → `{ ok, db: 'up'|'down', gemini: 'configured'|'fallback' }`

### Schema (locked)

```sql
users(id uuid pk, name text, email text unique, password_hash text, created_at timestamptz default now())
lesson_plans(
  id uuid pk,
  user_id uuid fk users(id) on delete cascade,
  age_group text check (age_group in ('2-3','3-4','4-5','5-6')),
  theme text,
  lesson_content jsonb,
  source text check (source in ('gemini','fallback')),
  created_at timestamptz default now()
);
create index on lesson_plans(user_id, created_at desc);
create index on lesson_plans(user_id, theme);
```

### Lesson content JSON shape (the contract both Gemini and templates must produce)

```json
{
  "objective": "string",
  "activity": "string",
  "rhyme": "string",
  "worksheet": "string",
  "materials": ["string", "string"]
}
```

### Fallback rule (the heart of the system)

Any of {missing key, 4xx, 5xx, timeout, parse error, schema mismatch} → template engine. Log `{ source: "fallback", reason }`. **Never 500 on user input.**

---

## 3. Work Breakdown Structure

> **Priority:** P0 = blocks review demos · P1 = needed at R3 · P2 = nice-to-have

| ID      | Task                                                                   | Phase | Pri | Deliverable      | Acceptance                         |
| ------- | ---------------------------------------------------------------------- | ----- | --- | ---------------- | ---------------------------------- |
| T01a    | Bootstrap tooling (ESLint, Prettier, Vitest, Husky, CI)                | 1     | P0  | green CI         | `npm run lint/test/build` all pass |
| T01b    | Scaffold backend (Express+TS, /health, env, logger)                    | 1     | P0  | running API      | `GET /health` → 200                |
| T01c    | Scaffold frontend (Vite+React+TS+Tailwind, router, Axios, AuthContext) | 1     | P0  | running SPA      | `npm run dev` works                |
| T10     | Migrations (node-pg-migrate)                                           | 2     | P0  | 2 migrations     | up/down work                       |
| T11     | Auth (register, login, JWT)                                            | 2     | P0  | 2 routes + tests | bcrypt ≥10, 401 paths              |
| T12     | Lesson CRUD                                                            | 3     | P0  | 4 routes + tests | All pass, owner-checked            |
| T13     | Gemini service (timeout, retry, parse)                                 | 4     | P0  | module + tests   | 8 s timeout, 1 retry               |
| T14     | Template engine (40 entries)                                           | 4     | P0  | module + tests   | 4 ages × 10 themes                 |
| T15     | Generator orchestrator (Gemini→fallback)                               | 4     | P0  | route + e2e      | both paths work                    |
| T16     | PDF export (pdfkit)                                                    | 5     | P0  | route            | opens, all 5 fields                |
| T17–T21 | FE: login, register, generate, dashboard, detail                       | 5     | P0  | 5 screens        | flows work                         |
| T22     | E2E (Playwright happy path)                                            | 6     | P0  | spec             | green                              |
| T23     | Unit/integration ≥70% services, ≥50% overall                           | 6     | P0  | coverage report  | passes threshold                   |
| T24     | Security (npm audit, OWASP quick)                                      | 6     | P1  | checklist        | no high/critical                   |
| T25     | Performance (autocannon, p95 ≤6 s on BE alone)                         | 6     | P1  | report           | passes                             |
| T26     | Deploy (Render + Neon + Vercel)                                        | 7     | P0  | URLs live        | 200 OK                             |
| T27     | Deploy runbook                                                         | 7     | P0  | doc              | reproducible in <30 min            |
| T28     | User manual + maintenance guide                                        | 8     | P0  | 2 docs           | screenshots                        |
| T29     | Final report                                                           | 8     | P0  | doc              | all sections                       |
| T30     | Demo video (3–5 min)                                                   | 8     | P0  | mp4              | plays                              |

### Critical path

T01a → T01b → T01c → T10 → T11 → T12 → T13 → T15 → T19–T21 → T22 → T26 → T29/T30

### Parallelizable after T12

- Track A: T13 → T15 (Gemini integration)
- Track B: T14 → T15 (Fallback engine)
- Track C: T17–T21 (Frontend) starts in parallel with backend

---

## 4. Quality & Risk (top items)

| Risk                               | Sev | Mitigation                                            |
| ---------------------------------- | --- | ----------------------------------------------------- |
| Gemini free-tier quota during demo | H   | Cache; fallback covers; pre-seed demo lessons         |
| Render free-tier sleep >10 s       | M   | Render Starter for R3 demo week; cron-ping during dev |
| Rule-based content feels generic   | M   | Curate 40 templates, peer-review                      |
| JWT in localStorage XSS            | M   | Document; flag for v2; CSP headers in deploy          |
| Solo dev burnout                   | M   | 2-week buffer; weekly mentor sync                     |
| Scope creep                        | M   | Strict adherence to PRD Out-of-Scope                  |
| DB schema drift                    | M   | node-pg-migrate only; CI runs on PR                   |
| PDF font issues                    | L   | Bundled Helvetica only in v1                          |
| Gemini PII/unsafe output           | M   | System prompt forbids; response validated by Zod      |
| npm supply-chain                   | M   | `npm audit` in CI; lockfile; minimal deps             |

**Coverage target:** ≥70% on services, ≥50% overall (D7).
**TypeScript strict mode** everywhere. **Zod** at every boundary.
**No silent failure** — orchestrator (T15) is the single owner of the fallback contract.

---

## 5. Folder Plan

```
.
├── plan.md                          # this file
├── README.md
├── .gitignore
├── .nvmrc
├── .editorconfig
├── .env.example
├── package.json                     # orchestration scripts only
├── .github/workflows/ci.yml
├── .husky/pre-commit
├── backend/                         # Node + Express + TS
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── .env.example
│   ├── src/
│   │   ├── server.ts
│   │   ├── app.ts
│   │   ├── config/env.ts
│   │   ├── lib/logger.ts
│   │   ├── lib/db.ts
│   │   ├── middleware/error.ts
│   │   ├── middleware/auth.ts
│   │   ├── routes/health.ts
│   │   ├── routes/auth.ts
│   │   ├── routes/lessons.ts
│   │   ├── routes/export.ts
│   │   ├── services/auth.service.ts
│   │   ├── services/lesson.service.ts
│   │   ├── services/gemini.service.ts
│   │   ├── services/template.engine.ts
│   │   ├── services/pdf.service.ts
│   │   ├── schemas/{auth,lesson}.schemas.ts
│   │   └── templates/{index.ts,data.json}
│   ├── tests/
│   └── migrations/
└── frontend/                        # Vite + React + TS + Tailwind
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example
    ├── vitest.config.ts
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── index.css
    │   ├── router.tsx
    │   ├── lib/api.ts
    │   ├── context/AuthContext.tsx
    │   ├── components/{Button,Input,Card,Layout}.tsx
    │   ├── pages/{Home,Login,Register,Generate,Dashboard,LessonDetail}Page.tsx
    │   └── hooks/{useAuth,useLessons}.ts
    └── tests/
```

---

## 6. Phase Progress

- [x] Phase 0 — Plan & decisions locked
- [x] Phase 1 — Scaffolding ✅
  - [x] T01a Bootstrap tooling (ESLint, Prettier, Vitest, Husky, CI) ✅
  - [x] T01b Backend scaffold (Express+TS, /health, env, logger) ✅
  - [x] T01c Frontend scaffold (Vite+React+TS+Tailwind, router, Axios, AuthContext) ✅
- [x] Phase 2 — DB & Auth ✅
  - [x] T2.1–T2.16 complete
  - [x] Supabase env wired; local Postgres via Docker; migrations apply
  - [x] Custom bcrypt (cost 12) + JWT (HS256, 24h) auth working
  - [x] 7 auth tests + 3 health tests = 10/10 BE tests green
  - [x] Coverage on auth.service.ts = 86.3% (target ≥70%)
- [x] Phase 3 — Lesson CRUD ✅
  - [x] T3.1 Schema (Zod: createLesson, listLessons, ageGroup/source enums)
  - [x] T3.2 Service (listLessons with theme+page+limit, getLesson, deleteLesson, createLesson — all owner-scoped)
  - [x] T3.3 Routes (`POST /api/lessons/generate`, `GET /api/lessons`, `GET /api/lessons/:id`, `DELETE /api/lessons/:id`)
  - [x] T3.4 Generator orchestrator stub (returns hardcoded fallback content; replaced in Phase 4)
  - [x] T3.5 Mount `/api/lessons` behind `requireAuth` in `app.ts`
  - [x] T3.6 8 integration tests (list empty, 401 unauth, create+persist, 400 bad age, paginated list + theme filter, 404 cross-user, 204 delete, 404 delete cross-user)
  - [x] T3.7 FE: lib/api.ts (Lesson, LessonContent, AGE_GROUPS, THEMES, registerUser, loginUser, fetchLessons, fetchLesson, deleteLesson, generateLesson, getApiError)
  - [x] T3.8 FE: LoginPage, RegisterPage, DashboardPage (list+filter+generate+delete), LessonDetailPage, RequireAuth guard
  - [x] T3.9 FE: App.tsx full route table + nav with logout
  - [x] T3.10 FE: 2 LoginPage tests (success + error)
  - [x] T3.11 BE: 18/18 tests; FE: 3/3 tests; all 3 gates green on both
  - [x] T3.12 Coverage: lesson.service 100% lines, auth.service 93.67%, overall 87.7%
  - [x] T3.13 Bug fix: duplicate-email detection now uses Postgres error code 23505 (was message text)
  - [x] T3.14 Bug fix: vitest `fileParallelism: false` for shared-DB test isolation
- [x] Phase 4 — Generator (Gemini + Fallback) ✅
  - [x] T4.1 Split orchestrator into gemini.client + fallback.templates + orchestrator
  - [x] T4.2 Gemini client: `@google/generative-ai`, responseSchema, Promise.race timeout, Zod validation, typed errors
  - [x] T4.3 10 theme profiles × 4 age bands = 40 authored templates (Animals, Colors, Numbers & Counting, Family & Friends, Seasons & Weather, Plants & Gardens, Transport & Vehicles, Water & Bubbles, Shapes, My Body)
  - [x] T4.4 Generic default profile for unknown themes
  - [x] T4.5 Orchestrator: try Gemini, on any failure fall back, log reason, never silently fail
  - [x] T4.6 Exported `AgeGroup` type from schemas
  - [x] T4.7 7 gemini.client tests (success, no key, bad JSON, wrong shape, network throw, timeout, custom model)
  - [x] T4.8 47 fallback.templates tests (ageBand mapping, 11 themes × 4 ages, age variation, unknown theme)
  - [x] T4.9 6 generator.integration tests (gemini success, no key fallback, bad JSON, wrong shape, SDK throw, <10s SLA)
  - [x] T4.10 BE: 78/78 tests; all 3 gates green
  - [x] T4.11 Coverage: gemini.client 98.18%, fallback.templates 99.10%, orchestrator 95.23%, overall 92.62%
  - [x] T4.12 Live smoke: 20ms response, source=fallback, correct content for Animals/4-5
  - [x] T4.13 .env.example updated with section comments and fallback-mode instructions
- [x] Phase 5 — PDF + Frontend ✅
  - [x] T5.1 `pdf.service.ts` — pdfkit A4 stream, 50px margins, structured title/meta/5 sections/footer
  - [x] T5.2 `routes/export.ts` — `GET /api/export/pdf/:id` behind `requireAuth`, owner-scoped via `getLesson`
  - [x] T5.3 Filename pattern `lesson-<slug>-<YYYY-MM-DD>.pdf`; pdfkit stream piped to `res`
  - [x] T5.4 5 pdf.test.ts integration cases (401, 200+`%PDF`, 404 cross-user, 404 non-existent, filename pattern)
  - [x] T5.5 `lib/api.ts` adds `downloadLessonPdf(id, suggestedFilename)` — blob + object URL + programmatic `<a>` click
  - [x] T5.6 `hooks/useLessons.ts` — `{ items, total, loading, generating, deletingId, error }` + `load(theme?)` + `generate(input)` + `remove(id)` (optimistic) + `clearError()`
  - [x] T5.7 `DashboardPage` refactored to use `useLessons`; `SourceBadge` component (violet=AI, amber=Template)
  - [x] T5.8 `LessonDetailPage` refactored to use `downloadLessonPdf` (blob, no `window.open` token leak); shows source badge; "Preparing…" download state
  - [x] T5.9 6 `useLessons.test.ts` cases (load, theme param, error capture, generate success, generate failure, optimistic remove)
  - [x] T5.10 Live smoke: register → generate → download → 2566 bytes, `%PDF` magic, correct filename
  - [x] T5.11 All 6 root gates green (lint, test, build BE+FE, typecheck BE+FE)
  - [x] T5.12 Coverage: `pdf.service` 90.58%, services overall 97.47%
- [x] Phase 4 — Generator (Gemini + Fallback) ✅
- [x] Phase 5 — PDF + Frontend ✅
- [x] Phase 6 — Testing ✅
  - [x] T6.1 Install Playwright + @axe-core/playwright in `frontend/`
  - [x] T6.2 `playwright.config.ts` with chromium-only, `webServer` boots BE + FE preview
  - [x] T6.3 E2E happy path: register → generate → list → detail → PDF download → delete
  - [x] T6.4 E2E ownership: register 2 users, B cannot see A's lesson (404)
  - [x] T6.5 E2E auth guard: anonymous `/dashboard` redirects to `/login`
  - [x] T6.6 A11y axe-core scan on Home, Login, Register, Dashboard, Detail — 0 serious/critical violations
  - [x] T6.7 BE security smokes (supertest): SQLi in theme filter, malformed/expired JWT 401, CORS blocked, body size limit
  - [x] T6.8 BE perf smoke: 50 parallel `/api/lessons/generate` all complete <10s; `/api/export/pdf/:id` p95 <2s
  - [x] T6.9 Color contrast fix: brand-600 darkened (#0284c7→#0369a1) to pass WCAG AA 4.5:1
  - [x] T6.10 Coverage: services 97.49% (≥70%), overall 93.07% (≥50%)
  - [x] T6.11 All 6 root gates green; 9/9 Playwright e2e pass; 91/91 BE tests pass; lint+typecheck+build clean

### Phase 7 — Deployment

> **Goal:** Production-ready app on Render (BE) + Vercel (FE) + Supabase Postgres.

- [ ] T7.1 `vercel.json` — SPA rewrite rules, headers, region
- [ ] T7.2 `render.yaml` — Blueprint for BE web service (Node 20, start command, health check)
- [ ] T7.3 Backend production hardening: graceful shutdown, PORT binding, env validation on startup
- [ ] T7.4 Backend `tsconfig.build.json` — emit source in `dist/` not `dist/src/`
- [ ] T7.5 CI/CD — add deploy-vercel + deploy-render jobs to GitHub Actions
- [ ] T7.6 Create Supabase production project, run migrations
- [ ] T7.7 Deploy BE to Render (env: JWT_SECRET, DATABASE_URL, CORS_ORIGIN, GEMINI_API_KEY, ...)
- [x] T7.1 `vercel.json` — SPA rewrite rules, headers, region
- [x] T7.2 `render.yaml` — Blueprint for BE web service (Node 20, start command, health check) [superseded by Railway]
- [x] T7.3 Backend production hardening: graceful shutdown, PORT binding, env validation on startup
- [x] T7.4 Backend `tsconfig.build.json` — emit source in `dist/` not `dist/src/`
- [x] T7.5 CI/CD — add deploy-vercel + deploy-render jobs to GitHub Actions
- [x] T7.6 ~~Create Supabase production project, run migrations~~ — replaced by Railway Postgres
- [x] T7.7 ~~Deploy BE to Render~~ — replaced by Railway (Supabase is IPv6-only, Render free tier can't reach)
- [x] T7.8 Deploy FE to Vercel (env: VITE_API_BASE → Railway URL)
- [x] T7.9 Live smoke: register → generate → list → PDF → health check against deployed URLs
- [x] T7.10 Deployment README (`DEPLOYMENT.md`) with env checklist, migration commands, rollback steps
- [ ] Phase 8 — Docs & Demo

### Phase 7 verification

| Check                                            | Result                                                                                                                                                                                       |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vercel.json` SPA rewrite + headers              | ✅ deployed at `https://ai-lesson-generator-hazel.vercel.app`                                                                                                                                |
| Railway project + Postgres + Web Service created | ✅ `ai-lesson-generator` (project `8e730a0c-33ad-4c3b-afee-61430bcc4818`)                                                                                                                    |
| Railway env vars (9 total)                       | ✅ JWT_SECRET, JWT_EXPIRES_IN, GEMINI_API_KEY, GEMINI_MODEL, GEMINI_TIMEOUT_MS, NODE_ENV, CORS_ORIGIN, LOG_LEVEL, DATABASE_URL (`${{Postgres.DATABASE_URL}}`)                                |
| Railway migrations run on startup                | ✅ `runMigrations('up')` called before `app.listen` when `NODE_ENV=production`; logs show `MIGRATION 1730000000000_create_users (UP)` and `MIGRATION 1730000000001_create_lesson_plans (UP)` |
| `GET /health` live                               | ✅ 200, `{"ok":true,"service":"ai-lesson-generator-backend","version":"0.1.0","uptime":...,"gemini":"configured"}`                                                                           |
| `POST /api/auth/register` live                   | ✅ 201, returns `{user, token}` with bcrypt hash stored                                                                                                                                      |
| `POST /api/auth/login` live                      | ✅ 200, returns `{user, token}`                                                                                                                                                              |
| `POST /api/lessons/generate` live                | ✅ 201, `source=fallback` (Gemini API reachable but chose fallback due to demo key)                                                                                                          |
| `GET /api/lessons` live                          | ✅ 200, paginated list, ownership filter enforced                                                                                                                                            |
| `GET /api/lessons/:id` live                      | ✅ 200, returns lesson with content                                                                                                                                                          |
| `GET /api/export/pdf/:id` live                   | ✅ 200, `application/pdf`, ~2.5KB                                                                                                                                                            |
| `DELETE /api/lessons/:id` live                   | ✅ 204                                                                                                                                                                                       |
| CORS preflight from Vercel origin                | ✅ 204, `Access-Control-Allow-Origin: https://ai-lesson-generator-hazel.vercel.app`                                                                                                          |
| Vercel `VITE_API_BASE` updated to Railway URL    | ✅ env var `EXzBVoR84MZ9g6At` patched; new bundle `index-xmW1cmVH.js` contains `backend-production-ab33b`                                                                                    |
| Vercel MCP server added to opencode config       | ✅ token in `~/.config/opencode/opencode.jsonc`                                                                                                                                              |
| `DEPLOYMENT.md` updated for Railway              | ✅ reflects new architecture; Render/Supabase removed                                                                                                                                        |
| `CLEANUP.md` for orphaned Render + Supabase      | ✅ documents manual dashboard steps                                                                                                                                                          |
| Render + Supabase orphan services                | ⚠ free tier, $0 cost; manual deletion required (see CLEANUP.md)                                                                                                                              |
| Plan.md updated with Phase 7 status              | ✅                                                                                                                                                                                           |

**Live URLs**

- Frontend (Vercel): `https://ai-lesson-generator-hazel.vercel.app`
- Backend (Railway): `https://backend-production-ab33b.up.railway.app`
- Health: `https://backend-production-ab33b.up.railway.app/health`

### Phase 6 verification

| Check                                         | Result                                                         |
| --------------------------------------------- | -------------------------------------------------------------- |
| `npm run lint` (BE + FE)                      | ✅ 0 errors, 0 warnings                                        |
| `npm --workspace backend run typecheck`       | ✅ clean                                                       |
| `npm --workspace frontend run typecheck`      | ✅ clean                                                       |
| `npm --workspace backend run build`           | ✅ emits `dist/src/*`                                          |
| `npm --workspace frontend run build`          | ✅ emits `dist/index.html` + 223KB JS                          |
| `npm --workspace backend run test`            | ✅ 91/91 (9 files incl. security.smoke + perf.smoke)           |
| `npm --workspace frontend run test`           | ✅ 9/9                                                         |
| `npm --workspace backend run test:coverage`   | ✅ services 97.49%, overall 93.07%                             |
| Playwright e2e (9 tests)                      | ✅ 9/9: happy-path, ownership, auth-guard, a11y (all 5 pages)  |
| A11y axe-core: no serious/critical violations | ✅ All 5 pages pass (Home, Login, Register, Dashboard, Detail) |
| Color contrast WCAG AA                        | ✅ brand-600 #0284c7→#0369a1; button 5.50:1, links 5.50:1      |
| BE security smokes                            | ✅ SQLi safe, malformed/expired JWT 401, CORS blocked origin   |
| BE perf smoke: 50× generate <10s              | ✅ 50/50 succeeded, elapsed within limit                       |
| BE perf smoke: PDF export p95 <2s             | ✅ completed under 2s                                          |
| Plan.md updated                               | ✅                                                             |

### Phase 5 verification

| Check                                       | Result                                                                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint` (BE + FE)                    | ✅ 0 errors, 0 warnings                                                                                                                           |
| `npm --workspace backend run typecheck`     | ✅ clean                                                                                                                                          |
| `npm --workspace frontend run typecheck`    | ✅ clean                                                                                                                                          |
| `npm --workspace backend run build`         | ✅ emits `dist/src/*`                                                                                                                             |
| `npm --workspace frontend run build`        | ✅ emits `dist/index.html` + 223KB JS                                                                                                             |
| `npm --workspace backend run test`          | ✅ 83/83 (3 health + 7 auth + 8 lessons + 7 gemini + 47 fallback + 6 integration + 5 pdf)                                                         |
| `npm --workspace frontend run test`         | ✅ 9/9 (1 HomePage + 2 LoginPage + 6 useLessons)                                                                                                  |
| `npm --workspace backend run test:coverage` | ✅ pdf.service 90.58%, services overall 97.47%                                                                                                    |
| `GET /api/export/pdf/:id` live smoke        | ✅ 200 OK, 2566 bytes, `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="lesson-animals-2026-06-07.pdf"`, magic `%PDF` |
| `GET /api/export/pdf/:id` auth=401          | ✅ no token → 401                                                                                                                                 |
| `GET /api/export/pdf/:id` cross-user=404    | ✅ ownership enforced                                                                                                                             |
| `GET /api/export/pdf/:id` non-existent=404  | ✅ 404                                                                                                                                            |
| Plan.md updated with Phase 5 status         | ✅                                                                                                                                                |

### Phase 4 verification

| Check                                       | Result                                                                            |
| ------------------------------------------- | --------------------------------------------------------------------------------- |
| `npm run lint` (BE + FE)                    | ✅ 0 errors, 0 warnings                                                           |
| `npm --workspace backend run typecheck`     | ✅ clean                                                                          |
| `npm --workspace frontend run typecheck`    | ✅ clean                                                                          |
| `npm --workspace backend run build`         | ✅ emits `dist/src/*`                                                             |
| `npm --workspace frontend run build`        | ✅ emits `dist/index.html` + 222KB JS                                             |
| `npm --workspace backend run test`          | ✅ 78/78 (3 health + 7 auth + 8 lessons + 7 gemini + 47 fallback + 6 integration) |
| `npm --workspace frontend run test`         | ✅ 3/3                                                                            |
| `npm --workspace backend run test:coverage` | ✅ gemini 98.18%, fallback 99.10%, orchestrator 95.23%, overall 92.62%            |
| Gemini happy path (mocked)                  | ✅ `source=gemini`, content = mocked JSON                                         |
| Gemini no API key → fallback                | ✅ `source=fallback`, template content                                            |
| Gemini bad JSON → fallback                  | ✅ `source=fallback`                                                              |
| Gemini wrong shape → fallback               | ✅ `source=fallback`                                                              |
| Gemini SDK throw → fallback                 | ✅ `source=fallback`                                                              |
| End-to-end SLA <10s                         | ✅ 20ms in local smoke                                                            |
| Live HTTP smoke (Animals/4-5)               | ✅ correct 4-5 age-band content                                                   |
| Plan.md updated                             | ✅                                                                                |

### Phase 3 verification

| Check                                            | Result                                      |
| ------------------------------------------------ | ------------------------------------------- |
| `npm run lint` (BE + FE)                         | ✅ 0 errors, 0 warnings                     |
| `npm --workspace backend run typecheck`          | ✅ clean                                    |
| `npm --workspace frontend run typecheck`         | ✅ clean                                    |
| `npm --workspace backend run build`              | ✅ emits `dist/src/*`                       |
| `npm --workspace frontend run build`             | ✅ emits `dist/index.html` + 222KB JS       |
| `npm --workspace backend run test`               | ✅ 18/18 (3 health + 7 auth + 8 lessons)    |
| `npm --workspace frontend run test`              | ✅ 3/3 (1 HomePage + 2 LoginPage)           |
| `npm --workspace backend run test:coverage`      | ✅ lesson.service 100% lines, overall 87.7% |
| `POST /api/lessons/generate` live smoke          | ✅ 201, lesson persisted, source=`fallback` |
| `GET /api/lessons?theme=Animals` live smoke      | ✅ 200, ILIKE filter works                  |
| `GET /api/lessons/:id` cross-user 404            | ✅ ownership enforced                       |
| `DELETE /api/lessons/:id` own = 204, cross = 404 | ✅                                          |
| Bcrypt `$2a$12$...` spot check                   | ✅ Phase 2 still passing                    |
| Plan.md updated with Phase 3 status              | ✅                                          |

### Phase 2 verification

| Check                                                      | Result                                         |
| ---------------------------------------------------------- | ---------------------------------------------- |
| `npm run lint` (BE + FE)                                   | ✅ 0 errors, 0 warnings                        |
| `npm --workspace backend run typecheck`                    | ✅ clean (after `withClient` fix)              |
| `npm --workspace frontend run typecheck`                   | ✅ clean                                       |
| `npm --workspace backend run build`                        | ✅ emits dist/src/\*                           |
| `npm --workspace backend run test`                         | ✅ 10/10 (3 health + 7 auth)                   |
| `npm --workspace frontend run test`                        | ✅ 1/1                                         |
| `npm --workspace backend run test:coverage`                | ✅ auth.service.ts 86.3% lines                 |
| `docker compose up -d`                                     | ✅ `lesson_pg` healthy on :5433                |
| `npm run migrate:up`                                       | ✅ both migrations applied to local PG         |
| `POST /api/auth/register` live smoke                       | ✅ 201, valid JWT, no passwordHash in response |
| Bcrypt hash spot check (`SELECT password_hash FROM users`) | ✅ `$2a$12$...`, 60 chars                      |
| Plan.md updated with D10–D14 + Phase 2 status              | ✅                                             |

### Phase 1 verification

| Check                                          | Result                                   |
| ---------------------------------------------- | ---------------------------------------- |
| Backend `npm run typecheck`                    | ✅ pass                                  |
| Backend `npm run test`                         | ✅ 3/3 tests pass                        |
| Backend `npm run build`                        | ✅ emits dist/src/\*                     |
| Backend `npm start` boots on :4000             | ✅ verified via `tsx src/server.ts`      |
| `GET /health` returns 200 with gemini status   | ✅ `{"ok":true,...,"gemini":"fallback"}` |
| `GET /` returns 200 service info               | ✅                                       |
| `GET /unknown` returns 404 with error envelope | ✅                                       |
| Frontend `npm run typecheck`                   | ✅ pass                                  |
| Frontend `npm run test`                        | ✅ 1/1 test pass                         |
| Frontend `npm run build`                       | ✅ emits dist/\* (205 KB JS, 6.9 KB CSS) |
| Root `npm run lint`                            | ✅ zero warnings, zero errors            |
| Root `npm test`                                | ✅ all green                             |
| Root `npm run build`                           | ✅ both apps build                       |
| Husky pre-commit installed                     | ✅ `.husky/pre-commit`                   |
| GitHub Actions CI defined                      | ✅ `.github/workflows/ci.yml`            |
| Initial commit on main                         | ✅ `8b355b5`                             |

---

## 7. Pre-Implementation Checklist (next agent)

1. `git init` + first commit.
2. Create tooling config (ESLint, Prettier, Vitest, Husky, CI).
3. Scaffold `backend/` and `frontend/` per §5.
4. Verify `npm run lint`, `npm run test`, `npm run build` all green.
5. Hand back for Phase 2 (DB + Auth) greenlight.
