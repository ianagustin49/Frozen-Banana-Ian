import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { groupByArea, tasksForDate } from '../store/selectors';
import { prettyDate, todayISO } from '../lib/dates';
import XpHeader from '../components/layout/XpHeader';
import TaskList from '../components/tasks/TaskList';
import AddTaskForm from '../components/tasks/AddTaskForm';
import StreakFlame from '../components/gamification/StreakFlame';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

export default function TodayPage() {
  const today = todayISO();
  const scheduled = useAppStore((s) => tasksForDate(s.tasks, s.completions, today));
  const groups = useAppStore((s) => groupByArea(s.areas, scheduled));
  const areaProgress = useAppStore((s) => s.game.areaProgress);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-accent-600 dark:text-accent-400">
            {prettyDate(today)}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Today</h1>
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus size={16} /> Add task
        </Button>
      </header>

      <XpHeader />

      {groups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center dark:border-slate-700">
          <p className="text-4xl">🍌</p>
          <p className="mt-3 font-semibold text-slate-600 dark:text-slate-300">
            No tasks scheduled yet
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Add your first daily habit to start building streaks.
          </p>
          <Button className="mx-auto mt-4" onClick={() => setAdding(true)}>
            <Plus size={16} /> Add a task
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <section key={g.area.id}>
              <div className="mb-2 flex items-center justify-between">
                <Link
                  to={`/area/${g.area.id}`}
                  className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-accent-600 dark:text-slate-200"
                >
                  <span className="text-lg">{g.area.icon}</span>
                  {g.area.name}
                  <span className="text-xs font-normal text-slate-400">
                    {g.doneCount}/{g.items.length}
                  </span>
                </Link>
                <StreakFlame streak={areaProgress[g.area.id]?.currentStreak ?? 0} />
              </div>
              <TaskList items={g.items} date={today} areaColor={g.area.color} />
            </section>
          ))}
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Add a task">
        <AddTaskForm onDone={() => setAdding(false)} />
      </Modal>
    </div>
  );
}
