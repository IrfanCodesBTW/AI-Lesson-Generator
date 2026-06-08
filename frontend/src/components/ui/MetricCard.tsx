import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down';
  subtitle?: string;
  icon?: LucideIcon;
}

export function MetricCard({
  title,
  value,
  trend,
  trendDirection = 'up',
  subtitle = 'since last month',
  icon: Icon,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState<string | number>(0);

  useEffect(() => {
    if (typeof value === 'number') {
      const duration = 800;
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <div
      className="relative rounded-2xl p-5 flex flex-col justify-between min-h-[140px] transition-all duration-300 hover:shadow-md group theme-transition"
      style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'var(--color-hover)',
              color: 'var(--color-text-muted)',
            }}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-3">
        <span
          className="block text-3xl font-extrabold tracking-tight leading-none animate-count-up"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {displayValue}
        </span>

        {/* Trend + Subtitle */}
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className="inline-flex items-center gap-0.5 text-[11px] font-bold"
              style={{
                color:
                  trendDirection === 'up' ? 'var(--color-success-dark)' : 'var(--color-danger)',
              }}
            >
              {trendDirection === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {subtitle}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
