import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  downloadLessonPdf,
  fetchLesson,
  getApiError,
  generateLesson,
  deleteLesson,
  Lesson,
} from '../lib/api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SectionCard } from '../components/ui/SectionCard';
import { ArrowLeft, FileDown, Trash2, Sparkles, Bookmark } from 'lucide-react';

export function LessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

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

      const count = parseInt(localStorage.getItem('export_count') || '0', 10);
      localStorage.setItem('export_count', (count + 1).toString());
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setDownloading(false);
    }
  }

  async function handleDelete() {
    if (!id || !lesson) return;
    if (!confirm('Delete this lesson plan? This cannot be undone.')) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteLesson(id);
      navigate('/dashboard?tab=library');
    } catch (err) {
      setError(getApiError(err).message);
      setDeleting(false);
    }
  }

  async function handleRegenerate() {
    if (!lesson) return;
    setRegenerating(true);
    setError(null);
    try {
      const newLesson = await generateLesson({
        ageGroup: lesson.ageGroup,
        theme: lesson.theme,
      });
      navigate(`/lessons/${newLesson.id}`);
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setRegenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8 animate-fade-in">
        <div className="skeleton h-10 w-24 rounded-xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="skeleton h-40 md:col-span-2 rounded-2xl" />
          <div className="skeleton h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 text-center animate-fade-in">
        <div className="card space-y-3">
          <p role="alert" className="text-sm font-bold" style={{ color: 'var(--color-danger)' }}>
            {error}
          </p>
          <Link
            to="/dashboard?tab=library"
            className="btn-secondary w-full inline-flex items-center gap-1.5 justify-center"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  const c = lesson.lessonContent;

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Navigation Header */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="space-y-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors"
            style={{ color: 'var(--color-primary-500)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {lesson.theme}
          </h1>
          <div
            className="flex flex-wrap items-center gap-2 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span>Ages {lesson.ageGroup}</span>
            <span style={{ color: 'var(--color-border)' }}>·</span>
            <span>{new Date(lesson.createdAt).toLocaleString()}</span>
            <StatusBadge status={lesson.source === 'gemini' ? 'ai' : 'template'} />
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-secondary py-2 px-3 flex items-center gap-1.5"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            <Sparkles className="h-4 w-4" />
            {regenerating ? 'Regenerating…' : 'Regenerate'}
          </button>
          <button
            type="button"
            className="btn-primary py-2 px-3 flex items-center gap-1.5"
            onClick={handlePdf}
            disabled={downloading}
          >
            <FileDown className="h-4 w-4" />
            {downloading ? 'Preparing…' : 'Export PDF'}
          </button>
          <button
            type="button"
            className="btn-danger py-2 px-3 flex items-center gap-1.5"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            backgroundColor: 'var(--color-danger-light)',
            border: '1px solid var(--color-danger)',
            color: 'var(--color-danger)',
          }}
        >
          {error}
        </div>
      )}

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Lesson Detail Sections */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Learning Objective">
            <p
              className="text-base font-medium leading-relaxed"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {c.objective}
            </p>
          </SectionCard>

          <SectionCard title="Classroom Activity">
            <pre
              className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {c.activity}
            </pre>
          </SectionCard>

          <SectionCard title="Rhyme / Song">
            <pre
              className="whitespace-pre-wrap font-sans text-sm italic leading-relaxed p-4 rounded-xl"
              style={{
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-hover)',
                border: '1px solid var(--color-border)',
              }}
            >
              {c.rhyme}
            </pre>
          </SectionCard>

          <SectionCard title="Worksheet Idea">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {c.worksheet}
            </p>
          </SectionCard>
        </div>

        {/* Sidebar Materials Panel */}
        <div className="space-y-6">
          <div
            className="rounded-2xl p-6 theme-transition"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="flex items-center gap-2 mb-4 pb-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <Bookmark className="h-5 w-5" style={{ color: 'var(--color-primary-500)' }} />
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Materials Required
              </h2>
            </div>
            <ul className="space-y-2.5">
              {c.materials.map((m, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <div
                    className="h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-primary-400)' }}
                  />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
