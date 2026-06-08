import { GraduationCap, ChevronRight } from 'lucide-react';
import { SourceBadge } from './StatusBadge';
import { Lesson } from '../../lib/api';

interface TemplateCardProps {
  lesson: Lesson;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  deleting?: boolean;
}

export function TemplateCard({ lesson, onView, onDelete, deleting }: TemplateCardProps) {
  return (
    <div
      className="flex flex-col justify-between rounded-2xl p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group theme-transition"
      style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Banner Header */}
      <div
        className="-mx-6 -mt-6 mb-5 h-24 rounded-t-2xl p-4 flex items-end justify-between"
        style={{
          background: 'linear-gradient(135deg, rgba(109,93,246,.08), rgba(109,93,246,.03))',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
          style={{
            backgroundColor: 'var(--color-card)',
            color: 'var(--color-primary-500)',
            border: '1px solid var(--color-border)',
          }}
        >
          <GraduationCap className="h-5 w-5" />
        </div>
        <SourceBadge source={lesson.source} />
      </div>

      <div className="space-y-2 flex-1">
        <button
          onClick={() => onView(lesson.id)}
          className="block text-lg font-bold leading-snug text-left cursor-pointer transition-colors"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {lesson.theme}
        </button>
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <span>Ages {lesson.ageGroup}</span>
          <span style={{ color: 'var(--color-border)' }}>·</span>
          <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
        </div>
        <p
          className="text-xs line-clamp-2 mt-2 leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {lesson.lessonContent.objective}
        </p>
      </div>

      <div
        className="flex items-center justify-between pt-4 mt-5"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <button
          onClick={() => onView(lesson.id)}
          className="text-xs font-semibold flex items-center gap-0.5 cursor-pointer transition-colors"
          style={{ color: 'var(--color-primary-500)' }}
        >
          Open Plan <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="p-2 transition-colors rounded-lg cursor-pointer"
          style={{ color: 'var(--color-text-muted)' }}
          disabled={deleting}
          aria-label="Delete lesson"
          onClick={() => onDelete(lesson.id)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-danger-light)';
            e.currentTarget.style.color = 'var(--color-danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          {deleting ? (
            <div
              className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--color-danger)', borderTopColor: 'transparent' }}
            />
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
