import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { calendarIntensity } from '../../store/selectors';
import { toISODate, todayISO } from '../../lib/dates';
import CalendarDayCell from './CalendarDayCell';
import DayDetailPanel from './DayDetailPanel';

export default function CalendarMonth() {
  const weekStartsOn = useAppStore((s) => s.settings.weekStartsOn);
  const data = useAppStore((s) => ({
    areas: s.areas,
    completions: s.completions,
    schemaVersion: s.schemaVersion,
    tasks: s.tasks,
    notes: s.notes,
    game: s.game,
    settings: s.settings,
  }));

  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn });
    return eachDayOfInterval({ start, end });
  }, [cursor, weekStartsOn]);

  const intensity = useMemo(
    () => calendarIntensity(data, days.map((d) => toISODate(d))),
    [data, days],
  );

  const weekdayLabels = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn });
    return eachDayOfInterval({ start: base, end: endOfWeek(base, { weekStartsOn }) }).map((d) =>
      format(d, 'EEEEE'),
    );
  }, [weekStartsOn]);

  const today = todayISO();

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {format(cursor, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => setCursor((c) => addMonths(c, -1))}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCursor(startOfMonth(new Date()))}
            className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Today
          </button>
          <button
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdayLabels.map((w, i) => (
          <div key={i} className="pb-1 text-center text-xs font-semibold text-slate-400">
            {w}
          </div>
        ))}
        {days.map((d) => {
          const iso = toISODate(d);
          return (
            <CalendarDayCell
              key={iso}
              date={iso}
              inMonth={isSameMonth(d, cursor)}
              isToday={iso === today}
              intensity={intensity[iso]}
              onClick={() => setSelected(iso)}
            />
          );
        })}
      </div>

      <DayDetailPanel date={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
