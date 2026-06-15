import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { groupByArea, tasksForDate } from '../store/selectors';
import { prettyDate, todayISO } from '../lib/dates';
import XpHeader from '../components/layout/XpHeader';
import AnimatedBlobs from '../components/layout/AnimatedBlobs';
import TaskList from '../components/tasks/TaskList';
import AddTaskForm from '../components/tasks/AddTaskForm';
import StreakFlame from '../components/gamification/StreakFlame';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayPage() {
  const today = todayISO();
  const scheduled = useAppStore((s) => tasksForDate(s.tasks, s.completions, today));
  const groups = useAppStore((s) => groupByArea(s.areas, scheduled));
  const areaProgress = useAppStore((s) => s.game.areaProgress);
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-5">
      <motion.header
        className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatedBlobs />
        <div className="relative flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-accent-600 dark:text-accent-400">
              {prettyDate(today)}
            </p>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              {greeting()}, Ian{' '}
              <motion.span
                className="inline-block"
                animate={{ rotate: [0, 14, -8, 14, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2 }}
              >
                🍌
              </motion.span>
            </h1>
          </div>
          <Button onClick={() => setAdding(true)}>
            <Plus size={16} /> Add task
          </Button>
        </div>
      </motion.header>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <XpHeader />
      </motion.div>

      {groups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center dark:border-slate-700">
          <motion.p
            className="text-5xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            🍌
          </motion.p>
          <p className="mt-3 font-semibold text-slate-600 dark:text-slate-300">No tasks scheduled yet</p>
          <p className="mt-1 text-sm text-slate-400">Add your first daily habit to start building streaks.</p>
          <Button className="mx-auto mt-4" onClick={() => setAdding(true)}>
            <Plus size={16} /> Add a task
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((g, i) => (
            <motion.section
              key={g.area.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
            >
              <div className="mb-2 flex items-center justify-between">
                <Link
                  to={`/area/${g.area.id}`}
                  className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-accent-600 dark:text-slate-200"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-lg"
                    style={{ backgroundColor: `${g.area.color}26` }}
                  >
                    {g.area.icon}
                  </span>
                  {g.area.name}
                  <span className="text-xs font-normal text-slate-400">
                    {g.doneCount}/{g.items.length}
                  </span>
                </Link>
                <StreakFlame streak={areaProgress[g.area.id]?.currentStreak ?? 0} />
              </div>
              {/* thin progress bar in the area color */}
              <div className="mb-2 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: g.area.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${g.items.length ? (g.doneCount / g.items.length) * 100 : 0}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
              <TaskList items={g.items} date={today} areaColor={g.area.color} />
            </motion.section>
          ))}
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Add a task">
        <AddTaskForm onDone={() => setAdding(false)} />
      </Modal>
    </div>
  );
}
