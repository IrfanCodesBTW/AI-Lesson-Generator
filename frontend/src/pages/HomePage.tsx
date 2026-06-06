import { useEffect, useState } from 'react';
import { fetchHealth } from '../lib/api';

interface HealthState {
  loading: boolean;
  ok: boolean | null;
  gemini: 'configured' | 'fallback' | null;
  error: string | null;
}

export function HomePage() {
  const [health, setHealth] = useState<HealthState>({
    loading: true,
    ok: null,
    gemini: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetchHealth()
      .then((res) => {
        if (cancelled) return;
        setHealth({ loading: false, ok: res.ok, gemini: res.gemini, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setHealth({ loading: false, ok: false, gemini: null, error: message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-semibold text-slate-900">Welcome</h2>
        <p className="mt-2 text-slate-600">
          Generate age-appropriate lesson plans in seconds. Pick an age group and theme, get a
          complete plan with learning objective, activity, rhyme, worksheet, and materials.
        </p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-slate-900">Backend status</h3>
        {health.loading && <p className="mt-2 text-slate-500">Checking…</p>}
        {health.error && (
          <p className="mt-2 text-red-600" role="alert">
            Backend unreachable: {health.error}
          </p>
        )}
        {!health.loading && !health.error && (
          <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium">{health.ok ? 'Online' : 'Offline'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">AI mode</dt>
              <dd className="font-medium">
                {health.gemini === 'configured' ? 'Gemini (primary)' : 'Template fallback'}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
