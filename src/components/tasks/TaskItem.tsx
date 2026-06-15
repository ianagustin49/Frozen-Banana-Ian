import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Pencil, StickyNote, Trash2 } from 'lucide-react';
import type { ScheduledTask } from '../../types/models';
import { useAppStore } from '../../store/useAppStore';
import { notesForTask } from '../../store/selectors';
import { recurrenceLabel } from '../../lib/recurrence';
import NoteEditor from './NoteEditor';

interface Props {
  scheduled: ScheduledTask;
  date: string;
  areaColor: string;
}

export default function TaskItem({ scheduled, date, areaColor }: Props) {
  const { task, completed } = scheduled;
  const completeTask = useAppStore((s) => s.completeTask);
  const uncompleteTask = useAppStore((s) => s.uncompleteTask);
  const updateTask = useAppStore((s) => s.updateTask);
  const archiveTask = useAppStore((s) => s.archiveTask);
  const noteCount = useAppStore((s) => notesForTask(s, task.id).length);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [showNotes, setShowNotes] = useState(false);
  const [burst, setBurst] = useState(false);

  const toggle = () => {
    if (completed) {
      uncompleteTask(task.id, date);
    } else {
      completeTask(task.id, date);
      setBurst(true);
      setTimeout(() => setBurst(false), 1000);
    }
  };

  const saveTitle = () => {
    const t = title.trim();
    if (t && t !== task.title) updateTask(task.id, { title: t });
    else setTitle(task.title);
    setEditing(false);
  };

  return (
    <div
      className="rounded-2xl border border-l-[5px] border-slate-100 bg-white px-3 py-2.5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card dark:border-slate-800 dark:bg-slate-900"
      style={{ borderLeftColor: areaColor }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            completed
              ? 'border-transparent text-white'
              : 'border-slate-300 text-transparent hover:border-accent-400 dark:border-slate-600'
          }`}
          style={completed ? { backgroundColor: areaColor } : undefined}
          aria-label={completed ? 'Mark incomplete' : 'Complete task'}
        >
          <Check size={16} strokeWidth={3} />
          <AnimatePresence>
            {burst && (
              <motion.span
                className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-extrabold text-emerald-500"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: -22 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9 }}
              >
                +{task.xp} XP
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              autoFocus
              className="w-full rounded-lg border border-accent-300 bg-white px-2 py-1 text-sm outline-none dark:bg-slate-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle();
                if (e.key === 'Escape') {
                  setTitle(task.title);
                  setEditing(false);
                }
              }}
            />
          ) : (
            <p
              onDoubleClick={() => setEditing(true)}
              className={`truncate text-sm font-medium ${
                completed
                  ? 'text-slate-400 line-through dark:text-slate-500'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              {task.title}
            </p>
          )}
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: areaColor }} />
            {recurrenceLabel(task)} · {task.xp} XP
          </p>
        </div>

        <div className="flex items-center gap-0.5 text-slate-400">
          <button
            onClick={() => setShowNotes((v) => !v)}
            className={`relative rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 ${
              noteCount ? 'text-accent-500' : ''
            }`}
            aria-label="Notes"
          >
            <StickyNote size={16} />
            {noteCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-500 text-[9px] font-bold text-white">
                {noteCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Edit task"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => archiveTask(task.id)}
            className="rounded-lg p-1.5 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950"
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {showNotes && <NoteEditor taskId={task.id} areaId={task.areaId} />}
    </div>
  );
}
