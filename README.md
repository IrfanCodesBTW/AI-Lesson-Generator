# AI Lesson Plan Generator

A web application that helps preschool teachers auto-generate age-appropriate lesson
plans. A teacher picks an age group, a theme, and a date, and the system returns a
structured plan with a learning objective, an activity, a rhyme, a worksheet idea,
and a materials list. Generated lessons are saved to a personal dashboard, can be
searched by theme, and can be exported as a PDF.

The generator uses Google Gemini as the primary path and falls back to a
rule-based template engine so that lesson generation always succeeds, even with
no API key, no network, or Gemini downtime.

## Features

- Auth — email + password registration and login for preschool teachers.
- Lesson generator — input `ageGroup`, `theme`, `lessonDate`; output objective,
  activity, rhyme, worksheet idea, materials.
- Dashboard — list saved lessons, search by theme, open details, delete.
- PDF export — download any saved lesson as a printable PDF.
- AI with safety net — Gemini primary, deterministic templates as a guaranteed
  fallback. End-to-end generation SLA is 10 seconds.
- Security baseline — JWT auth, bcrypt password hashing, helmet headers, CORS
  allow-list, rate limiting, zod input validation.

## Tech stack

| Layer    | Tech                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| Frontend | React 18, Vite 5, Tailwind CSS 3, Axios, React Router 6, TypeScript                  |
| Backend  | Node 20, Express 4, TypeScript 5, Zod, Pino                                          |
| Database | PostgreSQL 16 (Supabase-compatible), `node-pg-migrate`                               |
| AI       | `@google/generative-ai` (Gemini 1.5 Flash) + rule-based templates                    |
| Auth     | JWT (jsonwebtoken) + bcryptjs                                                        |
| PDF      | pdfkit                                                                               |
| Tests    | Vitest (unit + integration + perf + security smoke), Playwright (E2E + a11y via axe) |
| Tooling  | ESLint, Prettier, Husky, lint-staged, GitHub Actions CI                              |
| Deploy   | Vercel (frontend), Railway (backend + database)                                      |

## Project structure

```
.
├── backend/                Express + TypeScript API
│   ├── src/
│   │   ├── routes/         auth, lessons, export, health
│   │   ├── services/       gemini, fallback templates, generator orchestrator, pdf
│   │   ├── schemas/        zod request/response schemas
│   │   ├── middleware/     auth, error handler
│   │   ├── lib/            db, logger, supabase, migrations runner
│   │   └── config/         env loading and validation
│   ├── migrations/         node-pg-migrate SQL migrations
│   └── tests/              vitest suites
├── frontend/               React + Vite SPA
│   ├── src/
│   │   ├── pages/          HomePage, LoginPage, RegisterPage, DashboardPage, LessonDetailPage
│   │   ├── components/     RequireAuth
│   │   ├── context/        AuthContext
│   │   ├── hooks/          useAuth, useLessons
│   │   └── lib/            api (axios client)
│   ├── e2e/                Playwright specs (happy path, auth guard, ownership, a11y)
│   └── tests/              Vitest + Testing Library
├── docker-compose.yml      Local Postgres on port 5433
├── .github/workflows/      CI (lint + typecheck + test)
└── DEPLOYMENT.md           Step-by-step deploy guide
```

The monorepo is an npm workspace. Install once at the root and both packages
get their dependencies.

## Quick start

### Prerequisites

- Node.js 20 or newer (see `.nvmrc`)
- npm 10 or newer
- Docker (for the local Postgres), or a Supabase project

### 1. Install

```bash
npm install
```

This installs the root dev dependencies (Prettier, Husky, lint-staged) and
the workspaces (`backend`, `frontend`).

### 2. Start the database

```bash
docker compose up -d
```

This brings up Postgres on `localhost:5433` with user `lesson`, password
`lesson`, database `lesson_dev`. To use a hosted Supabase project instead,
fill in `DATABASE_URL` and `DATABASE_DIRECT_URL` in `backend/.env`.

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` to point `DATABASE_URL` at your database and set a strong
`JWT_SECRET` (32+ random characters). `GEMINI_API_KEY` is optional — leave it
empty to use the rule-based fallback only.

Get a Gemini key at <https://aistudio.google.com/app/apikey>.

### 4. Run migrations

```bash
npm run migrate:up --workspace backend
```

The backend also runs migrations automatically on production startup.

### 5. Start the dev servers

```bash
npm run dev:backend    # http://localhost:4000
npm run dev:frontend   # http://localhost:5173
```

The frontend reads `VITE_API_BASE` from `frontend/.env` and defaults to
`http://localhost:4000`. Open <http://localhost:5173>, register a teacher
account, and generate a lesson.

## Scripts

Run from the repository root unless noted.

| Script                 | What it does                                      |
| ---------------------- | ------------------------------------------------- |
| `npm run dev:backend`  | Start the API with `tsx watch` (auto-reload)      |
| `npm run dev:frontend` | Start the Vite dev server                         |
| `npm run build`        | Build backend (`tsc`) and frontend (`tsc + vite`) |
| `npm run lint`         | ESLint both workspaces, warnings are errors       |
| `npm run test`         | Run Vitest in both workspaces                     |
| `npm run format`       | Prettier write across the repo                    |
| `npm run format:check` | Prettier check (CI mode)                          |
| `npm run typecheck`    | `tsc --noEmit` per workspace                      |
| `npm run migrate:up`   | Apply pending DB migrations (backend)             |
| `npm run migrate:down` | Roll back the last migration (backend)            |

## API reference

All `/api/lessons/*` and `/api/export/*` routes require a `Bearer` JWT in the
`Authorization` header. Register or login to obtain a token.

| Method | Path                    | Auth | Description                                                                                    |
| ------ | ----------------------- | ---- | ---------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/register`    | no   | Create a teacher account. Returns JWT + user.                                                  |
| POST   | `/api/auth/login`       | no   | Authenticate, return JWT + user.                                                               |
| POST   | `/api/lessons/generate` | yes  | Generate a lesson from `ageGroup`, `theme`, `lessonDate`. Persists and returns the saved plan. |
| GET    | `/api/lessons`          | yes  | List the caller's lessons (newest first).                                                      |
| GET    | `/api/lessons/:id`      | yes  | Fetch one lesson. 404 if it is not the caller's.                                               |
| DELETE | `/api/lessons/:id`      | yes  | Delete one lesson. 404 if it is not the caller's.                                              |
| GET    | `/api/export/pdf/:id`   | yes  | Stream a PDF rendering of the lesson.                                                          |
| GET    | `/health`               | no   | Liveness probe. Returns version, uptime, Gemini status.                                        |

### Request shape — `POST /api/lessons/generate`

```json
{
  "ageGroup": "3-4",
  "theme": "Ocean Animals",
  "lessonDate": "2026-06-08"
}
```

### Response shape — lesson object

```json
{
  "id": "uuid",
  "ageGroup": "3-4",
  "theme": "Ocean Animals",
  "lessonDate": "2026-06-08",
  "lessonContent": {
    "objective": "...",
    "activity": "...",
    "rhyme": "...",
    "worksheet": "...",
    "materials": ["..."]
  },
  "source": "gemini",
  "createdAt": "2026-06-07T12:34:56.000Z"
}
```

`source` is `"gemini"` when generated by the API, `"fallback"` when generated
by the rule-based templates.

## Database schema

`users`

| Column     | Type        | Notes           |
| ---------- | ----------- | --------------- |
| id         | uuid        | primary key     |
| name       | text        |                 |
| email      | text        | unique          |
| password   | text        | bcrypt hash     |
| created_at | timestamptz | default `now()` |

`lesson_plans`

| Column         | Type        | Notes                                            |
| -------------- | ----------- | ------------------------------------------------ |
| id             | uuid        | primary key                                      |
| user_id        | uuid        | foreign key → `users.id`                         |
| age_group      | text        |                                                  |
| theme          | text        | indexed for search                               |
| lesson_date    | date        |                                                  |
| lesson_content | jsonb       | objective, activity, rhyme, worksheet, materials |
| source         | text        | `gemini` or `fallback`                           |
| created_at     | timestamptz | default `now()`, indexed desc                    |

Migrations live in `backend/migrations/` and are applied with
`node-pg-migrate`.

## AI behavior

The generator is implemented in
`backend/src/services/generator.orchestrator.ts`:

1. Try Gemini with `GEMINI_TIMEOUT_MS` (default `8000`) and the model
   `GEMINI_MODEL` (default `gemini-1.5-flash`).
2. If Gemini throws, times out, returns malformed JSON, or the env var is
   empty, call the rule-based template engine
   (`backend/src/services/fallback.templates.ts`).
3. Persist the result with the actual `source` so the UI can show which
   path produced the lesson.

Generation must complete within 10 seconds end-to-end. The fallback is
deterministic and never blocks on a network call.

## Testing

- Unit and integration tests live in `backend/tests/` and `frontend/tests/`
  and run with Vitest. Coverage is published from `vitest run --coverage`.
- End-to-end specs live in `frontend/e2e/` and run with Playwright. The
  `a11y` spec uses `@axe-core/playwright` to assert no serious WCAG
  violations on the main flows.
- A perf smoke test (`backend/tests/perf.smoke.test.ts`) and a security
  smoke test (`backend/tests/security.smoke.test.ts`) guard the 10-second
  SLA and the basic auth / ownership / rate-limit posture.

```bash
npm test                                        # all vitest suites
npm run test --workspace backend                # backend only
npm run test --workspace frontend               # frontend only
npx playwright test --config frontend/playwright.config.ts
```

## Deployment

The production target is:

- Frontend — Vercel, root directory `frontend`, build `npm run build`, output `dist`.
- Backend & Database — Railway, root directory `backend`, build `npm install && npm run build`, start `npm start`. Migrations run automatically on startup.

The backend service is linked to a managed PostgreSQL database service on Railway, with env variables mapped accordingly. The frontend reads `VITE_API_BASE` at build time to communicate with the Railway API.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full step-by-step, including environment variables, smoke tests, and how to rotate the Gemini key.

## Linting, formatting, and hooks

- ESLint config: `backend/.eslintrc.cjs`, `frontend/.eslintrc.cjs`. Both
  run with `--max-warnings 0`.
- Prettier config: `.prettierrc.json` at the root.
- Husky `pre-commit` hook runs `lint-staged`, which formats staged files
  with Prettier.
- GitHub Actions runs lint, typecheck, and tests on every push and pull
  request — see `.github/workflows/ci.yml`.

## Out of scope

Per the product brief, the following are intentionally deferred: parent
portal, WhatsApp integration, admin dashboard, lesson sharing, analytics
dashboard, multi-center management, and the mobile app.
