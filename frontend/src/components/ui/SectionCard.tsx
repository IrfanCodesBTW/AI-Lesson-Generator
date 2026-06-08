import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  subtitle,
  headerRight,
  children,
  className = '',
}: SectionCardProps) {
  const hasHeader = title || subtitle || headerRight;
  return (
    <section
      className={`rounded-2xl p-6 theme-transition ${className}`}
      style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {hasHeader && (
        <div
          className="flex items-center justify-between mb-5 pb-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div>
            {title && (
              <h2 className="text-h4 font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
