import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { useSession } from './sync/auth';
import { startSync, stopSync } from './sync/syncEngine';
import AppShell from './components/layout/AppShell';
import TodayPage from './pages/TodayPage';
import CalendarPage from './pages/CalendarPage';
import AreaPage from './pages/AreaPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const theme = useAppStore((s) => s.settings.theme);
  const runDailyMaintenance = useAppStore((s) => s.runDailyMaintenance);
  const { session } = useSession();

  // Apply theme to <html> for Tailwind's class-based dark mode.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Recompute streaks/levels once on load (resets a current streak after a missed day).
  useEffect(() => {
    runDailyMaintenance();
  }, [runDailyMaintenance]);

  // Start/stop cloud sync as the auth session changes.
  useEffect(() => {
    if (session?.user.id) {
      void startSync(session.user.id);
      return () => stopSync();
    }
  }, [session?.user.id]);

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/area/:id" element={<AreaPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}
