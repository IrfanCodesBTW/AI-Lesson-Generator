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
    <section className={`card ${className}`}>
      {hasHeader && (
        <div className="flex items-center justify-between mb-5 pb-2">
          <div>
            {title && (
              <h2
                className="text-2xl font-black font-heading"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className="text-xs font-semibold mt-0.5"
                style={{ color: 'var(--color-text-secondary)' }}
              >
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
