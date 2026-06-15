// Core data model for the Frozen Banana tracker.
// The completion log is the source of truth — calendar, streaks and stats are
// all derived from it. Never store a `completed` boolean on a Task.

export type ID = string;
export type ISODate = string; // "2026-06-15" (local day granularity)
export type ISODateTime = string; // full ISO timestamp for ordering / sync merge

export type Difficulty = 'easy' | 'medium' | 'hard';
export type TaskType = 'habit' | 'todo';

export interface Area {
  id: ID;
  name: string;
  shortName: string;
  color: string; // hex, used for dots / accents
  icon: string; // emoji
  order: number;
  archived: boolean;
}

export type Recurrence =
  | { kind: 'none' }
  | { kind: 'daily' }
  | { kind: 'weekdays'; days: number[] }; // 0=Sun .. 6=Sat

export interface Task {
  id: ID;
  areaId: ID;
  title: string;
  type: TaskType;
  recurrence: Recurrence; // 'none' for todos; daily/weekdays for habits
  dueDate?: ISODate; // todos only
  difficulty: Difficulty;
  xp: number; // base XP (resolved from difficulty, overridable)
  archived: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  order: number;
}

export interface Completion {
  id: ID;
  taskId: ID;
  areaId: ID; // denormalized for fast stats
  date: ISODate; // the day it counts for
  completedAt: ISODateTime;
  xpAwarded: number;
}

export interface Note {
  id: ID;
  text: string;
  taskId?: ID; // attached to a task, OR
  date?: ISODate; // a standalone dated note
  areaId?: ID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface AreaProgress {
  areaId: ID;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: ISODate;
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: ISODateTime;
  areaId?: ID;
}

export interface GameState {
  totalXp: number;
  level: number;
  globalStreak: number;
  longestGlobalStreak: number;
  lastActiveDate?: ISODate;
  areaProgress: Record<ID, AreaProgress>;
  earnedBadges: EarnedBadge[];
}

export interface Settings {
  theme: 'light' | 'dark';
  weekStartsOn: 0 | 1; // 0=Sun, 1=Mon
}

export interface AppData {
  schemaVersion: number;
  areas: Area[];
  tasks: Task[];
  completions: Completion[];
  notes: Note[];
  game: GameState;
  settings: Settings;
}

// A task resolved for a particular day, annotated with completion state.
export interface ScheduledTask {
  task: Task;
  completed: boolean;
  completion?: Completion;
}
