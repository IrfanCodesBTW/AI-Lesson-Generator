import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchHealth } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import {
  GraduationCap,
  Sparkles,
  Activity,
  ArrowRight,
  CheckCircle,
  BarChart3,
  FileText,
  Zap,
} from 'lucide-react';

interface HealthState {
  loading: boolean;
  ok: boolean | null;
  gemini: 'configured' | 'fallback' | null;
  error: string | null;
}

function useIntersectionObserver(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useIntersectionObserver();

  useEffect(() => {
    if (!isVisible) return;
    let current = 0;
    const steps = 40;
    const increment = end / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [end, isVisible]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [health, setHealth] = useState<HealthState>({
    loading: true,
    ok: null,
    gemini: null,
    error: null,
  });

  const featuresSection = useIntersectionObserver(0.1);
  const statsSection = useIntersectionObserver(0.1);

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
    <div
      className="min-h-screen flex flex-col justify-between theme-transition"
      style={{
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-10 backdrop-blur-md theme-transition"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(8,8,13,0.8)' : 'rgba(255,255,255,0.8)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400))',
                boxShadow: '0 4px 12px rgba(109,93,246,.2)',
              }}
            >
              <span className="text-sm font-black">Ai</span>
            </div>
            <span
              className="font-extrabold tracking-tight text-lg"
              style={{ color: 'var(--color-text-primary)' }}
            >
              AI Lesson Plan Generator
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-sm font-semibold">
            <ThemeToggle />
            {user ? (
              <Link
                to="/dashboard"
                className="btn-primary py-2.5 px-5 inline-flex items-center gap-1.5"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="transition-colors px-3 py-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary py-2.5 px-5">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="mx-auto max-w-6xl px-6 flex-1 flex flex-col">
        <div className="py-20 md:py-28 flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              border: '1px solid var(--color-primary-100)',
            }}
          >
            <Sparkles className="h-3.5 w-3.5" /> Early Education AI Command Suite
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Generate preschool lesson plans <span className="gradient-text">in seconds.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            AI Lesson Plan Generator empowers teachers to construct age-appropriate learning
            objectives, step-by-step activities, classroom rhymes, and worksheets in a single click.
          </p>

          {/* CTA */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
            {user ? (
              <Link
                to="/dashboard"
                className="btn-primary py-4 px-8 text-base inline-flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary py-4 px-8 text-base inline-flex items-center gap-2"
                >
                  Get Started for Free <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary py-4 px-8 text-base inline-flex items-center gap-2"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Stats Row (Animated counters) ── */}
        <div
          ref={statsSection.ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 pb-16 transition-all duration-700 ${
            statsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {[
            { label: 'Lessons Generated', value: 2400, suffix: '+', icon: FileText },
            { label: 'AI Accuracy', value: 92, suffix: '%', icon: Zap },
            { label: 'Active Teachers', value: 500, suffix: '+', icon: BarChart3 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-md theme-transition"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                className="mx-auto h-12 w-12 rounded-xl flex items-center justify-center mb-3"
                style={{
                  backgroundColor: 'var(--color-primary-50)',
                  color: 'var(--color-primary-500)',
                }}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div
                className="text-3xl font-extrabold tracking-tight"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div
                className="text-xs font-semibold uppercase tracking-wider mt-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Feature Cards ── */}
        <div
          ref={featuresSection.ref}
          className={`grid md:grid-cols-3 gap-6 pb-16 transition-all duration-700 delay-150 ${
            featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {[
            {
              icon: Sparkles,
              title: 'Gemini AI Integration',
              description:
                'Dynamically tailors learning plans to custom themes using Google\u2019s AI capabilities.',
              accentBg: 'var(--color-primary-50)',
              accentBorder: 'var(--color-primary-100)',
              accentColor: 'var(--color-primary-500)',
            },
            {
              icon: CheckCircle,
              title: 'Deterministic Fallbacks',
              description:
                'Maintains high-reliability generation using pre-authored templates if AI is offline.',
              accentBg: 'var(--color-warning-light)',
              accentBorder: 'var(--color-warning-light)',
              accentColor: 'var(--color-warning-dark)',
            },
            {
              icon: GraduationCap,
              title: 'Structured PDF Exports',
              description:
                'Streams formatted, printable PDFs directly to your device for immediate classroom use.',
              accentBg: 'var(--color-info-light)',
              accentBorder: 'var(--color-info-light)',
              accentColor: 'var(--color-info-dark)',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl p-6 space-y-3 transition-all duration-200 hover:shadow-md hover:-translate-y-1 theme-transition"
              style={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: feature.accentBg,
                  border: `1px solid ${feature.accentBorder}`,
                  color: feature.accentColor,
                }}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {feature.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* ── System Status Card ── */}
        <div
          className="max-w-md mx-auto mb-16 p-6 rounded-2xl backdrop-blur-sm space-y-4 theme-transition"
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="flex items-center gap-2 pb-3"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <Activity className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
            <h2
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              System Connection Status
            </h2>
          </div>

          {health.loading && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Verifying API health probe…
            </p>
          )}
          {health.error && (
            <p className="text-sm" role="alert" style={{ color: 'var(--color-danger)' }}>
              API Connection failure: {health.error}
            </p>
          )}
          {!health.loading && !health.error && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span
                  className="block font-semibold"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Backend Status
                </span>
                <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {health.ok ? 'Online' : 'Offline'}
                </span>
              </div>
              <div>
                <span
                  className="block font-semibold"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  AI Deployment
                </span>
                <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {health.gemini === 'configured' ? 'Gemini AI (Primary)' : 'Template Fallback'}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="py-8 theme-transition"
        style={{
          backgroundColor: 'var(--color-card)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div
          className="mx-auto max-w-6xl px-6 text-center text-xs font-semibold tracking-wide uppercase"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          &copy; {new Date().getFullYear()} AI Lesson Plan Generator. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
