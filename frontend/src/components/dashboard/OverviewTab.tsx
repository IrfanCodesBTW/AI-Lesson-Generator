import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLessons } from '../../hooks/useLessons';
import { MetricCard } from '../ui/MetricCard';
import { BarChart } from '../ui/BarChart';
import { InsightCard } from '../ui/InsightCard';
import { QuickGenerateCard } from '../ui/QuickGenerateCard';
import { SectionCard } from '../ui/SectionCard';
import { StatusBadge } from '../ui/StatusBadge';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingDown, BookOpen, ClipboardList, CheckSquare, Users } from 'lucide-react';

export function OverviewTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const lessons = useLessons();

  const getLessonsThisWeek = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return lessons.items.filter((item) => new Date(item.createdAt) >= oneWeekAgo).length;
  };

  const weeklyData = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 6 },
    { label: 'Tue', value: 3 },
    { label: 'Wed', value: 8 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 6 },
    { label: 'Sat', value: 0 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1
          className="text-3xl font-extrabold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Hello, {user?.name || 'Teacher'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Monitor your AI-powered lesson planning and classroom insights in real time.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Lessons"
              value={lessons.total}
              trend="+12%"
              subtitle="since last month"
              icon={ClipboardList}
            />
            <MetricCard
              title="Lessons This Week"
              value={getLessonsThisWeek()}
              trend="+5%"
              subtitle="since last week"
              icon={CheckSquare}
            />
            <MetricCard
              title="AI Accuracy"
              value="92%"
              trend="+1%"
              subtitle="since last week"
              icon={Users}
            />
          </div>

          {/* Weekly Planning Trends */}
          <SectionCard
            title="Weekly Planning Trends"
            subtitle="Daily Focus hours"
            headerRight={
              <span
                className="text-xs font-semibold rounded-xl px-3 py-1.5"
                style={{
                  backgroundColor: 'var(--color-hover)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Week
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-2">
                <div
                  className="text-4xl font-extrabold tracking-tight"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  12 h
                </div>
                <div
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  logged this week
                </div>
                <span
                  className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-2.5 py-0.5"
                  style={{
                    color: 'var(--color-success-dark)',
                    backgroundColor: 'var(--color-success-light)',
                    border: '1px solid var(--color-success-light)',
                  }}
                >
                  ↑ +10% vs last week
                </span>
              </div>
              <div className="md:col-span-2">
                <BarChart data={weeklyData} height={120} />
              </div>
            </div>
          </SectionCard>

          {/* Recent Lesson Plans Table */}
          <SectionCard
            title="Recent Lesson Plans"
            headerRight={
              <button
                onClick={() => navigate('/dashboard?tab=library')}
                className="text-xs font-semibold transition-colors cursor-pointer"
                style={{ color: 'var(--color-primary-500)' }}
              >
                View All Library →
              </button>
            }
          >
            {lessons.loading ? (
              <div className="space-y-3 py-4">
                <div className="skeleton h-12 w-full rounded-xl" />
                <div className="skeleton h-12 w-full rounded-xl" />
              </div>
            ) : lessons.items.length === 0 ? (
              <div
                className="py-8 text-center text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                No lessons yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr
                      className="text-xs uppercase tracking-wider font-bold"
                      style={{
                        color: 'var(--color-text-secondary)',
                        borderBottom: '1px solid var(--color-border)',
                      }}
                    >
                      <th className="py-3 pr-4 font-semibold">Plan Title</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 pl-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.items.slice(0, 3).map((lesson) => {
                      const dateStr = new Date(lesson.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                      return (
                        <tr
                          key={lesson.id}
                          className="transition-colors group"
                          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <td className="py-3.5 pr-4">
                            <Link
                              to={`/lessons/${lesson.id}`}
                              className="font-bold transition-colors"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {lesson.theme}
                            </Link>
                            <span
                              className="block text-[11px] font-medium mt-0.5"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              Ages {lesson.ageGroup}
                            </span>
                          </td>
                          <td
                            className="py-3.5 px-4 font-medium"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {dateStr}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={lesson.source === 'gemini' ? 'ai' : 'template'} />
                          </td>
                          <td className="py-3.5 pl-4 text-right">
                            <Link
                              to={`/lessons/${lesson.id}`}
                              className="text-xs font-bold transition-colors"
                              style={{ color: 'var(--color-primary-500)' }}
                            >
                              Edit/View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Quick Generate CTA */}
          <QuickGenerateCard />

          {/* AI Insights */}
          <SectionCard title="AI Insights" subtitle="Real-time suggestions">
            <div className="space-y-3">
              <InsightCard
                title="Classroom Engagement"
                description="Increased engagement observed during hands-on activities."
                icon={Sparkles}
                iconBg="bg-primary-50 border-primary-100"
                iconColor="text-primary-600"
              />
              <InsightCard
                title="Learning Gaps & Support"
                description="Identify students needing extra support in letter recognition."
                icon={TrendingDown}
                iconBg="bg-warning-light/50 border-warning-light"
                iconColor="text-warning-dark"
              />
              <InsightCard
                title="Resource Suggestions"
                description="New printable resources recommended for next week's theme."
                icon={BookOpen}
                iconBg="bg-success-light/30 border-success-light"
                iconColor="text-success-dark"
              />
            </div>
          </SectionCard>

          {/* API Environment Status */}
          <SectionCard title="API Environment">
            <div className="space-y-3 text-xs">
              <div
                className="flex justify-between py-1.5"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Service Status
                </span>
                <span className="font-bold" style={{ color: 'var(--color-success-dark)' }}>
                  Online
                </span>
              </div>
              <div
                className="flex justify-between py-1.5"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Generation Mode
                </span>
                <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Gemini (primary)
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  API Version
                </span>
                <span
                  className="font-mono font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  v0.1.0
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
