import { motion } from 'framer-motion';
import type { ScheduledTask } from '../../types/models';
import TaskItem from './TaskItem';

interface Props {
  items: ScheduledTask[];
  date: string;
  areaColor: string;
  emptyHint?: string;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function TaskList({ items, date, areaColor, emptyHint }: Props) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400 dark:border-slate-700">
        {emptyHint ?? 'Nothing here yet.'}
      </p>
    );
  }
  return (
    <motion.div className="space-y-2" variants={container} initial="hidden" animate="show">
      {items.map((s) => (
        <motion.div key={s.task.id} variants={item} layout>
          <TaskItem scheduled={s} date={date} areaColor={areaColor} />
        </motion.div>
      ))}
    </motion.div>
  );
}
