import { useState } from 'react';
import type { Difficulty, Recurrence, TaskType } from '../../types/models';
import { useAppStore } from '../../store/useAppStore';
import { activeAreas } from '../../store/selectors';
import Button from '../ui/Button';

interface Props {
  defaultAreaId?: string;
  defaultDate?: string;
  onDone?: () => void;
}

const WEEKDAYS = [
  { d: 1, label: 'M' },
  { d: 2, label: 'T' },
  { d: 3, label: 'W' },
  { d: 4, label: 'T' },
  { d: 5, label: 'F' },
  { d: 6, label: 'S' },
  { d: 0, label: 'S' },
];

const DIFFICULTIES: { value: Difficulty; label: string; xp: number }[] = [
  { value: 'easy', label: 'Easy', xp: 10 },
  { value: 'medium', label: 'Medium', xp: 25 },
  { value: 'hard', label: 'Hard', xp: 50 },
];

export default function AddTaskForm({ defaultAreaId, defaultDate, onDone }: Props) {
  const areas = useAppStore((s) => activeAreas(s.areas));
  const addTask = useAppStore((s) => s.addTask);

  const [title, setTitle] = useState('');
  const [areaId, setAreaId] = useState(defaultAreaId ?? areas[0]?.id ?? '');
  const [type, setType] = useState<TaskType>('habit');
  const [repeat, setRepeat] = useState<'daily' | 'weekdays'>('daily');
  const [days, setDays] = useState<number[]>([1, 3, 5]);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [dueDate, setDueDate] = useState(defaultDate ?? '');

  const toggleDay = (d: number) =>
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const submit = () => {
    if (!title.trim() || !areaId) return;
    const recurrence: Recurrence =
      type === 'todo'
        ? { kind: 'none' }
        : repeat === 'daily'
          ? { kind: 'daily' }
          : { kind: 'weekdays', days: days.length ? days : [1, 3, 5] };
    addTask({
      areaId,
      title,
      type,
      recurrence,
      difficulty,
      dueDate: type === 'todo' && dueDate ? dueDate : undefined,
    });
    onDone?.();
  };

  const fieldCls =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-slate-700 dark:bg-slate-800';

  return (
    <div className="space-y-4">
      <input
        autoFocus
        className={fieldCls}
        placeholder="What do you want to get done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">Area</span>
          <select className={fieldCls} value={areaId} onChange={(e) => setAreaId(e.target.value)}>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.icon} {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">Type</span>
          <select
            className={fieldCls}
            value={type}
            onChange={(e) => setType(e.target.value as TaskType)}
          >
            <option value="habit">Daily habit</option>
            <option value="todo">One-off to-do</option>
          </select>
        </label>
      </div>

      {type === 'habit' ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <SegBtn active={repeat === 'daily'} onClick={() => setRepeat('daily')}>
              Every day
            </SegBtn>
            <SegBtn active={repeat === 'weekdays'} onClick={() => setRepeat('weekdays')}>
              Certain days
            </SegBtn>
          </div>
          {repeat === 'weekdays' && (
            <div className="flex gap-1.5">
              {WEEKDAYS.map((w) => (
                <button
                  key={w.d}
                  onClick={() => toggleDay(w.d)}
                  className={`h-9 w-9 rounded-full text-sm font-semibold transition-colors ${
                    days.includes(w.d)
                      ? 'bg-accent-600 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-slate-500">Due date (optional)</span>
          <input
            type="date"
            className={fieldCls}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>
      )}

      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500">Difficulty (more XP for harder)</span>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <SegBtn key={d.value} active={difficulty === d.value} onClick={() => setDifficulty(d.value)}>
              {d.label} · {d.xp}
            </SegBtn>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onDone && (
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        )}
        <Button onClick={submit} disabled={!title.trim()}>
          Add task
        </Button>
      </div>
    </div>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
        active
          ? 'bg-accent-600 text-white shadow-soft'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
      }`}
    >
      {children}
    </button>
  );
}
