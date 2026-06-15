import { useAppStore } from '../../store/useAppStore';
import { dayCompletion, tasksForDate } from '../../store/selectors';
import { levelProgress } from '../../lib/xp';
import { todayISO } from '../../lib/dates';
import LevelBadge from '../gamification/LevelBadge';
import StreakFlame from '../gamification/StreakFlame';
import XpBar from '../gamification/XpBar';

function Ring({ pct }: { pct: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0 -rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-slate-700" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * pct) / 100}
        className="text-emerald-500 transition-all duration-500"
      />
    </svg>
  );
}

export default function XpHeader() {
  const game = useAppStore((s) => s.game);
  const today = todayISO();
  const scheduled = useAppStore((s) => tasksForDate(s.tasks, s.completions, today));
  const prog = levelProgress(game.totalXp);
  const day = dayCompletion(scheduled);

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <LevelBadge level={game.level} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Level {game.level}</p>
            <StreakFlame streak={game.globalStreak} />
          </div>
          <div className="mt-1.5">
            <XpBar pct={prog.pct} />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {prog.intoLevel} / {prog.levelSpan} XP to level {game.level + 1}
          </p>
        </div>
        <div className="relative flex flex-col items-center">
          <Ring pct={day.pct} />
          <span className="absolute top-3 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            {day.done}/{day.total}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase text-slate-400">Today</span>
        </div>
      </div>
    </div>
  );
}
