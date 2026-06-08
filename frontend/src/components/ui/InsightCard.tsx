import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  linkText?: string;
  onLinkClick?: () => void;
}

export function InsightCard({
  title,
  description,
  icon: Icon,
  iconBg,
  iconColor,
  linkText = 'View Details',
  onLinkClick,
}: InsightCardProps) {
  return (
    <div
      className="rounded-2xl p-4 transition-all duration-200 space-y-3 group theme-transition"
      style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor} border border-opacity-30`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h3>
          <p
            className="text-xs leading-relaxed mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {description}
          </p>
        </div>
      </div>
      <button
        onClick={onLinkClick}
        className="text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
        style={{ color: 'var(--color-primary-500)' }}
      >
        {linkText}
      </button>
    </div>
  );
}
