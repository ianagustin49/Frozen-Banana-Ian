import type { Completion, ISODate, Task } from '../types/models';
import { addDaysISO, todayISO } from './dates';
import { isScheduledOn } from './recurrence';

interface StreakInput {
  today: ISODate;
  isScheduled: (day: ISODate) => boolean;
  isCompleted: (day: ISODate) => boolean;
  earliest?: ISODate;
  maxLookback?: number;
}

// Current streak: consecutive scheduled days completed, ending today.
// Today is tolerated while still pending (an un-done today doesn't break it).
export function currentStreak({ today, isScheduled, isCompleted, maxLookback = 400 }: StreakInput): number {
  let streak = 0;
  let day = today;
  let isToday = true;
  for (let i = 0; i < maxLookback; i++) {
    if (isScheduled(day)) {
      if (isCompleted(day)) {
        streak++;
      } else if (!isToday) {
        break;
      }
    }
    day = addDaysISO(day, -1);
    isToday = false;
  }
  return streak;
}

// Longest run of completed scheduled days across the whole history.
export function longestStreak({ today, isScheduled, isCompleted, earliest }: StreakInput): number {
  if (!earliest) return 0;
  let run = 0;
  let longest = 0;
  let day = earliest;
  // Walk forward to today.
  for (let guard = 0; guard < 4000; guard++) {
    if (isScheduled(day)) {
      if (isCompleted(day)) {
        run++;
        longest = Math.max(longest, run);
      } else if (day !== today) {
        run = 0;
      }
    }
    if (day === today) break;
    day = addDaysISO(day, 1);
  }
  return longest;
}

function earliestCompletionDate(completions: Completion[]): ISODate | undefined {
  if (completions.length === 0) return undefined;
  return completions.reduce((min, c) => (c.date < min ? c.date : min), completions[0].date);
}

// Streak for a single area: a day counts if any of the area's habits were
// scheduled and at least one completion exists for the area that day.
export function areaStreaks(
  areaId: string,
  tasks: Task[],
  completions: Completion[],
  today: ISODate = todayISO(),
): { current: number; longest: number } {
  const areaHabits = tasks.filter((t) => t.areaId === areaId && t.type === 'habit' && !t.archived);
  const areaCompletions = completions.filter((c) => c.areaId === areaId);
  const completedDays = new Set(areaCompletions.map((c) => c.date));

  const isScheduled = (day: ISODate) => areaHabits.some((t) => isScheduledOn(t, day));
  const isCompleted = (day: ISODate) => completedDays.has(day);
  const earliest = earliestCompletionDate(areaCompletions);

  return {
    current: currentStreak({ today, isScheduled, isCompleted }),
    longest: longestStreak({ today, isScheduled, isCompleted, earliest }),
  };
}

// Global streak: any task done on any given day keeps it alive.
export function globalStreaks(
  completions: Completion[],
  today: ISODate = todayISO(),
): { current: number; longest: number } {
  const completedDays = new Set(completions.map((c) => c.date));
  const isScheduled = () => true; // every day is a chance to do something
  const isCompleted = (day: ISODate) => completedDays.has(day);
  const earliest = earliestCompletionDate(completions);

  return {
    current: currentStreak({ today, isScheduled, isCompleted }),
    longest: longestStreak({ today, isScheduled, isCompleted, earliest }),
  };
}
