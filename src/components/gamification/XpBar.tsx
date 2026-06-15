import { motion } from 'framer-motion';

interface Props {
  pct: number;
  color?: string;
  height?: number;
}

export default function XpBar({ pct, color = '#6366f1', height = 8 }: Props) {
  return (
    <div
      className="w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={false}
        animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  );
}
