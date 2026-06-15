import type { AppData, Area, Completion, ISODate, ScheduledTask, Task } from '../types/models';
import { isScheduledOn } from '../lib/recurrence';

export function activeAreas(areas: Area[]): Area[] {
  return areas.filter((a) => !a.archived).sort((a, b) => a.order - b.order);
}

export function areaById(areas: Area[], id: string): Area | undefined {
  return areas.find((a) => a.id === id);
}

// All tasks scheduled for a given day, annotated with completion state.
export function tasksForDate(
  tasks: Task[],
  completions: Completion[],
  date: ISODate,
): ScheduledTask[] {
  const onDay = completions.filter((c) => c.date === date);
  return tasks
    .filter((t) => isScheduledOn(t, date))
    .map((task) => {
      const completion = onDay.find((c) => c.taskId === task.id);
      return { task, completed: !!completion, completion };
    })
    .sort((a, b) => a.task.order - b.task.order);
}

export interface AreaGroup {
  area: Area;
  items: ScheduledTask[];
  doneCount: number;
}

export function groupByArea(
  areas: Area[],
  scheduled: ScheduledTask[],
): AreaGroup[] {
  return activeAreas(areas)
    .map((area) => {
      const items = scheduled.filter((s) => s.task.areaId === area.id);
      return { area, items, doneCount: items.filter((i) => i.completed).length };
    })
    .filter((g) => g.items.length > 0);
}

export function dayCompletion(scheduled: ScheduledTask[]): { done: number; total: number; pct: number } {
  const total = scheduled.length;
  const done = scheduled.filter((s) => s.completed).length;
  return { done, total, pct: total > 0 ? (done / total) * 100 : 0 };
}

// Per-day summary for the calendar grid: which areas had completions, and how many.
export interface DayIntensity {
  date: ISODate;
  count: number;
  areaColors: string[];
}

export function calendarIntensity(data: AppData, dates: ISODate[]): Record<ISODate, DayIntensity> {
  const byDate: Record<ISODate, DayIntensity> = {};
  for (const d of dates) byDate[d] = { date: d, count: 0, areaColors: [] };
  for (const c of data.completions) {
    const entry = byDate[c.date];
    if (!entry) continue;
    entry.count++;
    const area = data.areas.find((a) => a.id === c.areaId);
    if (area && !entry.areaColors.includes(area.color)) entry.areaColors.push(area.color);
  }
  return byDate;
}

export function notesForTask(data: AppData, taskId: string) {
  return data.notes.filter((n) => n.taskId === taskId);
}
