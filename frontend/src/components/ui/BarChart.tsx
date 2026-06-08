interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  height?: number;
  showLabels?: boolean;
}

export function BarChart({ data, maxValue, height = 120, showLabels = true }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item) => {
        const barHeight = item.value > 0 ? Math.max((item.value / max) * (height - 32), 8) : 0;
        const isActive = item.value > 0;

        return (
          <div key={item.label} className="flex flex-col items-center justify-end flex-1 gap-2">
            {isActive ? (
              <div
                className="w-full max-w-8 rounded-lg transition-all duration-500"
                style={{
                  height: barHeight,
                  backgroundColor: 'var(--color-primary-500)',
                  boxShadow: '0 2px 8px rgba(109,93,246,.15)',
                }}
              />
            ) : (
              <div
                className="w-4 h-4 rounded-full shadow-sm mb-1"
                style={{
                  backgroundColor: 'var(--color-card)',
                  border: '2px solid var(--color-border)',
                }}
              />
            )}
            {showLabels && (
              <span
                className="text-[10px] font-bold tracking-wider uppercase"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
