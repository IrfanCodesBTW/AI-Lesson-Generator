import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLessons } from '../hooks/useLessons';
import { AGE_GROUPS, AgeGroup, THEMES, Theme } from '../lib/api';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const lessons = useLessons();
  const [filter, setFilter] = useState('');
  const [age, setAge] = useState<AgeGroup>('4-5');
  const [theme, setTheme] = useState<Theme>('Animals');

  useEffect(() => {
    void lessons.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const lesson = await lessons.generate({ ageGroup: age, theme });
    if (lesson) navigate(`/lessons/${lesson.id}`);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this lesson? This cannot be undone.')) return;
    await lessons.remove(id);
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back, {user?.name}.</p>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Sign out
        </button>
      </header>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Generate a new lesson</h2>
        <form onSubmit={handleGenerate} className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="label" htmlFor="age">
              Age group
            </label>
            <select
              id="age"
              className="input"
              value={age}
              onChange={(e) => setAge(e.target.value as AgeGroup)}
            >
              {AGE_GROUPS.map((a) => (
                <option key={a} value={a}>
                  {a} years
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="label" htmlFor="theme">
              Theme
            </label>
            <select
              id="theme"
              className="input"
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full" disabled={lessons.generating}>
              {lessons.generating ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </form>
        {lessons.error && (
          <div role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {lessons.error}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            Your lessons{' '}
            <span className="text-sm font-normal text-gray-500">({lessons.total})</span>
          </h2>
          <div className="flex items-center gap-2">
            <label htmlFor="filter" className="sr-only">
              Filter by theme
            </label>
            <input
              id="filter"
              type="search"
              placeholder="Filter by theme…"
              className="input w-48"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void lessons.load(filter);
              }}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={() => void lessons.load(filter)}
            >
              Search
            </button>
          </div>
        </div>

        {lessons.loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : lessons.items.length === 0 ? (
          <div className="card text-center text-sm text-gray-500">
            No lessons yet. Generate your first one above.
          </div>
        ) : (
          <ul className="space-y-3">
            {lessons.items.map((lesson) => (
              <li key={lesson.id} className="card flex items-center justify-between gap-4">
                <Link to={`/lessons/${lesson.id}`} className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{lesson.theme}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Ages {lesson.ageGroup}</span>
                    <span>·</span>
                    <span>{new Date(lesson.createdAt).toLocaleString()}</span>
                    <SourceBadge source={lesson.source} />
                  </div>
                </Link>
                <button
                  type="button"
                  className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                  disabled={lessons.deletingId === lesson.id}
                  onClick={() => void handleDelete(lesson.id)}
                >
                  {lessons.deletingId === lesson.id ? 'Deleting…' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SourceBadge({ source }: { source: 'gemini' | 'fallback' }) {
  const label = source === 'gemini' ? 'AI' : 'Template';
  const cls = source === 'gemini' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700';
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}
    >
      {label}
    </span>
  );
}
