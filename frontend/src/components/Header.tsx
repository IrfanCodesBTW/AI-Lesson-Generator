import { Search, Command, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ui/ThemeToggle';

export function Header() {
  const { user } = useAuth();

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dateRange = `${formatDate(monthStart)} - ${formatDate(monthEnd)}`;

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 py-4 mb-6">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-xl">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4"
          style={{ color: 'var(--color-text-muted)' }}
        />
        <input
          type="search"
          placeholder="Search or type a command"
          className="w-full pl-11 pr-16 py-3 rounded-2xl text-sm backdrop-blur-md transition-all duration-200 shadow-sm"
          style={{
            backgroundColor: 'var(--color-card)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          }}
        />
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold rounded-lg px-2 py-1"
          style={{
            backgroundColor: 'var(--color-hover)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Command className="h-3 w-3" />F
        </div>
      </div>

      {/* Date Range Badge */}
      <div
        className="hidden lg:flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium"
        style={{
          backgroundColor: 'var(--color-hover)',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)',
        }}
      >
        <Calendar className="h-3.5 w-3.5" />
        {dateRange}
      </div>

      {/* Right Actions */}
      <div className="hidden md:flex items-center gap-3">
        <ThemeToggle />

        {/* User Avatar */}
        {user && (
          <div className="flex items-center gap-2.5">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-primary-400), var(--color-primary-500))',
              }}
            >
              {user.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <span
              className="text-sm font-semibold hidden xl:block"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
