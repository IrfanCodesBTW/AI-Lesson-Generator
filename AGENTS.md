# AGENTS.md

## Repo state

- Greenfield: only `PRD.md` and `Prompt.md` exist. Not a git repo. No `package.json`, no source, no tooling, no CI.
- Source of truth for product scope: `PRD.md`. Read it before any work.
- `Prompt.md` is a project-management methodology — reference for context, do not enforce as a coding process.

## Mandated tech stack (do not substitute)

- Frontend: React, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express.js
- Database: PostgreSQL
- AI: Google Gemini API
- Deployment: Vercel (frontend), Render (backend)

## Core features

- Auth: register, login (preschool teachers)
- Lesson plan generator: input age group + theme + date; output learning objective, activity, rhyme, worksheet idea, materials required
- Dashboard: list, search by theme, open details, delete
- PDF export of a saved lesson

## AI behavior

- Primary path: Google Gemini API
- Fallback path: rule-based template generator — if Gemini fails, generation must still succeed via templates, never silently fail
- SLA: lesson must generate within 10 seconds end-to-end

## API surface to implement

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/lessons/generate`
- `GET /api/lessons`
- `GET /api/lessons/:id`
- `DELETE /api/lessons/:id`
- `GET /api/export/pdf/:id`

## Database schema

- `users`: id, name, email, password
- `lesson_plans`: id, user_id, age_group, theme, lesson_content, created_at

## Out of scope (defer)

- Parent portal, WhatsApp integration, admin dashboard, lesson sharing, analytics, multi-center management, mobile app (all listed in PRD "Future Scope")

## Scaffolding note

- Next agent must create `package.json`, lint/format config, run `git init`, and add a basic `.gitignore` before any feature work. No existing test framework, CI, or hooks.
