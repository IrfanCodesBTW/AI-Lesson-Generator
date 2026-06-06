# AI Lesson Plan Generator

A web application for preschool teachers to auto-generate age-appropriate lesson plans via Google Gemini with a rule-based fallback.

**Stack:** React + Vite + Tailwind + Axios (FE) · Node + Express + TypeScript (BE) · PostgreSQL · Google Gemini API · Vercel (FE) + Render (BE).

See [plan.md](./plan.md) for the full execution plan and [PRD.md](./PRD.md) for product requirements.

## Quick start

```bash
# Backend
cd backend
cp .env.example .env       # fill in GEMINI_API_KEY and DATABASE_URL
npm install
npm run dev                # http://localhost:4000

# Frontend (new terminal)
cd frontend
cp .env.example .env       # set VITE_API_BASE
npm install
npm run dev                # http://localhost:5173
```

## Scripts (run from repo root)

```bash
npm run lint               # lint both apps
npm run test               # run all tests
npm run build              # build both apps
npm run dev:backend        # start backend in dev mode
npm run dev:frontend       # start frontend in dev mode
```

## License

MIT
