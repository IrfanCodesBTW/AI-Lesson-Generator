import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  BarChart3,
  FolderHeart,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Parse active tab from URL query params
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';
  const isLessonDetailPage = location.pathname.startsWith('/lessons/');

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard?tab=overview' },
    {
      id: 'generator',
      label: 'Lesson Generator',
      icon: Sparkles,
      path: '/dashboard?tab=generator',
    },
    { id: 'library', label: 'My Lessons', icon: BookOpen, path: '/dashboard?tab=library' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/dashboard?tab=analytics' },
    { id: 'templates', label: 'Templates', icon: FolderHeart, path: '/dashboard?tab=templates' },
    { id: 'resources', label: 'Resources', icon: HelpCircle, path: '/dashboard?tab=resources' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard?tab=settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (itemId: string) => {
    if (isLessonDetailPage) {
      return itemId === 'library'; // Treat detail page as part of My Lessons library
    }
    return currentTab === itemId && location.pathname === '/dashboard';
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200/80 px-4 py-6">
      <div className="space-y-6">
        {/* Brand / Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 px-3 py-1 hover:opacity-90 transition-opacity"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-base font-bold tracking-tight text-slate-900 leading-tight">
              CurriculumAI
            </span>
            <span className="block text-xs font-semibold text-brand-600 tracking-wide uppercase">
              Teacher Suite
            </span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const ActiveIcon = item.icon;
            const active = isActive(item.id);
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 px-3.5 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer select-none group ${
                  active
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ActiveIcon
                  className={`h-5 w-5 transition-colors duration-200 ${
                    active ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session Info / Logout */}
      <div className="border-t border-slate-100 pt-4">
        {user && (
          <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100/50 mb-3">
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Teacher Profile
              </span>
              <span className="block text-sm font-bold text-slate-900 truncate leading-snug mt-0.5">
                {user.name}
              </span>
              <span className="block text-[11px] font-medium text-slate-600 truncate mt-0.5">
                {user.email}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3.5 px-3.5 py-3 text-sm font-semibold rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 cursor-pointer select-none"
        >
          <LogOut className="h-5 w-5 text-red-400 group-hover:text-red-600" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]/40 text-slate-900">
      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-20 md:block md:w-[280px]">
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col md:pl-[280px] relative overflow-hidden bg-slate-50/50">
        {/* Soft Luminous Background Blobs */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#E0F2FE]/30 to-[#F3E8FF]/30 blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#FAE8FF]/30 to-[#FFEDD5]/20 blur-[130px]" />
        </div>

        {/* Mobile Navbar Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-4 md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-brand-600" />
            <span className="text-base font-bold tracking-tight text-slate-900">CurriculumAI</span>
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Mobile Drawer (Overlay) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* Overlay background */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer sheet */}
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
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
