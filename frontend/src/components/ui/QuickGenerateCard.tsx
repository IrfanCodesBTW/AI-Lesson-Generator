import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowUpRight } from 'lucide-react';

export function QuickGenerateCard() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/dashboard?tab=generator')}
      className="relative cursor-pointer group pt-5"
    >
      {/* Floating Pill */}
      <div
        className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-[90%] rounded-full py-2.5 px-4 flex items-center justify-between shadow-lg z-10 transition-all duration-200"
        style={{
          backgroundColor: 'var(--color-card-elevated)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="h-6 w-6 rounded-full flex items-center justify-center text-white shadow-sm"
            style={{
              backgroundColor: 'var(--color-primary-500)',
              boxShadow: '0 2px 8px rgba(109,93,246,.25)',
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h2
            className="text-xs font-extrabold tracking-wider uppercase"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Quick Generate
          </h2>
        </div>
        <div
          className="h-6 w-6 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-hover)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Main Card */}
      <div
        className="relative h-44 rounded-3xl overflow-hidden flex items-end p-6 shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
        style={{
          backgroundColor: '#0B0F19',
          border: '1px solid rgba(255,255,255,.06)',
        }}
      >
        {/* Glowing background gradients */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              'linear-gradient(135deg, rgba(109,93,246,.2), rgba(139,123,255,.1), transparent)',
          }}
        />
        <div
          className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-2xl"
          style={{ backgroundColor: 'rgba(109,93,246,.3)' }}
        />
        <div
          className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-2xl"
          style={{ backgroundColor: 'rgba(109,93,246,.15)' }}
        />

        {/* Glossy reflection */}
        <div
          className="absolute inset-0 rotate-12 scale-150 transform translate-x-12 translate-y-12"
          style={{
            background: 'linear-gradient(135deg, transparent, rgba(255,255,255,.03), transparent)',
          }}
        />

        <div className="relative z-10 w-full">
          <h3 className="text-base font-bold text-white leading-snug tracking-tight">
            Generate a new lesson
            <br />
            plan instantly!
          </h3>
        </div>
      </div>
    </div>
  );
}
