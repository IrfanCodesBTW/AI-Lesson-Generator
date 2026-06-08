import { useLessons } from '../../hooks/useLessons';
import { SectionCard } from '../ui/SectionCard';
import { Sparkles, Layers } from 'lucide-react';

export function AnalyticsTab() {
  const lessons = useLessons();

  const getAiCount = () => {
    return lessons.items.filter((item) => item.source === 'gemini').length;
  };

  const aiPercentage = lessons.total > 0 ? (getAiCount() / lessons.total) * 100 : 0;
  const templatePercentage = lessons.total > 0 ? 100 - aiPercentage : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Generation Distribution */}
        <SectionCard
          title="AI Generation Distribution"
          subtitle="Visual breakdown of your curriculum sources"
          className="md:col-span-2"
        >
          <div className="space-y-6">
            {/* AI Generated Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span
                  className="flex items-center gap-1"
                  style={{ color: 'var(--color-primary-600)' }}
                >
                  <Sparkles className="h-3 w-3" /> AI Generated (Gemini)
                </span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {getAiCount()} / {lessons.total} Plans
                </span>
              </div>
              <div
                className="w-full rounded-full h-3 overflow-hidden"
                style={{ backgroundColor: 'var(--color-hover)' }}
              >
                <div
                  className="h-3 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${aiPercentage}%`,
                    background:
                      'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400))',
                  }}
                />
              </div>
            </div>

            {/* Template Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span
                  className="flex items-center gap-1"
                  style={{ color: 'var(--color-warning-dark)' }}
                >
                  <Layers className="h-3 w-3" /> Local Backup Templates
                </span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {lessons.total - getAiCount()} / {lessons.total} Plans
                </span>
              </div>
              <div
                className="w-full rounded-full h-3 overflow-hidden"
                style={{ backgroundColor: 'var(--color-hover)' }}
              >
                <div
                  className="h-3 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${templatePercentage}%`,
                    background:
                      'linear-gradient(135deg, var(--color-warning), var(--color-warning-dark))',
                  }}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Weekly Summary */}
        <SectionCard title="Weekly Summary">
          <div className="space-y-4 text-xs">
            <div
              className="flex justify-between py-2"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Total Plans Created
              </span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {lessons.total}
              </span>
            </div>
            <div
              className="flex justify-between py-2"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Exports Active
              </span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {parseInt(localStorage.getItem('export_count') || '0', 10)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Active Age Bands
              </span>
              <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                4 Bands (Ages 2-6)
              </span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
