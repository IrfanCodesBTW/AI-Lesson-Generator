import { FileX, Search } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'empty' | 'search';
  action?: React.ReactNode;
}

export function EmptyState({
  title = 'No data found',
  description = 'There are no items to display at this time.',
  icon = 'empty',
  action,
}: EmptyStateProps) {
  const Icon = icon === 'search' ? Search : FileX;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
        style={{
          backgroundColor: 'var(--color-primary-50)',
          border: '1px solid var(--color-primary-100)',
          color: 'var(--color-primary-400)',
        }}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm max-w-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
