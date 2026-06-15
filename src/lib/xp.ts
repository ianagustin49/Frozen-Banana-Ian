import type { Difficulty } from '../types/models';

export const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};

export function baseXp(difficulty: Difficulty): number {
  return XP_BY_DIFFICULTY[difficulty];
}

// Reward consistency: a longer streak boosts XP, capped at 1.5x (10-day streak).
export function streakMultiplier(streak: number): number {
  return 1 + Math.min(Math.max(streak, 0), 10) * 0.05;
}

export function awardedXp(base: number, streak: number): number {
  return Math.round(base * streakMultiplier(streak));
}

// Cumulative XP required to *reach* a given level (triangular curve).
// level 1 = 0, level 2 = 100, level 3 = 300, level 4 = 600 ...
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return (100 * n * (n + 1)) / 2;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

// Progress within the current level, for rendering the XP bar.
export function levelProgress(xp: number): {
  level: number;
  intoLevel: number;
  levelSpan: number;
  pct: number;
} {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const span = ceil - floor;
  const into = xp - floor;
  return {
    level,
    intoLevel: into,
    levelSpan: span,
    pct: span > 0 ? Math.min(100, (into / span) * 100) : 0,
  };
}
