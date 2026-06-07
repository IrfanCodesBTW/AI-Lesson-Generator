import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { RequireAuth } from './components/RequireAuth';
import { SidebarLayout } from './components/SidebarLayout';

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Dashboard/App Pages (Wrapped with Sidebar Layout) */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <SidebarLayout>
              <DashboardPage />
            </SidebarLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/lessons/:id"
        element={
          <RequireAuth>
            <SidebarLayout>
              <LessonDetailPage />
            </SidebarLayout>
          </RequireAuth>
        }
      />

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
