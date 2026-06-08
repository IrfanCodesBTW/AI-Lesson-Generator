import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getApiError, loginUser } from '../lib/api';
import { useTheme } from '../hooks/useTheme';
import { Lock, Mail, GraduationCap, CheckCircle } from 'lucide-react';

export function LoginPage() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await loginUser({ email: email.trim(), password });
      setAuth(result.user, result.token);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex animate-fade-in theme-transition"
      style={{ backgroundColor: 'var(--color-canvas)' }}
    >
      {/* Left Side - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background:
            theme === 'dark'
              ? 'linear-gradient(135deg, #1a1030, #0e0e16)'
              : 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))',
        }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div
            className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: 'rgba(109,93,246,.2)' }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                AI Lesson Plan Generator
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
                Welcome back to
                <br />
                your classroom.
              </h1>
              <p className="text-lg text-white/80 leading-relaxed max-w-md">
                Continue generating AI-powered lesson plans that inspire young minds.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              {[
                'AI-powered lesson generation',
                'Structured curriculum plans',
                'PDF export ready',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-16">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
          <div
            className="lg:hidden inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{
              background:
                'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400))',
              boxShadow: '0 4px 14px rgba(109,93,246,.2)',
            }}
          >
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Sign in to AI Lesson Plan Generator
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Enter your credentials to manage and auto-generate preschool lessons.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div
            className="mx-4 sm:mx-0 p-8 rounded-2xl space-y-6"
            style={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="label" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <input
                    id="email"
                    type="email"
                    className="input pl-11"
                    placeholder="name@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                  <input
                    id="password"
                    type="password"
                    className="input pl-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{
                    backgroundColor: 'var(--color-danger-light)',
                    border: '1px solid var(--color-danger)',
                    color: 'var(--color-danger)',
                  }}
                >
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in…
                    </>
                  ) : (
                    <>Sign in</>
                  )}
                </button>
              </div>
            </form>

            <div
              className="pt-5 text-center text-sm"
              style={{
                borderTop: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              New here?{' '}
              <Link
                to="/register"
                className="font-semibold hover:underline"
                style={{ color: 'var(--color-primary-500)' }}
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
