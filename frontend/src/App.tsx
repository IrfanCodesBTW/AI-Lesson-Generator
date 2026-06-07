import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { RequireAuth } from './components/RequireAuth';

function App() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            AI Lesson Plan Generator
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <Link to="/dashboard" className="font-medium text-slate-700 hover:text-slate-900">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="font-medium text-slate-700 hover:text-slate-900">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-brand-600 px-3 py-1.5 font-medium text-white hover:bg-brand-700"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/lessons/:id"
            element={
              <RequireAuth>
                <LessonDetailPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
