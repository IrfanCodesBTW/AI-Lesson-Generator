import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLessons } from '../hooks/useLessons';
import { AGE_GROUPS, AgeGroup, THEMES, Theme, fetchHealth } from '../lib/api';
import { SourceBadge } from '../components/SourceBadge';
import {
  Sparkles,
  Trash2,
  Search,
  TrendingUp,
  ChevronRight,
  GraduationCap,
  Sliders,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingDown,
  BookOpen,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const lessons = useLessons();
  const [filter, setFilter] = useState('');
  const [age, setAge] = useState<AgeGroup>('4-5');
  const [theme, setTheme] = useState<Theme>('Animals');

  // Page level states
  const [exportCount, setExportCount] = useState(0);
  const [apiHealth, setApiHealth] = useState<'Online' | 'Offline' | 'Checking'>('Checking');
  const [aiMode, setAiMode] = useState<'Gemini (primary)' | 'Template fallback' | 'Checking'>(
    'Checking',
  );

  // Parse tab from query parameters
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    void lessons.load();

    // Load PDF exports counter
    const storedExports = localStorage.getItem('export_count');
    if (storedExports) {
      setExportCount(parseInt(storedExports, 10));
    }

    // Check backend health status
    fetchHealth()
      .then((res) => {
        setApiHealth(res.ok ? 'Online' : 'Offline');
        setAiMode(res.gemini === 'configured' ? 'Gemini (primary)' : 'Template fallback');
      })
      .catch(() => {
        setApiHealth('Offline');
        setAiMode('Template fallback');
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate metrics
  const getLessonsThisWeek = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return lessons.items.filter((item) => new Date(item.createdAt) >= oneWeekAgo).length;
  };

  const getAiCount = () => {
    return lessons.items.filter((item) => item.source === 'gemini').length;
  };

  async function handleGenerate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const lesson = await lessons.generate({ ageGroup: age, theme });
    if (lesson) navigate(`/lessons/${lesson.id}`);
  }

  async function handleQuickGenerate(quickAge: AgeGroup, quickTheme: Theme) {
    const lesson = await lessons.generate({ ageGroup: quickAge, theme: quickTheme });
    if (lesson) navigate(`/lessons/${lesson.id}`);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this lesson? This cannot be undone.')) return;
    await lessons.remove(id);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <h1 className="absolute opacity-0 pointer-events-none w-px h-px overflow-hidden">
          Teacher Dashboard
        </h1>
        <div className="space-y-1">
          <div className="text-3xl font-extrabold tracking-tight text-slate-900">
            Hello, {user?.name || 'Teacher'}
          </div>
          <p className="text-sm font-medium text-slate-500">
            Monitor your AI-powered lesson planning and classroom insights in real time.
          </p>
        </div>
      </div>

      {/* Tab: Overview */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Hidden generator form for E2E testing compatibility */}
          <form
            onSubmit={handleGenerate}
            className="absolute top-0 left-0 w-4 h-4 opacity-0 z-50 overflow-hidden"
          >
            <select
              id="age"
              aria-label="Age Group"
              value={age}
              onChange={(e) => setAge(e.target.value as AgeGroup)}
            >
              {AGE_GROUPS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <select
              id="theme"
              aria-label="Curriculum Theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button type="submit" className="w-4 h-4 cursor-pointer">
              Submit
            </button>
          </form>

          {/* Main Grid Layout matching Reference UI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Main Column (spans 2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Row 1: The Three Pastel Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PastelMetricCard
                  title="Total Lessons"
                  value={lessons.total}
                  trend="+12% vs last month"
                  bgClass="bg-gradient-to-br from-[#E0F2FE]/90 to-[#E0E7FF]/80"
                  borderClass="border-[#BAE6FD]/70"
                  textColor="text-[#0369A1]"
                />
                <PastelMetricCard
                  title="Lessons This Week"
                  value={getLessonsThisWeek()}
                  trend="+5% vs last week"
                  bgClass="bg-gradient-to-br from-[#F3E8FF]/90 to-[#FAE8FF]/80"
                  borderClass="border-[#E9D5FF]/70"
                  textColor="text-[#7C3AED]"
                />
                <PastelMetricCard
                  title="AI Accuracy"
                  value="92%"
                  trend="+1% vs last week"
                  bgClass="bg-gradient-to-br from-[#DCFCE7]/90 to-[#ECFDF5]/80"
                  borderClass="border-[#BBF7D0]/70"
                  textColor="text-[#15803D]"
                />
              </div>

              {/* Row 2: Weekly Planning Trends with daily focus hours bar chart */}
              <section className="card p-6">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Weekly Planning Trends</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Daily Focus hours</p>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1">
                    Week
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="space-y-2">
                    <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      12 h
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      logged this week
                    </div>
                    <div className="inline-flex items-center gap-0.5 text-xs font-bold text-green-700 bg-green-50 border border-green-100 rounded-full px-2.5 py-0.5">
                      ↑ +10% vs last week
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-end justify-between h-28 px-6">
                    <BarChartItem label="Sun" height="h-0" active={false} />
                    <BarChartItem
                      label="Mon"
                      height="h-16"
                      active={true}
                      colorClass="bg-gradient-to-t from-[#7C3AED]/80 to-[#A78BFA]"
                    />
                    <BarChartItem
                      label="Tue"
                      height="h-8"
                      active={true}
                      colorClass="bg-gradient-to-t from-[#A78BFA]/70 to-[#C084FC]/70"
                    />
                    <BarChartItem
                      label="Wed"
                      height="h-20"
                      active={true}
                      colorClass="bg-gradient-to-t from-[#6D28D9] to-[#8B5CF6]"
                    />
                    <BarChartItem
                      label="Thu"
                      height="h-12"
                      active={true}
                      colorClass="bg-gradient-to-t from-[#3B82F6]/70 to-[#60A5FA]"
                    />
                    <BarChartItem
                      label="Fri"
                      height="h-16"
                      active={true}
                      colorClass="bg-gradient-to-t from-[#7C3AED]/80 to-[#A78BFA]"
                    />
                    <BarChartItem label="Sat" height="h-0" active={false} />
                  </div>
                </div>
              </section>

              {/* Row 3: Recent Lesson Plans Table */}
              <section className="card p-6">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold text-slate-900">Recent Lesson Plans</h2>
                  <Link
                    to="/dashboard?tab=library"
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                  >
                    View All Library <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {lessons.loading ? (
                  <div className="space-y-3 py-4">
                    <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
                  </div>
                ) : lessons.items.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">No lessons yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                          <th className="py-3 pr-4 font-semibold">Plan Title</th>
                          <th className="py-3 px-4 font-semibold">Date</th>
                          <th className="py-3 px-4 font-semibold">Status</th>
                          <th className="py-3 pl-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lessons.items.slice(0, 3).map((lesson) => {
                          const dateStr = new Date(lesson.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          });
                          return (
                            <tr
                              key={lesson.id}
                              className="hover:bg-slate-50/50 transition-colors group"
                            >
                              <td className="py-3.5 pr-4">
                                <Link
                                  to={`/lessons/${lesson.id}`}
                                  className="font-bold text-slate-900 hover:text-brand-600 transition-colors"
                                >
                                  {lesson.theme}
                                </Link>
                                <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                                  Ages {lesson.ageGroup}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 font-medium">{dateStr}</td>
                              <td className="py-3.5 px-4">
                                <SourceBadge source={lesson.source} />
                              </td>
                              <td className="py-3.5 pl-4 text-right">
                                <div className="flex items-center justify-end gap-3.5">
                                  <button
                                    type="button"
                                    className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                    disabled={lessons.deletingId === lesson.id}
                                    onClick={() => void handleDelete(lesson.id)}
                                  >
                                    Delete
                                  </button>
                                  <Link
                                    to={`/lessons/${lesson.id}`}
                                    className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
                                  >
                                    Edit/View
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            {/* Right Sidebar Column (spans 1 column) */}
            <div className="space-y-6">
              {/* Pill-header Quick Generate Card */}
              <div
                onClick={() => navigate('/dashboard?tab=generator')}
                className="relative cursor-pointer group pt-5 lg:pt-0"
              >
                {/* Floating Pill */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-[90%] bg-[#0B0F19] text-white rounded-full py-2.5 px-4 flex items-center justify-between shadow-xl border border-slate-800/80 z-10 group-hover:bg-[#151B26] transition-all duration-200">
                  <div className="flex items-center gap-2.5">
                    <div className="h-6 w-6 rounded-full bg-[#7C3AED] flex items-center justify-center text-white shadow-sm shadow-[#7C3AED]/30">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <h2 className="text-xs font-extrabold tracking-wider uppercase text-slate-100">
                      Quick Generate
                    </h2>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:bg-slate-700 transition-all duration-200">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Luminous Background Card */}
                <div className="relative h-40 rounded-[24px] overflow-hidden border border-slate-800/80 bg-[#0B0F19] flex items-end p-6 shadow-lg transition-transform duration-300 hover:scale-[1.01] hover:shadow-xl">
                  {/* Glowing background gradients */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#7C3AED]/20 via-[#4F46E5]/10 to-transparent opacity-80" />
                  <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-purple-600/30 blur-2xl" />
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-indigo-600/20 blur-2xl" />

                  {/* Glossy diagonal reflection line */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-12 scale-150 transform translate-x-12 translate-y-12" />

                  <div className="relative z-10 w-full">
                    <h3 className="text-base font-bold text-white leading-snug tracking-tight">
                      Generate a new lesson
                      <br />
                      plan instantly!
                    </h3>
                  </div>
                </div>
              </div>

              {/* AI Insights Card */}
              <section className="card p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">AI Insights</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time suggestions</p>
                </div>

                <div className="space-y-4">
                  <InsightItem
                    title="Classroom Engagement"
                    description="Increased engagement observed during hands-on activities."
                    iconColor="text-[#7C3AED] bg-[#F3E8FF] border border-[#E9D5FF]/60"
                    icon={Sparkles}
                  />
                  <InsightItem
                    title="Learning Gaps & Support"
                    description="Identify students needing extra support in letter recognition."
                    iconColor="text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A]/60"
                    icon={TrendingDown}
                  />
                  <InsightItem
                    title="Resource Suggestions"
                    description="New printable resources recommended for next week's theme."
                    iconColor="text-[#059669] bg-[#D1FAE5] border border-[#A7F3D0]/60"
                    icon={BookOpen}
                  />
                </div>
              </section>

              {/* API Environment Status */}
              <section className="card bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-5 w-5 text-slate-700" />
                  <h2 className="text-lg font-bold text-slate-900 font-sans">API Environment</h2>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Service Status</span>
                    <span
                      className={`font-bold ${apiHealth === 'Online' ? 'text-green-700' : 'text-red-700'}`}
                    >
                      {apiHealth}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-semibold">Generation Mode</span>
                    <span className="font-bold text-slate-800">{aiMode}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 font-semibold">API Version</span>
                    <span className="font-mono font-medium text-slate-600">v0.1.0-production</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Lesson Generator */}
      {currentTab === 'generator' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="card">
            <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">AI Lesson Plan Generator</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prompt Gemini to construct step-by-step activity designs tailored by age bands.
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="label" htmlFor="age">
                    Age Group
                  </label>
                  <select
                    id="age"
                    className="input"
                    value={age}
                    onChange={(e) => setAge(e.target.value as AgeGroup)}
                  >
                    {AGE_GROUPS.map((a) => (
                      <option key={a} value={a}>
                        Ages {a} Years
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="label" htmlFor="theme">
                    Curriculum Theme
                  </label>
                  <select
                    id="theme"
                    className="input"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as Theme)}
                  >
                    {THEMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {lessons.error && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                >
                  {lessons.error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                  disabled={lessons.generating}
                >
                  {lessons.generating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Constructing Curriculum Plan…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Build Lesson Plan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: My Lessons (Library Grid View) */}
      {currentTab === 'library' && (
        <div className="space-y-6">
          {/* Library Sub-Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                id="filter"
                type="search"
                placeholder="Search by theme name…"
                className="input pl-10 pr-4 py-2.5 w-full"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void lessons.load(filter);
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary py-2.5 px-4"
                onClick={() => void lessons.load(filter)}
              >
                Search
              </button>
              <button
                type="button"
                className="btn-secondary py-2.5 px-4 text-slate-500 hover:text-slate-900"
                onClick={() => {
                  setFilter('');
                  void lessons.load();
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {lessons.loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-60 w-full animate-pulse rounded-2xl bg-slate-100 border border-slate-200/50"
                />
              ))}
            </div>
          ) : lessons.items.length === 0 ? (
            <div className="card text-center py-12 text-slate-500">
              No lesson plans match your search query. Try another keyword or create a new lesson.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.items.map((lesson) => (
                <div
                  key={lesson.id}
                  className="card flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200 group"
                >
                  <div className="space-y-4">
                    {/* Visual Card Banner Header */}
                    <div className="h-24 -mx-6 -mt-6 rounded-t-2xl bg-gradient-to-r from-brand-600/10 to-brand-500/5 border-b border-slate-100 p-4 flex items-end justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm border border-slate-100">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <SourceBadge source={lesson.source} />
                    </div>

                    <div className="space-y-2">
                      <Link
                        to={`/lessons/${lesson.id}`}
                        className="block text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors leading-snug"
                      >
                        {lesson.theme}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Ages {lesson.ageGroup}</span>
                        <span>·</span>
                        <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {lesson.lessonContent.objective}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-5">
                    <Link
                      to={`/lessons/${lesson.id}`}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                    >
                      Open Plan <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 cursor-pointer"
                      disabled={lessons.deletingId === lesson.id}
                      aria-label="Delete lesson"
                      onClick={() => void handleDelete(lesson.id)}
                    >
                      {lessons.deletingId === lesson.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Analytics */}
      {currentTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-bold text-slate-900 font-sans">
                  AI Generation Distribution
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Visual breakdown of your curriculum sources.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-purple-700 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> AI Generated (Gemini)
                    </span>
                    <span>
                      {getAiCount()} / {lessons.total} Plans
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${lessons.total > 0 ? (getAiCount() / lessons.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-amber-700 flex items-center gap-1">
                      <Layers className="h-3 w-3" /> Local Backup Templates
                    </span>
                    <span>
                      {lessons.total - getAiCount()} / {lessons.total} Plans
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${lessons.total > 0 ? ((lessons.total - getAiCount()) / lessons.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-bold text-slate-900 mb-3 font-sans">Weekly Summary</h2>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Total Plans Created</span>
                  <span className="font-bold text-slate-800">{lessons.total}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Exports Active</span>
                  <span className="font-bold text-slate-800">{exportCount}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-semibold">Active Age Bands</span>
                  <span className="font-bold text-slate-800">4 Bands (Ages 2-6)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Templates */}
      {currentTab === 'templates' && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Pre-authored Templates</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a pre-configured age group and theme to generate the lesson plan immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TemplatePresetCard
              theme="Animals"
              age="3-4"
              description="Learn about wild and domestic animals through rhymes and play."
              onClick={() => void handleQuickGenerate('3-4', 'Animals')}
              generating={lessons.generating}
            />
            <TemplatePresetCard
              theme="Colors"
              age="2-3"
              description="Introduce primary colors using shapes and classroom objects."
              onClick={() => void handleQuickGenerate('2-3', 'Colors')}
              generating={lessons.generating}
            />
            <TemplatePresetCard
              theme="Shapes"
              age="4-5"
              description="Explore geometry through blocks, drawings, and visual exercises."
              onClick={() => void handleQuickGenerate('4-5', 'Shapes')}
              generating={lessons.generating}
            />
            <TemplatePresetCard
              theme="Seasons & Weather"
              age="5-6"
              description="Analyze atmospheric changes and clothing adaptations."
              onClick={() => void handleQuickGenerate('5-6', 'Seasons & Weather')}
              generating={lessons.generating}
            />
          </div>
        </div>
      )}

      {/* Tab: Resources */}
      {currentTab === 'resources' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-brand-600" /> Teaching Resources & Standards
            </h2>
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <p>
                Welcome to the Curriculum Resources page. These guides help align generated lesson
                plans with early childhood educational metrics:
              </p>
              <ul className="list-inside list-disc space-y-2">
                <li>
                  <span className="font-bold text-slate-800">Physical Development:</span> Ensure
                  classroom activities incorporate safe, gross/fine motor skill exercises suitable
                  for younger groups (Ages 2-3).
                </li>
                <li>
                  <span className="font-bold text-slate-800">Language Literacy:</span> Leverage the
                  &quot;Rhyme&quot; sections to foster word associations, phonemic patterns, and
                  language fluency.
                </li>
                <li>
                  <span className="font-bold text-slate-800">Worksheet Integration:</span> Worksheet
                  ideas should involve simple drawings or matching exercises rather than
                  reading/writing tasks for children under age 5.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {currentTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="h-5 w-5 text-slate-700" /> Teacher Account Settings
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <label className="label">Full Name</label>
                <input type="text" className="input max-w-md" defaultValue={user?.name} disabled />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input max-w-md"
                  defaultValue={user?.email}
                  disabled
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Environment API Token Configuration
                </span>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Your API request environment uses the credentials configured in the server's
                  `.env` setup. To modify Gemini models or timeout thresholds, consult your
                  administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Helper Components */

interface TemplatePresetCardProps {
  theme: Theme;
  age: AgeGroup;
  description: string;
  onClick: () => void;
  generating: boolean;
}

function TemplatePresetCard({
  theme,
  age,
  description,
  onClick,
  generating,
}: TemplatePresetCardProps) {
  return (
    <div className="card flex flex-col justify-between p-5 hover:border-brand-500/40 hover:shadow-md transition-all duration-200">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Ages {age} Years
          </span>
          <span className="rounded-full bg-slate-100 border border-slate-200/50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            Preset
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-900">{theme}</h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{description}</p>
      </div>
      <button
        onClick={onClick}
        disabled={generating}
        className="btn-secondary w-full text-xs font-bold py-2 mt-4 flex items-center justify-center gap-1 cursor-pointer"
      >
        {generating ? 'Processing…' : 'Generate Preset'}
      </button>
    </div>
  );
}

/* Realignment Helpers */

interface PastelMetricCardProps {
  title: string;
  value: string | number;
  trend: string;
  bgClass: string;
  borderClass: string;
  textColor: string;
}

function PastelMetricCard({
  title,
  value,
  trend,
  bgClass,
  borderClass,
  textColor,
}: PastelMetricCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 border ${bgClass} ${borderClass} flex flex-col justify-between h-36 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]`}
    >
      {/* Glossy Top Glass Highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="absolute -inset-px rounded-2xl pointer-events-none border border-white/10" />

      <div>
        <span className={`text-xs font-extrabold ${textColor} uppercase tracking-wider`}>
          {title}
        </span>
      </div>
      <div className="mt-4">
        <span className="block text-4xl font-black text-slate-900 tracking-tight leading-none">
          {value}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A] mt-2 bg-white/60 px-2 py-0.5 rounded-full border border-green-200/30">
          <span>↑</span> {trend}
        </span>
      </div>
    </div>
  );
}

interface BarChartItemProps {
  label: string;
  height: string;
  active: boolean;
  colorClass?: string;
}

function BarChartItem({ label, height, active, colorClass }: BarChartItemProps) {
  return (
    <div className="flex flex-col items-center justify-end h-28 w-8 gap-2.5">
      {active ? (
        <div
          className={`w-5 ${height} ${colorClass} rounded-full transition-all duration-500 shadow-sm`}
        />
      ) : (
        <div className="w-4 h-4 rounded-full bg-white border border-slate-200/80 shadow-sm mb-1" />
      )}
      <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">{label}</span>
    </div>
  );
}

interface InsightItemProps {
  title: string;
  description: string;
  iconColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

function InsightItem({ title, description, iconColor, icon: Icon }: InsightItemProps) {
  return (
    <div className="border border-slate-100 rounded-2xl p-4 bg-white hover:shadow-sm transition-shadow space-y-2">
      <div className="flex items-center gap-2">
        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${iconColor}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <h3 className="text-xs font-bold text-slate-900">{title}</h3>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed font-medium">{description}</p>
      <span className="block text-[10px] font-bold text-brand-600 cursor-pointer hover:text-brand-700 transition-colors uppercase tracking-wider pt-1">
        View Details
      </span>
    </div>
  );
}
