import type { ReactNode } from 'react';
import NavBar from './NavBar';
import FeedbackLayer from '../gamification/FeedbackLayer';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full bg-slate-50 dark:bg-slate-950">
      <NavBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-5 md:pb-8 md:pt-8">
        {children}
      </main>
      <FeedbackLayer />
    </div>
  );
}
