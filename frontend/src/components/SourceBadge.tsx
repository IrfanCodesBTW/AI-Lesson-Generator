interface SourceBadgeProps {
  source: 'gemini' | 'fallback';
  className?: string;
}

export function SourceBadge({ source, className = '' }: SourceBadgeProps) {
  const isGemini = source === 'gemini';
  const label = isGemini ? 'AI' : 'Template';
  const cls = isGemini
    ? 'bg-purple-100 text-purple-700 border border-purple-200/50'
    : 'bg-amber-100 text-amber-700 border border-amber-200/50';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${cls} ${className}`}
    >
      {label}
    </span>
  );
}
