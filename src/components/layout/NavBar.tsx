import { NavLink } from 'react-router-dom';
import { CalendarDays, Home, Settings, Trophy } from 'lucide-react';

const links = [
  { to: '/', label: 'Today', icon: Home, end: true },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/stats', label: 'Stats', icon: Trophy, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

// Sidebar on desktop, bottom tab bar on mobile.
export default function NavBar() {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden w-60 shrink-0 flex-col gap-1 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="text-2xl">🍌</span>
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Frozen Banana</p>
            <p className="text-xs text-slate-400">Daily tracker</p>
          </div>
        </div>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-accent-50 text-accent-700 dark:bg-accent-600/15 dark:text-accent-300'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`
            }
          >
            <l.icon size={18} />
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors ${
                isActive ? 'text-accent-600 dark:text-accent-400' : 'text-slate-400'
              }`
            }
          >
            <l.icon size={20} />
            {l.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
