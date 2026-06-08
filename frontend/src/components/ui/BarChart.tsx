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

const defaultBarColors = [
  'bg-[#2F6FD6]', // Sun - Blue
  'bg-[#F04D3A]', // Mon - Red
  'bg-[#FFD633]', // Tue - Yellow
  'bg-[#2F6FD6]', // Wed - Blue
  'bg-[#3BAA63]', // Thu - Green
  'bg-[#F04D3A]', // Fri - Red
  'bg-[#FFD633]', // Sat - Yellow
];

export function BarChart({ data, maxValue, height = 120, showLabels = true }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-3" style={{ height }}>
      {data.map((item, index) => {
        // Fallback color based on index if no specific color is supplied
        const barColorClass = item.color || defaultBarColors[index % defaultBarColors.length];

        // Ensure even 0 value has a tiny bar for visual consistency as shown in mock
        const displayValue = item.value === 0 ? 1.5 : item.value;
        const barHeight = Math.max((displayValue / max) * (height - 32), 12);

        return (
          <div key={item.label} className="flex flex-col items-center justify-end flex-1 gap-2">
            <div
              className={`w-full max-w-8 rounded-t-[8px] border-[3px] border-black dark:border-white transition-all duration-300 ${barColorClass}`}
              style={{
                height: `${barHeight}px`,
              }}
            />
            {showLabels && (
              <span className="text-[10px] font-black tracking-wider uppercase text-text-secondary">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
