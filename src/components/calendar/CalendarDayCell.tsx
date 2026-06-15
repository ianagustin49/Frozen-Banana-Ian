import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { DayIntensity } from '../../store/selectors';
import { fromISODate } from '../../lib/dates';

interface Props {
  date: string;
  inMonth: boolean;
  isToday: boolean;
  intensity?: DayIntensity;
  onClick: () => void;
}

export default function CalendarDayCell({ date, inMonth, isToday, intensity, onClick }: Props) {
  const colors = intensity?.areaColors.slice(0, 4) ?? [];
  const hasActivity = colors.length > 0;

  // Tint the whole cell with the colors of the areas worked that day, so the
  // calendar reads at a glance. Multiple areas blend into a soft gradient.
  const bg = hasActivity
    ? colors.length === 1
      ? `${colors[0]}2e`
      : `linear-gradient(135deg, ${colors.map((c) => `${c}40`).join(', ')})`
    : undefined;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className={`flex aspect-square flex-col items-center justify-start rounded-xl border p-1 text-xs transition-colors ${
        isToday
          ? 'border-accent-400 ring-1 ring-accent-300'
          : hasActivity
            ? 'border-transparent'
            : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${inMonth ? '' : 'opacity-40'}`}
      style={{ background: bg }}
    >
      <span
        className={`font-semibold ${
          isToday
            ? 'text-accent-700 dark:text-accent-300'
            : hasActivity
              ? 'text-slate-700 dark:text-slate-100'
              : 'text-slate-600 dark:text-slate-300'
        }`}
      >
        {format(fromISODate(date), 'd')}
      </span>
      <div className="mt-auto flex flex-wrap items-center justify-center gap-0.5 pb-0.5">
        {colors.map((c, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full ring-1 ring-white/60 dark:ring-black/20"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </motion.button>
  );
}
