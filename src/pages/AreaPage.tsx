import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';
import type { ScheduledTask } from '../types/models';
import { useAppStore } from '../store/useAppStore';
import { areaById } from '../store/selectors';
import { todayISO } from '../lib/dates';
import { isScheduledOn } from '../lib/recurrence';
import { levelProgress } from '../lib/xp';
import TaskList from '../components/tasks/TaskList';
import AddTaskForm from '../components/tasks/AddTaskForm';
import XpBar from '../components/gamification/XpBar';
import LevelBadge from '../components/gamification/LevelBadge';
import StreakFlame from '../components/gamification/StreakFlame';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

export default function AreaPage() {
  const { id = '' } = useParams();
  const today = todayISO();
  const area = useAppStore((s) => areaById(s.areas, id));
  const progress = useAppStore((s) => s.game.areaProgress[id]);

  // All active tasks for this area, scheduled-today first.
  const items = useAppStore((s) => {
    const completedToday = new Set(
      s.completions.filter((c) => c.date === today && c.areaId === id).map((c) => c.taskId),
    );
    return s.tasks
      .filter((t) => t.areaId === id && !t.archived)
      .map<ScheduledTask & { scheduledToday: boolean }>((task) => ({
        task,
        completed: completedToday.has(task.id),
        scheduledToday: isScheduledOn(task, today),
      }))
      .sort((a, b) => Number(b.scheduledToday) - Number(a.scheduledToday) || a.task.order - b.task.order);
  });

  const [adding, setAdding] = useState(false);

  if (!area) {
    return (
      <div className="space-y-3">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500">
          <ChevronLeft size={16} /> Back
        </Link>
        <p className="text-slate-500">Area not found.</p>
      </div>
    );
  }

  const prog = levelProgress(progress?.xp ?? 0);

  return (
    <div className="space-y-5">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-accent-600">
        <ChevronLeft size={16} /> Today
      </Link>

      <header className="flex items-center gap-3">
        <span className="text-4xl">{area.icon}</span>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{area.name}</h1>
          <div className="mt-0.5 flex items-center gap-3 text-sm text-slate-400">
            <StreakFlame streak={progress?.currentStreak ?? 0} />
            <span>Best: {progress?.longestStreak ?? 0} days</span>
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <LevelBadge level={progress?.level ?? 1} size="lg" color={area.color} />
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Level {progress?.level ?? 1}
            </p>
            <div className="mt-1.5">
              <XpBar pct={prog.pct} color={area.color} />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {prog.intoLevel} / {prog.levelSpan} XP to next level
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Tasks</h2>
        <Button variant="subtle" onClick={() => setAdding(true)}>
          <Plus size={16} /> Add
        </Button>
      </div>

      <TaskList
        items={items}
        date={today}
        areaColor={area.color}
        emptyHint="No tasks in this area yet. Add one to get going."
      />

      <Modal open={adding} onClose={() => setAdding(false)} title={`Add to ${area.name}`}>
        <AddTaskForm defaultAreaId={area.id} onDone={() => setAdding(false)} />
      </Modal>
    </div>
  );
}
