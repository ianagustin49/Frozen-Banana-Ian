import type { ISODate, Task } from '../types/models';
import { dayOfWeek } from './dates';

// Is this task scheduled on the given day?
// Habits repeat per their recurrence; todos appear only on their dueDate.
export function isScheduledOn(task: Task, date: ISODate): boolean {
  if (task.archived) return false;

  if (task.type === 'todo') {
    return task.dueDate === date;
  }

  switch (task.recurrence.kind) {
    case 'daily':
      return true;
    case 'weekdays':
      return task.recurrence.days.includes(dayOfWeek(date));
    case 'none':
      return false;
  }
}

export function recurrenceLabel(task: Task): string {
  if (task.type === 'todo') return task.dueDate ? 'Due ' + task.dueDate : 'Anytime';
  switch (task.recurrence.kind) {
    case 'daily':
      return 'Every day';
    case 'weekdays': {
      const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return task.recurrence.days
        .slice()
        .sort((a, b) => a - b)
        .map((d) => names[d])
        .join(', ');
    }
    case 'none':
      return 'No schedule';
  }
}
