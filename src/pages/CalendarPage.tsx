import CalendarMonth from '../components/calendar/CalendarMonth';

export default function CalendarPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Calendar</h1>
        <p className="text-sm text-slate-400">
          Each dot is a life area you made progress in. Tap a day to see or check off its tasks.
        </p>
      </header>
      <CalendarMonth />
    </div>
  );
}
