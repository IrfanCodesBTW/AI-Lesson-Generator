import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ui/ThemeToggle';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  BarChart3,
  FolderHeart,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
  Library,
  HelpCircle,
} from 'lucide-react';

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';
  const isLessonDetailPage = location.pathname.startsWith('/lessons/');

  const mainNavItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard?tab=overview' },
    { id: 'generator', label: 'Generator', icon: Sparkles, path: '/dashboard?tab=generator' },
    { id: 'library', label: 'My Lessons', icon: BookOpen, path: '/dashboard?tab=library' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/dashboard?tab=analytics' },
    { id: 'templates', label: 'Templates', icon: FolderHeart, path: '/dashboard?tab=templates' },
  ];

  const toolNavItems = [
    { id: 'resources', label: 'Time Tracker', icon: Clock, path: '/dashboard?tab=resources' },
    {
      id: 'resources2',
      label: 'Resource Library',
      icon: Library,
      path: '/dashboard?tab=resources',
    },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard?tab=settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (itemId: string) => {
    if (isLessonDetailPage) return itemId === 'library';
    return currentTab === itemId && location.pathname === '/dashboard';
  };

  const NavItem = ({ item }: { item: (typeof mainNavItems)[0] }) => {
    const ActiveIcon = item.icon;
    const active = isActive(item.id);
    return (
      <Link
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer select-none group ${
          active ? 'text-white shadow-md' : ''
        }`}
        style={
          active
            ? {
                backgroundColor: 'var(--color-primary-500)',
                boxShadow: '0 4px 12px rgba(109,93,246,.25)',
              }
            : {}
        }
      >
        <ActiveIcon
          className={`h-[18px] w-[18px] transition-colors duration-200 ${
            active
              ? 'text-white'
              : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]'
          }`}
        />
        <span
          className={
            active
              ? 'text-white'
              : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'
          }
        >
          {item.label}
        </span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div
      className="flex h-full flex-col overflow-hidden theme-transition"
      style={{
        backgroundColor: 'var(--color-sidebar)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      <div className="flex-1 flex flex-col justify-between px-4 py-6 overflow-y-auto">
        <div className="space-y-7">
          {/* Brand / Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-2 hover:opacity-90 transition-opacity"
          >
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
            <div>
              <span
                className="block text-base font-extrabold tracking-tight leading-tight"
                style={{ color: 'var(--color-text-primary)' }}
              >
                AI Lesson Plan
                <br />
                Generator
              </span>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav aria-label="Main navigation" className="space-y-1">
            <span
              className="block text-[10px] font-bold uppercase tracking-widest px-3 mb-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Main
            </span>
            {mainNavItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>

          {/* Tools Navigation */}
          <nav aria-label="Tools navigation" className="space-y-1">
            <span
              className="block text-[10px] font-bold uppercase tracking-widest px-3 mb-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Tools
            </span>
            {toolNavItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-3 pt-4">
          {/* Help Card */}
          <div
            className="rounded-2xl p-4 text-center space-y-3"
            style={{
              backgroundColor: 'var(--color-hover)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: 'var(--color-primary-50)',
                color: 'var(--color-primary-500)',
              }}
            >
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Need help?
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Feel free to contact us
              </p>
            </div>
            <button
              className="w-full rounded-xl py-2 text-xs font-bold text-white transition-all duration-200 cursor-pointer hover:opacity-90"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400))',
              }}
            >
              Get support
            </button>
          </div>

          {/* Theme Toggle & User Section */}
          <div className="pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
            {/* Theme Toggle */}
            <div className="flex items-center justify-between px-3 py-2 mb-2">
              <span
                className="text-xs font-semibold"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Theme
              </span>
              <ThemeToggle />
            </div>

            {/* User Card */}
            {user && (
              <div
                className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
                style={{ backgroundColor: 'var(--color-hover)' }}
              >
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-primary-400), var(--color-primary-500))',
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'T'}
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className="block text-sm font-bold truncate leading-snug"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {user.name}
                  </span>
                  <span
                    className="block text-[11px] font-medium truncate mt-0.5"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {user.email}
                  </span>
                </div>
              </div>
            )}

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-danger-light)';
                e.currentTarget.style.color = 'var(--color-danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="flex min-h-screen theme-transition"
      style={{
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-20 md:block md:w-[260px]">
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col md:pl-[260px] relative overflow-hidden">
        {/* Luminous Background Blobs */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30"
            style={{
              background:
                'linear-gradient(135deg, var(--color-primary-100), var(--color-accent-light))',
            }}
          />
          <div
            className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20"
            style={{
              background:
                'linear-gradient(135deg, var(--color-success-light), var(--color-warning-light))',
            }}
          />
        </div>

        {/* Mobile Navbar Header */}
        <header
          className="sticky top-0 z-10 flex h-16 items-center justify-between px-4 md:hidden backdrop-blur-md"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-card) 80%, transparent)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <Link to="/dashboard" className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-400))',
              }}
            >
              Ai
            </div>
            <span
              className="text-base font-extrabold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              AI Lesson Plan Generator
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-xl p-2 cursor-pointer transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Mobile Drawer (Overlay) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 backdrop-blur-sm transition-opacity"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              onClick={() => setMobileOpen(false)}
            />
            <div
              className="relative flex w-full max-w-xs flex-1 flex-col animate-slide-up"
              style={{ backgroundColor: 'var(--color-sidebar)' }}
            >
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="rounded-xl p-2 cursor-pointer transition-colors"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
