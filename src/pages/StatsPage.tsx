import { useMemo } from 'react';
import {
  Area as RArea,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import { useAppStore } from '../store/useAppStore';
import { activeAreas } from '../store/selectors';
import { BADGES } from '../data/badges';
import { addDaysISO, fromISODate, todayISO } from '../lib/dates';
import StreakFlame from '../components/gamification/StreakFlame';

export default function StatsPage() {
  const areas = useAppStore((s) => activeAreas(s.areas));
  const game = useAppStore((s) => s.game);
  const completions = useAppStore((s) => s.completions);

  const earnedIds = new Set(game.earnedBadges.map((b) => b.badgeId));

  // Cumulative XP over the last 30 days.
  const series = useMemo(() => {
    const today = todayISO();
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) days.push(addDaysISO(today, -i));
    const byDay = new Map<string, number>();
    for (const c of completions) byDay.set(c.date, (byDay.get(c.date) ?? 0) + c.xpAwarded);
    // Baseline = XP earned before the window starts.
    let running = completions
      .filter((c) => c.date < days[0])
      .reduce((sum, c) => sum + c.xpAwarded, 0);
    return days.map((d) => {
      running += byDay.get(d) ?? 0;
      return { date: d, label: format(fromISODate(d), 'MMM d'), xp: running };
    });
  }, [completions]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Stats</h1>
        <p className="text-sm text-slate-400">Your momentum across every life area.</p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total XP" value={game.totalXp.toLocaleString()} />
        <StatCard label="Level" value={String(game.level)} />
        <StatCard label="Best streak" value={`${game.longestGlobalStreak}d`} />
      </div>

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">XP — last 30 days</h2>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: -20, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={6} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" width={42} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }}
                labelStyle={{ fontWeight: 600 }}
              />
              <RArea type="monotone" dataKey="xp" stroke="#6366f1" strokeWidth={2} fill="url(#xpFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">Streaks by area</h2>
        <div className="space-y-2">
          {areas.map((a) => {
            const p = game.areaProgress[a.id];
            return (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-soft dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <span className="text-lg">{a.icon}</span>
                  {a.name}
                </span>
                <span className="flex items-center gap-4 text-sm text-slate-400">
                  <StreakFlame streak={p?.currentStreak ?? 0} />
                  <span>Lv {p?.level ?? 1}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">
          Badges ({earnedIds.size}/{BADGES.length})
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BADGES.map((b) => {
            const earned = earnedIds.has(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-2xl border p-3 text-center transition-all ${
                  earned
                    ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'
                    : 'border-slate-100 bg-white opacity-60 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className={`text-3xl ${earned ? '' : 'grayscale'}`}>{b.icon}</div>
                <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">{b.name}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-400">{b.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
