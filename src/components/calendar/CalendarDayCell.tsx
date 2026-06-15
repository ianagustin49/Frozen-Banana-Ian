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
  const dots = intensity?.areaColors.slice(0, 4) ?? [];
  return (
    <button
      onClick={onClick}
      className={`flex aspect-square flex-col items-center justify-start rounded-xl border p-1 text-xs transition-colors ${
        isToday
          ? 'border-accent-400 bg-accent-50 dark:bg-accent-600/15'
          : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${inMonth ? '' : 'opacity-40'}`}
    >
      <span
        className={`font-semibold ${
          isToday ? 'text-accent-700 dark:text-accent-300' : 'text-slate-600 dark:text-slate-300'
        }`}
      >
        {format(fromISODate(date), 'd')}
      </span>
      <div className="mt-auto flex flex-wrap items-center justify-center gap-0.5 pb-0.5">
        {dots.map((c, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
        ))}
      </div>
    </button>
  );
}
