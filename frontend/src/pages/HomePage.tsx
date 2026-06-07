import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchHealth } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, Sparkles, Activity, ArrowRight, CheckCircle } from 'lucide-react';

interface HealthState {
  loading: boolean;
  ok: boolean | null;
  gemini: 'configured' | 'fallback' | null;
  error: string | null;
}

export function HomePage() {
  const { user } = useAuth();
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between animate-fade-in">
      {/* Landing Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">
              CurriculumAI
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold">
            {user ? (
              <Link
                to="/dashboard"
                className="rounded-xl bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Body Section */}
      <main className="mx-auto max-w-4xl px-4 py-16 flex-1 flex flex-col justify-center space-y-12">
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" /> Early Education AI Command Suite
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Generate preschool lesson plans in seconds.
          </h1>
          <p className="text-base md:text-lg text-slate-500 leading-relaxed">
            CurriculumAI empowers teachers to construct age-appropriate learning objectives,
            step-by-step activities, classroom rhymes, and worksheets in a single click.
          </p>
          <div className="pt-2">
            {user ? (
              <Link
                to="/dashboard"
                className="btn-primary py-3 px-6 text-base inline-flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn-primary py-3 px-6 text-base inline-flex items-center gap-2"
              >
                Get Started for Free <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid md:grid-cols-3 gap-6 pt-4">
          <div className="card p-5 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Gemini AI Integration</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dynamically tailors learning plans to custom themes using Google&apos;s AI
              capabilities.
            </p>
          </div>
          <div className="card p-5 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <CheckCircle className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Deterministic Fallbacks</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Maintains high-reliability generation using pre-authored templates if AI is offline.
            </p>
          </div>
          <div className="card p-5 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <GraduationCap className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Structured PDF Exports</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Streams formatted, printable PDFs directly to your device for immediate classroom use.
            </p>
          </div>
        </div>

        {/* Environment / Health Check Card */}
        <div className="card max-w-md mx-auto p-5 border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Activity className="h-4 w-4 text-slate-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              System Connection Status
            </h2>
          </div>

          {health.loading && <p className="text-xs text-slate-600">Verifying API health probe…</p>}
          {health.error && (
            <p className="text-xs text-red-600" role="alert">
              API Connection failure: {health.error}
            </p>
          )}
          {!health.loading && !health.error && (
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-600 block font-semibold">Backend Status</span>
                <span className="font-bold text-slate-700">{health.ok ? 'Online' : 'Offline'}</span>
              </div>
              <div>
                <span className="text-slate-600 block font-semibold">AI Deployment</span>
                <span className="font-bold text-slate-700">
                  {health.gemini === 'configured' ? 'Gemini AI (Primary)' : 'Template Fallback'}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Landing Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-slate-600 font-semibold tracking-wide uppercase">
          &copy; {new Date().getFullYear()} CurriculumAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
