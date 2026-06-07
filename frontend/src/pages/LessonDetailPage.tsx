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
import { SourceBadge } from '../components/SourceBadge';
import {
  ArrowLeft,
  FileDown,
  Trash2,
  Sparkles,
  GraduationCap,
  Hammer,
  Music,
  Edit3,
  Bookmark,
} from 'lucide-react';

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

      // Increment exports counter in localStorage for dashboard metrics
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
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-24 w-full animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-40 md:col-span-2 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 text-center">
        <div className="card space-y-3">
          <p role="alert" className="text-sm font-bold text-red-700">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            {lesson.theme}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mt-1">
            <span>Ages {lesson.ageGroup}</span>
            <span>·</span>
            <span>{new Date(lesson.createdAt).toLocaleString()}</span>
            <SourceBadge source={lesson.source} />
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-secondary py-2 px-3 text-slate-500 hover:text-slate-900 flex items-center gap-1.5"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            <Sparkles className="h-4 w-4 text-slate-400" />
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
            className="btn-secondary py-2 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-1.5"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 text-red-400" />
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Lesson Detail Sections */}
        <div className="lg:col-span-2 space-y-6">
          <DetailSection title="Learning Objective" icon={GraduationCap}>
            <p className="text-base font-medium text-slate-800 leading-relaxed">{c.objective}</p>
          </DetailSection>

          <DetailSection title="Classroom Activity" icon={Hammer}>
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
              {c.activity}
            </pre>
          </DetailSection>

          <DetailSection title="Rhyme / Song" icon={Music}>
            <pre className="whitespace-pre-wrap font-sans text-sm italic text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {c.rhyme}
            </pre>
          </DetailSection>

          <DetailSection title="Worksheet Idea" icon={Edit3}>
            <p className="text-sm text-slate-700 leading-relaxed">{c.worksheet}</p>
          </DetailSection>
        </div>

        {/* Sidebar Materials Panel */}
        <div className="space-y-6">
          <div className="card bg-gradient-to-br from-brand-600/5 to-brand-500/5 border-brand-100/50">
            <div className="flex items-center gap-2 mb-4 border-b border-brand-100/30 pb-3">
              <Bookmark className="h-5 w-5 text-brand-600" />
              <h2 className="text-base font-bold text-slate-900">Materials Required</h2>
            </div>
            <ul className="space-y-2.5">
              {c.materials.map((m, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
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

/* Local Helper Component */

interface DetailSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function DetailSection({ title, icon: Icon, children }: DetailSectionProps) {
  return (
    <section className="card">
      <div className="flex items-center gap-2 mb-3.5 border-b border-slate-100 pb-2.5">
        <Icon className="h-4.5 w-4.5 text-slate-500" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}
