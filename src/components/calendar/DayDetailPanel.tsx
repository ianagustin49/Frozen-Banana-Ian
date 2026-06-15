import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { groupByArea, tasksForDate } from '../../store/selectors';
import { prettyDate } from '../../lib/dates';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import TaskList from '../tasks/TaskList';
import AddTaskForm from '../tasks/AddTaskForm';

interface Props {
  date: string | null;
  onClose: () => void;
}

export default function DayDetailPanel({ date, onClose }: Props) {
  const scheduled = useAppStore((s) => (date ? tasksForDate(s.tasks, s.completions, date) : []));
  const groups = useAppStore((s) => groupByArea(s.areas, scheduled));
  const [adding, setAdding] = useState(false);

  return (
    <Modal open={!!date} onClose={onClose} title={date ? prettyDate(date) : ''}>
      {date && (
        <div className="space-y-4">
          {groups.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400 dark:border-slate-700">
              No tasks scheduled for this day.
            </p>
          ) : (
            groups.map((g) => (
              <div key={g.area.id}>
                <p className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                  <span>{g.area.icon}</span>
                  {g.area.name}
                  <span className="text-xs font-normal text-slate-400">
                    {g.doneCount}/{g.items.length}
                  </span>
                </p>
                <TaskList items={g.items} date={date} areaColor={g.area.color} />
              </div>
            ))
          )}

          {adding ? (
            <div className="rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
              <AddTaskForm defaultDate={date} onDone={() => setAdding(false)} />
            </div>
          ) : (
            <Button variant="subtle" className="w-full" onClick={() => setAdding(true)}>
              <Plus size={16} /> Add a task for this day
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}
