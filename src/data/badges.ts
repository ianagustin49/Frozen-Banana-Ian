import type { AppData, EarnedBadge } from '../types/models';

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  // Returns true if the badge is earned given the full app data.
  isEarned: (data: AppData) => boolean;
  areaId?: string;
}

function completionsForArea(data: AppData, areaId: string) {
  return data.completions.filter((c) => c.areaId === areaId);
}

// Static catalog, themed to Ian. Evaluated after each completion.
export const BADGES: BadgeDef[] = [
  {
    id: 'first-sale',
    name: 'First Sale',
    description: 'Complete your first Frozen Banana task.',
    icon: '🍌',
    areaId: 'area-banana',
    isEarned: (d) => completionsForArea(d, 'area-banana').length >= 1,
  },
  {
    id: 'steady-drummer',
    name: 'Steady Drummer',
    description: 'Reach a 7-day Drum Lessons streak.',
    icon: '🥁',
    areaId: 'area-drums',
    isEarned: (d) => (d.game.areaProgress['area-drums']?.longestStreak ?? 0) >= 7,
  },
  {
    id: 'ship-it',
    name: 'Ship It',
    description: 'Complete 10 Website Building tasks.',
    icon: '🚀',
    areaId: 'area-web',
    isEarned: (d) => completionsForArea(d, 'area-web').length >= 10,
  },
  {
    id: 'strong-week',
    name: 'Strong Week',
    description: 'Reach a 7-day Workout streak.',
    icon: '💪',
    areaId: 'area-fitness',
    isEarned: (d) => (d.game.areaProgress['area-fitness']?.longestStreak ?? 0) >= 7,
  },
  {
    id: 'no-cramming',
    name: 'No Cramming',
    description: 'Finish a Studies task 3+ days before its due date.',
    icon: '🧠',
    areaId: 'area-studies',
    isEarned: (d) =>
      d.completions.some((c) => {
        if (c.areaId !== 'area-studies') return false;
        const task = d.tasks.find((t) => t.id === c.taskId);
        if (!task?.dueDate) return false;
        const due = new Date(task.dueDate + 'T00:00:00').getTime();
        const done = new Date(c.date + 'T00:00:00').getTime();
        return due - done >= 3 * 24 * 60 * 60 * 1000;
      }),
  },
  {
    id: 'iron-discipline',
    name: 'Iron Discipline',
    description: 'Reach a 30-day overall streak.',
    icon: '🛡️',
    isEarned: (d) => d.game.longestGlobalStreak >= 30,
  },
  {
    id: 'perfect-day',
    name: 'Perfect Day',
    description: 'Complete every scheduled task in a single day.',
    icon: '✨',
    // Evaluated explicitly by the store when a day is fully cleared.
    isEarned: () => false,
  },
  {
    id: 'level-5',
    name: 'Level 5',
    description: 'Reach overall Level 5.',
    icon: '⭐',
    isEarned: (d) => d.game.level >= 5,
  },
  {
    id: 'level-10',
    name: 'Level 10',
    description: 'Reach overall Level 10.',
    icon: '🌟',
    isEarned: (d) => d.game.level >= 10,
  },
];

export const BADGES_BY_ID: Record<string, BadgeDef> = Object.fromEntries(
  BADGES.map((b) => [b.id, b]),
);

// Returns badge ids newly earned (present in catalog, not yet in earned list).
export function findNewlyEarnedBadges(data: AppData): EarnedBadge[] {
  const earnedIds = new Set(data.game.earnedBadges.map((b) => b.badgeId));
  const now = new Date().toISOString();
  return BADGES.filter((b) => !earnedIds.has(b.id) && b.isEarned(data)).map((b) => ({
    badgeId: b.id,
    earnedAt: now,
    areaId: b.areaId,
  }));
}
