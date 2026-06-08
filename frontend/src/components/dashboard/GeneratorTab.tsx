import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessons } from '../../hooks/useLessons';
import { AGE_GROUPS, AgeGroup, THEMES, Theme } from '../../lib/api';
import { SectionCard } from '../ui/SectionCard';
import { Sparkles, Check, ChevronRight, ChevronLeft } from 'lucide-react';

type Step = 1 | 2 | 3;

const themeIcons: Record<string, string> = {
  Animals: '🦁',
  Colors: '🎨',
  'Numbers & Counting': '🔢',
  'Family & Friends': '👨‍👩‍👧',
  'Seasons & Weather': '🌤️',
  'Plants & Gardens': '🌻',
  'Transport & Vehicles': '🚗',
  'Water & Bubbles': '💧',
  Shapes: '🔷',
  'My Body': '🦴',
};

export function GeneratorTab() {
  const navigate = useNavigate();
  const lessons = useLessons();
  const [step, setStep] = useState<Step>(1);
  const [age, setAge] = useState<AgeGroup>('4-5');
  const [theme, setTheme] = useState<Theme>('Animals');

  async function handleGenerate(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    const lesson = await lessons.generate({ ageGroup: age, theme });
    if (lesson) navigate(`/lessons/${lesson.id}`);
  }

  const steps = [
    { num: 1, label: 'Age Group' },
    { num: 2, label: 'Theme' },
    { num: 3, label: 'Generate' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1
          className="text-h2 font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          AI Lesson Plan Generator
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Prompt Gemini to construct step-by-step activity designs tailored by age bands.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 py-4">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={
                step === s.num
                  ? {
                      backgroundColor: 'var(--color-primary-500)',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(109,93,246,.25)',
                    }
                  : step > s.num
                    ? {
                        backgroundColor: 'var(--color-success-light)',
                        color: 'var(--color-success-dark)',
                      }
                    : {
                        backgroundColor: 'var(--color-hover)',
                        color: 'var(--color-text-secondary)',
                      }
              }
            >
              {step > s.num ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs opacity-60">
                  {s.num}
                </span>
              )}
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-8 h-0.5 mx-1"
                style={{
                  backgroundColor:
                    step > s.num ? 'var(--color-success-light)' : 'var(--color-border)',
                }}
              />
            )}
          </div>
        ))}
      </div>

      <SectionCard title="">
        <form onSubmit={handleGenerate}>
          {/* Step 1: Age Group */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-h4 font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Select Age Group
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Choose the age range for your students.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {AGE_GROUPS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAge(a)}
                    className="p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer"
                    style={
                      age === a
                        ? {
                            borderColor: 'var(--color-primary-500)',
                            backgroundColor: 'var(--color-primary-50)',
                            boxShadow: '0 4px 12px rgba(109,93,246,.1)',
                          }
                        : {
                            borderColor: 'var(--color-border)',
                            backgroundColor: 'var(--color-card)',
                          }
                    }
                  >
                    <span
                      className="text-lg font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Ages {a}
                    </span>
                    <span
                      className="block text-xs mt-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Years old
                    </span>
                    {age === a && (
                      <div className="mt-2">
                        <span className="badge-primary">Selected</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary flex items-center gap-2"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Theme */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-h4 font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Select Theme
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Pick a curriculum theme for the lesson.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className="p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer"
                    style={
                      theme === t
                        ? {
                            borderColor: 'var(--color-primary-500)',
                            backgroundColor: 'var(--color-primary-50)',
                            boxShadow: '0 4px 12px rgba(109,93,246,.1)',
                          }
                        : {
                            borderColor: 'var(--color-border)',
                            backgroundColor: 'var(--color-card)',
                          }
                    }
                  >
                    <span className="text-2xl mb-2 block">{themeIcons[t] || '📚'}</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {t}
                    </span>
                    {theme === t && (
                      <div className="mt-2">
                        <span className="badge-primary">Selected</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary flex items-center gap-2"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Generate */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-h4 font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Review & Generate
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Confirm your selections and generate the lesson plan.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: 'var(--color-hover)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Age Group
                  </span>
                  <span
                    className="block text-lg font-bold mt-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Ages {age} Years
                  </span>
                </div>
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: 'var(--color-hover)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Theme
                  </span>
                  <span
                    className="block text-lg font-bold mt-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {themeIcons[theme]} {theme}
                  </span>
                </div>
              </div>

              {lessons.error && (
                <div
                  role="alert"
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{
                    backgroundColor: 'var(--color-danger-light)',
                    border: '1px solid var(--color-danger)',
                    color: 'var(--color-danger)',
                  }}
                >
                  {lessons.error}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="submit"
                  className="btn-primary px-8 py-3 flex items-center gap-2 text-base"
                  disabled={lessons.generating}
                >
                  {lessons.generating ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Constructing Curriculum Plan…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Build Lesson Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </SectionCard>
    </div>
  );
}
