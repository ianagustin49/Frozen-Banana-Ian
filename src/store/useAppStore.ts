import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  AppData,
  Area,
  Completion,
  Difficulty,
  EarnedBadge,
  GameState,
  ISODate,
  Note,
  Recurrence,
  Task,
  TaskType,
} from '../types/models';
import { DEFAULT_AREAS } from '../data/defaultAreas';
import { findNewlyEarnedBadges } from '../data/badges';
import { SCHEMA_VERSION } from '../lib/backup';
import { awardedXp, baseXp, levelFromXp } from '../lib/xp';
import { areaStreaks, globalStreaks } from '../lib/streaks';
import { isScheduledOn } from '../lib/recurrence';
import { todayISO } from '../lib/dates';

const now = () => new Date().toISOString();

function emptyGame(areas: Area[]): GameState {
  return {
    totalXp: 0,
    level: 1,
    globalStreak: 0,
    longestGlobalStreak: 0,
    areaProgress: Object.fromEntries(
      areas.map((a) => [
        a.id,
        { areaId: a.id, xp: 0, level: 1, currentStreak: 0, longestStreak: 0 },
      ]),
    ),
    earnedBadges: [],
  };
}

function initialData(): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    areas: DEFAULT_AREAS,
    tasks: [],
    completions: [],
    notes: [],
    game: emptyGame(DEFAULT_AREAS),
    settings: { theme: 'light', weekStartsOn: 1 },
  };
}

// Ephemeral, non-persisted feedback surfaced to the UI after a completion.
export interface Feedback {
  id: string;
  xp?: number;
  levelUp?: number; // new global level if a level-up occurred
  badges: EarnedBadge[];
}

export interface NewTaskInput {
  areaId: string;
  title: string;
  type: TaskType;
  recurrence: Recurrence;
  difficulty: Difficulty;
  dueDate?: ISODate;
}

interface AppStore extends AppData {
  feedback: Feedback | null;

  // task mutations
  addTask: (input: NewTaskInput) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  archiveTask: (id: string) => void;
  setDifficulty: (id: string, difficulty: Difficulty) => void;

  // completions
  completeTask: (taskId: string, date?: ISODate) => void;
  uncompleteTask: (taskId: string, date?: ISODate) => void;

  // notes
  upsertNote: (note: Partial<Note> & { id?: string }) => void;
  deleteNote: (id: string) => void;

  // areas
  updateArea: (id: string, patch: Partial<Area>) => void;

  // settings / data
  setTheme: (theme: 'light' | 'dark') => void;
  importData: (data: AppData) => void;
  resetAll: () => void;
  runDailyMaintenance: () => void;

  clearFeedback: () => void;
}

// Recompute the entire game state from areas + tasks + completions.
// Keeping this as one pure recompute avoids streak/level drift.
function recomputeGame(
  areas: Area[],
  tasks: Task[],
  completions: Completion[],
  previous: GameState,
  today: ISODate,
): GameState {
  const areaProgress: GameState['areaProgress'] = {};
  for (const area of areas) {
    const xp = completions
      .filter((c) => c.areaId === area.id)
      .reduce((sum, c) => sum + c.xpAwarded, 0);
    const { current, longest } = areaStreaks(area.id, tasks, completions, today);
    const prevLongest = previous.areaProgress[area.id]?.longestStreak ?? 0;
    const lastCompletedDate = completions
      .filter((c) => c.areaId === area.id)
      .reduce<ISODate | undefined>((max, c) => (!max || c.date > max ? c.date : max), undefined);
    areaProgress[area.id] = {
      areaId: area.id,
      xp,
      level: levelFromXp(xp),
      currentStreak: current,
      longestStreak: Math.max(longest, prevLongest),
      lastCompletedDate,
    };
  }

  const totalXp = completions.reduce((sum, c) => sum + c.xpAwarded, 0);
  const global = globalStreaks(completions, today);

  return {
    totalXp,
    level: levelFromXp(totalXp),
    globalStreak: global.current,
    longestGlobalStreak: Math.max(global.longest, previous.longestGlobalStreak),
    lastActiveDate: completions.length ? today : previous.lastActiveDate,
    areaProgress,
    earnedBadges: previous.earnedBadges,
  };
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialData(),
      feedback: null,

      addTask: (input) =>
        set((s) => {
          const ts = now();
          const orderBase = s.tasks.filter((t) => t.areaId === input.areaId).length;
          const task: Task = {
            id: nanoid(),
            areaId: input.areaId,
            title: input.title.trim(),
            type: input.type,
            recurrence: input.recurrence,
            dueDate: input.dueDate,
            difficulty: input.difficulty,
            xp: baseXp(input.difficulty),
            archived: false,
            createdAt: ts,
            updatedAt: ts,
            order: orderBase,
          };
          return { tasks: [...s.tasks, task] };
        }),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: now() } : t,
          ),
        })),

      setDifficulty: (id, difficulty) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, difficulty, xp: baseXp(difficulty), updatedAt: now() } : t,
          ),
        })),

      archiveTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, archived: true, updatedAt: now() } : t,
          ),
        })),

      completeTask: (taskId, date = todayISO()) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId);
          if (!task) return {};
          // Already completed for that day? no-op.
          if (s.completions.some((c) => c.taskId === taskId && c.date === date)) return {};

          // Multiplier uses the streak as it stands before today's completion.
          const priorStreak = s.game.areaProgress[task.areaId]?.currentStreak ?? 0;
          const xp = awardedXp(task.xp, priorStreak);

          const completion: Completion = {
            id: nanoid(),
            taskId,
            areaId: task.areaId,
            date,
            completedAt: now(),
            xpAwarded: xp,
          };
          const completions = [...s.completions, completion];
          const prevLevel = s.game.level;
          let game = recomputeGame(s.areas, s.tasks, completions, s.game, todayISO());

          // Perfect Day: all tasks scheduled today are now complete.
          const data: AppData = { ...s, tasks: s.tasks, completions, game };
          const scheduledToday = s.tasks.filter((t) => isScheduledOn(t, date));
          const completedToday = new Set(
            completions.filter((c) => c.date === date).map((c) => c.taskId),
          );
          const perfectDay =
            scheduledToday.length > 0 &&
            scheduledToday.every((t) => completedToday.has(t.id)) &&
            !game.earnedBadges.some((b) => b.badgeId === 'perfect-day');

          const newBadges = findNewlyEarnedBadges(data);
          if (perfectDay) newBadges.push({ badgeId: 'perfect-day', earnedAt: now() });
          if (newBadges.length) {
            game = { ...game, earnedBadges: [...game.earnedBadges, ...newBadges] };
          }

          const leveledUp = game.level > prevLevel ? game.level : undefined;

          return {
            completions,
            game,
            feedback: { id: nanoid(), xp, levelUp: leveledUp, badges: newBadges },
          };
        }),

      uncompleteTask: (taskId, date = todayISO()) =>
        set((s) => {
          const completions = s.completions.filter(
            (c) => !(c.taskId === taskId && c.date === date),
          );
          if (completions.length === s.completions.length) return {};
          const game = recomputeGame(s.areas, s.tasks, completions, s.game, todayISO());
          return { completions, game };
        }),

      upsertNote: (note) =>
        set((s) => {
          const ts = now();
          if (note.id && s.notes.some((n) => n.id === note.id)) {
            return {
              notes: s.notes.map((n) =>
                n.id === note.id ? { ...n, ...note, updatedAt: ts } : n,
              ),
            };
          }
          const created: Note = {
            id: note.id ?? nanoid(),
            text: note.text ?? '',
            taskId: note.taskId,
            date: note.date,
            areaId: note.areaId,
            createdAt: ts,
            updatedAt: ts,
          };
          return { notes: [...s.notes, created] };
        }),

      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      updateArea: (id, patch) =>
        set((s) => ({
          areas: s.areas.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),

      importData: (data) =>
        set(() => ({
          schemaVersion: SCHEMA_VERSION,
          areas: data.areas,
          tasks: data.tasks,
          completions: data.completions,
          notes: data.notes ?? [],
          game: data.game,
          settings: data.settings ?? { theme: 'light', weekStartsOn: 1 },
        })),

      resetAll: () => set(() => ({ ...initialData(), feedback: null })),

      // Run on app load: recompute streaks/levels so a missed day resets the
      // current streak (longest is preserved inside recomputeGame).
      runDailyMaintenance: () =>
        set((s) => ({
          game: recomputeGame(s.areas, s.tasks, s.completions, s.game, todayISO()),
        })),

      clearFeedback: () => set(() => ({ feedback: null })),
    }),
    {
      name: 'frozen-banana:v1',
      version: SCHEMA_VERSION,
      partialize: (s): AppData => ({
        schemaVersion: s.schemaVersion,
        areas: s.areas,
        tasks: s.tasks,
        completions: s.completions,
        notes: s.notes,
        game: s.game,
        settings: s.settings,
      }),
    },
  ),
);
