import { useAppStore } from '../store/useAppStore';
import { activeAreas } from '../store/selectors';
import CalendarMonth from '../components/calendar/CalendarMonth';

export default function CalendarPage() {
  const areas = useAppStore((s) => activeAreas(s.areas));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Calendar</h1>
        <p className="text-sm text-slate-400">
          Each day is tinted with the colors of the areas you worked on. Tap a day to see or check
          off its tasks.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {areas.map((a) => (
          <span
            key={a.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: a.color }} />
            {a.shortName}
          </span>
        ))}
      </div>

      <CalendarMonth />
    </div>
  );
}
