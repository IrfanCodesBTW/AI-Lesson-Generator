import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getApiError, registerUser } from '../lib/api';
import { Lock, Mail, User } from 'lucide-react';

export function RegisterPage() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setAuth(result.user, result.token);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex animate-fade-in bg-canvas">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#8D6BE8] dark:bg-zinc-800 border-r-[4px] border-black dark:border-white">
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="space-y-8">
            <div className="flex items-center gap-3 select-none">
              <img
                src="/logo.png"
                className="h-12 w-12 rounded-full border-[3px] border-black shadow-[2px_2px_0px_#000] object-cover bg-white"
                alt="AI Plan Lesson Generator Logo"
              />
              <span className="text-xl font-black font-heading text-black drop-shadow-[1px_1px_0px_white]">
                AI Plan Lesson Generator
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-black font-heading leading-tight text-white text-stroke-black">
                Begin your
                <br />
                journey.
              </h1>
              <p className="text-lg font-semibold text-white/95 leading-relaxed max-w-md">
                Join educators using AI to create engaging, structured lesson plans for early
                childhood learners.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {['Free to get started', 'Generate lessons in seconds', 'Export to PDF anytime'].map(
                (feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border-[2px] border-black bg-white text-black shadow-[1px_1px_0px_#000]">
                      ✓
                    </span>
                    <span className="text-sm font-black text-white">{feature}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-16 bg-canvas">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
          <img
            src="/logo.png"
            className="lg:hidden inline-flex h-12 w-12 rounded-full border-[3px] border-black shadow-[2px_2px_0px_#000] object-cover bg-white"
            alt="AI Plan Lesson Generator Logo"
          />
          <div>
            <h1 className="text-3xl font-black font-heading text-text-primary">
              Create your account
            </h1>
            <p className="text-sm font-semibold mt-2 text-text-secondary">
              Set up your teacher profile to start generating AI-powered lesson plans.
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mx-4 sm:mx-0 p-8 card space-y-6 bg-card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="label" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 stroke-[2.5] text-text-muted" />
                  <input
                    id="name"
                    type="text"
                    className="input pl-11"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 stroke-[2.5] text-text-muted" />
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
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 stroke-[2.5] text-text-muted" />
                  <input
                    id="password"
                    type="password"
                    className="input pl-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-[16px] px-4 py-3 text-sm font-black border-[3px] border-black bg-red-100 text-red-700 animate-fade-in"
                >
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary w-full py-3 h-12 flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating account…
                    </>
                  ) : (
                    <>Create Account</>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-5 text-center text-sm font-semibold border-t-[2px] border-black dark:border-white text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="font-black hover:underline text-primary-500">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
