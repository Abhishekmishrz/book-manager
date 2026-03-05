'use client';

import { useStats } from '@/hooks/useStats';
import { useAuth } from '@/hooks/useAuth';
import { MONTH_NAMES } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const GENRE_COLORS = ['#7C3AED', '#059669', '#D97706', '#DC2626', '#0EA5E9', '#EC4899', '#84CC16', '#F97316', '#06B6D4', '#A855F7'];

function GoalRing({ current, goal }: { current: number; goal: number }) {
  const pct = Math.min(100, Math.round((current / goal) * 100));
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#2A2A3C" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={r} fill="none"
            stroke="#7C3AED" strokeWidth="10"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-text-primary">{pct}%</span>
          <span className="text-text-muted text-xs">of goal</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-text-primary font-semibold">{current} / {goal} books</p>
        <p className="text-text-muted text-sm">{new Date().getFullYear()} Reading Goal</p>
      </div>
    </div>
  );
}

function ReadingStreak({ data }: { data: { year: number; week: number; count: number }[] }) {
  const weekMap = new Map(data.map((d) => [`${d.year}-${d.week}`, d.count]));
  const today = new Date();
  const weeks = 52;
  const cells: { key: string; count: number; label: string }[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const date = new Date(today);
    date.setDate(today.getDate() - w * 7);
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const week = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    const count = weekMap.get(`${year}-${week}`) || 0;
    cells.push({
      key: `${year}-${week}`,
      count,
      label: `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${count} book${count !== 1 ? 's' : ''}`,
    });
  }

  const intensityColor = (count: number) => {
    if (count === 0) return 'bg-surface-2';
    if (count === 1) return 'bg-accent/30';
    if (count === 2) return 'bg-accent/55';
    if (count === 3) return 'bg-accent/75';
    return 'bg-accent';
  };

  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {cells.map((c) => (
          <div
            key={c.key}
            title={c.label}
            className={`w-3.5 h-3.5 rounded-sm ${intensityColor(c.count)} transition-colors cursor-default`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-text-muted text-xs">
        <span>Less</span>
        {['bg-surface-2', 'bg-accent/30', 'bg-accent/55', 'bg-accent/75', 'bg-accent'].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { overview, monthly, genres, streak } = useStats();
  const { user } = useAuth();

  const completedThisYear = overview?.byStatus?.completed || 0;
  const goal = user?.readingGoal || 12;

  const monthlyData = (monthly || []).map((m) => ({
    name: MONTH_NAMES[m.month - 1],
    books: m.count,
  }));

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">
      <h1 className="font-display text-3xl font-bold text-text-primary">Reading Statistics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Books', value: overview?.total ?? '—', icon: '📚' },
          { label: 'Completed', value: overview?.byStatus?.completed ?? 0, icon: '✅' },
          { label: 'Avg Rating', value: overview?.averageRating ? `${overview.averageRating}★` : '—', icon: '⭐' },
          { label: 'Pages Read', value: overview?.pagesRead ? overview.pagesRead.toLocaleString() : '—', icon: '📄' },
        ].map((s) => (
          <div key={s.label} className="card p-5 space-y-2">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-text-primary text-2xl font-bold">{s.value}</p>
              <p className="text-text-muted text-sm">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Goal ring + status breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 flex items-center justify-center">
          <GoalRing current={completedThisYear} goal={goal} />
        </div>
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-text-primary">Books by Status</h2>
          {overview?.byStatus && Object.entries(overview.byStatus).map(([status, count]) => {
            const labels: Record<string, string> = { want_to_read: 'Want to Read', reading: 'Reading', completed: 'Completed', paused: 'Paused', dropped: 'Dropped' };
            const total = overview.total || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={status} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">{labels[status] || status}</span>
                  <span className="text-text-primary font-medium">{count}</span>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-text-primary">Books Completed by Month ({new Date().getFullYear()})</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fill: '#8B8BA7', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8B8BA7', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#1C1C28', border: '1px solid #2A2A3C', borderRadius: '10px', color: '#F1F0FF' }}
              cursor={{ fill: '#2A2A3C' }}
            />
            <Bar dataKey="books" fill="#7C3AED" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Genre donut */}
      {genres && genres.length > 0 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Genre Breakdown</h2>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={genres}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  dataKey="count" nameKey="genre"
                >
                  {genres.map((_, i) => (
                    <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1C1C28', border: '1px solid #2A2A3C', borderRadius: '10px', color: '#F1F0FF' }}
                  formatter={(value, name) => [value, name]}
                />
                <Legend iconType="circle" formatter={(v) => <span style={{ color: '#8B8BA7', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {genres.map((g, i) => (
                <div key={g.genre} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }} />
                  <span className="text-text-muted text-sm flex-1">{g.genre}</span>
                  <span className="text-text-primary text-sm font-medium">{g.count}</span>
                  <span className="text-text-muted text-xs w-8 text-right">{g.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reading streak */}
      {streak && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-text-primary">Reading Activity (Last 52 Weeks)</h2>
          <ReadingStreak data={streak} />
        </div>
      )}
    </div>
  );
}
