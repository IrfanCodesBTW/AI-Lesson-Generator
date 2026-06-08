interface StatusBadgeProps {
  status: 'generated' | 'draft' | 'reviewed' | 'ai' | 'template';
  className?: string;
}

const statusConfig = {
  generated: {
    label: 'Generated',
    cssVarBg: 'var(--color-success-light)',
    cssVarText: 'var(--color-success-dark)',
    cssVarBorder: 'var(--color-success-light)',
  },
  draft: {
    label: 'Draft',
    cssVarBg: 'var(--color-warning-light)',
    cssVarText: 'var(--color-warning-dark)',
    cssVarBorder: 'var(--color-warning-light)',
  },
  reviewed: {
    label: 'Reviewed',
    cssVarBg: 'var(--color-info-light)',
    cssVarText: 'var(--color-info-dark)',
    cssVarBorder: 'var(--color-info-light)',
  },
  ai: {
    label: 'AI',
    cssVarBg: 'var(--color-primary-50)',
    cssVarText: 'var(--color-primary-600)',
    cssVarBorder: 'var(--color-primary-100)',
  },
  template: {
    label: 'Template',
    cssVarBg: 'var(--color-warning-light)',
    cssVarText: 'var(--color-warning-dark)',
    cssVarBorder: 'var(--color-warning-light)',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${className}`}
      style={{
        backgroundColor: config.cssVarBg,
        color: config.cssVarText,
        border: `1px solid ${config.cssVarBorder}`,
      }}
    >
      {config.label}
    </span>
  );
}

// Keep SourceBadge compatible with existing usage
interface SourceBadgeProps {
  source: 'gemini' | 'fallback';
  className?: string;
}

export function SourceBadge({ source, className = '' }: SourceBadgeProps) {
  return <StatusBadge status={source === 'gemini' ? 'ai' : 'template'} className={className} />;
}
