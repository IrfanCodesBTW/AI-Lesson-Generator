import { useTheme } from '../../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 cursor-pointer"
      style={{
        backgroundColor: 'var(--color-hover)',
        color: 'var(--color-text-secondary)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-active)';
        e.currentTarget.style.color = 'var(--color-text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-hover)';
        e.currentTarget.style.color = 'var(--color-text-secondary)';
      }}
    >
      <div className="relative h-5 w-5">
        <Sun
          className="absolute inset-0 h-5 w-5 transition-all duration-300"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'rotate(90deg) scale(0)' : 'rotate(0) scale(1)',
          }}
        />
        <Moon
          className="absolute inset-0 h-5 w-5 transition-all duration-300"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'rotate(0) scale(1)' : 'rotate(-90deg) scale(0)',
          }}
        />
      </div>
    </button>
  );
}
