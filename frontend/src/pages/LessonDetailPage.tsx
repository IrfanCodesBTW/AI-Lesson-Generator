import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { downloadLessonPdf, fetchLesson, getApiError, Lesson } from '../lib/api';

export function LessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchLesson(id)
      .then(setLesson)
      .catch((err) => setError(getApiError(err).message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handlePdf() {
    if (!id || !lesson) return;
    setDownloading(true);
    setError(null);
    try {
      const filename = `lesson-${lesson.theme.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${lesson.createdAt.slice(0, 10)}.pdf`;
      await downloadLessonPdf(id, filename);
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (error)
    return (
      <div className="card space-y-3">
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
        <Link to="/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  if (!lesson) return null;

  const c = lesson.lessonContent;
  const sourceLabel = lesson.source === 'gemini' ? 'AI-generated' : 'Template';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lesson.theme}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>Ages {lesson.ageGroup}</span>
            <span>·</span>
            <span>{new Date(lesson.createdAt).toLocaleString()}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                lesson.source === 'gemini'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {sourceLabel}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard" className="btn-secondary">
            Back
          </Link>
          <button type="button" className="btn-primary" onClick={handlePdf} disabled={downloading}>
            {downloading ? 'Preparing…' : 'Export PDF'}
          </button>
        </div>
      </div>

      <Section title="Learning Objective">{c.objective}</Section>
      <Section title="Activity">
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">{c.activity}</pre>
      </Section>
      <Section title="Rhyme">
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">{c.rhyme}</pre>
      </Section>
      <Section title="Worksheet Idea">{c.worksheet}</Section>
      <Section title="Materials Required">
        <ul className="list-inside list-disc text-sm text-gray-800">
          {c.materials.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      <div className="text-sm text-gray-800">{children}</div>
    </section>
  );
}
