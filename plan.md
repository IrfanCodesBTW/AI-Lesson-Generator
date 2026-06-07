# AI Lesson Plan Generator — Master Execution Plan

> **Project:** Web app for preschool teachers to auto-generate age-appropriate lesson plans via Google Gemini with a rule-based fallback.
> **Mandated stack (AGENTS.md):** React + Vite + Tailwind + Axios (FE) · Node + Express (BE) · PostgreSQL (DB) · Google Gemini API (AI) · Vercel (FE) + Render (BE).
> **Status:** Phase 3 — Lesson CRUD. Plan is phase-ordered, not date-anchored.

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
- [ ] Phase 4 — Generator (Gemini + Fallback)
- [ ] Phase 5 — PDF + Frontend
- [ ] Phase 6 — Testing
- [ ] Phase 7 — Deployment
- [ ] Phase 8 — Docs & Demo

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
