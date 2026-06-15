import type { ScheduledTask } from '../../types/models';
import TaskItem from './TaskItem';

interface Props {
  items: ScheduledTask[];
  date: string;
  areaColor: string;
  emptyHint?: string;
}

export default function TaskList({ items, date, areaColor, emptyHint }: Props) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400 dark:border-slate-700">
        {emptyHint ?? 'Nothing here yet.'}
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((s) => (
        <TaskItem key={s.task.id} scheduled={s} date={date} areaColor={areaColor} />
      ))}
    </div>
  );
}
