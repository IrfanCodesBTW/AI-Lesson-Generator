import { useNavigate } from 'react-router-dom';
import { useLessons } from '../../hooks/useLessons';
import { Theme, AgeGroup } from '../../lib/api';
import { Sparkles } from 'lucide-react';

interface TemplatePreset {
  theme: Theme;
  age: AgeGroup;
  description: string;
  icon: string;
}

const templatePresets: TemplatePreset[] = [
  {
    theme: 'Animals',
    age: '3-4',
    description: 'Learn about wild and domestic animals through rhymes and play.',
    icon: '🦁',
  },
  {
    theme: 'Colors',
    age: '2-3',
    description: 'Introduce primary colors using shapes and classroom objects.',
    icon: '🎨',
  },
  {
    theme: 'Shapes',
    age: '4-5',
    description: 'Explore geometry through blocks, drawings, and visual exercises.',
    icon: '🔷',
  },
  {
    theme: 'Seasons & Weather',
    age: '5-6',
    description: 'Analyze atmospheric changes and clothing adaptations.',
    icon: '🌤️',
  },
];

export function TemplatesTab() {
  const navigate = useNavigate();
  const lessons = useLessons();

  async function handleQuickGenerate(quickAge: AgeGroup, quickTheme: Theme) {
    const lesson = await lessons.generate({ ageGroup: quickAge, theme: quickTheme });
    if (lesson) navigate(`/lessons/${lesson.id}`);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-h2 font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Pre-authored Templates
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Select a pre-configured age group and theme to generate the lesson plan immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templatePresets.map((preset) => (
          <div
            key={preset.theme}
            className="flex flex-col justify-between p-6 rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 theme-transition"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--color-primary-500)' }}
                >
                  Ages {preset.age} Years
                </span>
                <span
                  className="badge text-xs"
                  style={{
                    backgroundColor: 'var(--color-hover)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  Preset
                </span>
              </div>
              <div className="text-3xl">{preset.icon}</div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {preset.theme}
              </h3>
              <p
                className="text-xs leading-relaxed line-clamp-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {preset.description}
              </p>
            </div>
            <button
              onClick={() => void handleQuickGenerate(preset.age, preset.theme)}
              disabled={lessons.generating}
              className="btn-secondary w-full text-xs font-bold py-2.5 mt-4 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {lessons.generating ? (
                <>
                  <div
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent"
                    style={{
                      borderColor: 'var(--color-text-secondary)',
                      borderTopColor: 'transparent',
                    }}
                  />
                  Processing…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Preset
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
