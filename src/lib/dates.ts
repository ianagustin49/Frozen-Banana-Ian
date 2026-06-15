import { format, parseISO } from 'date-fns';
import type { ISODate } from '../types/models';

// All "day" values are local-time ISO dates (yyyy-MM-dd).
export function toISODate(d: Date): ISODate {
  return format(d, 'yyyy-MM-dd');
}

export function fromISODate(d: ISODate): Date {
  return parseISO(d + 'T00:00:00');
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function dayOfWeek(d: ISODate): number {
  return fromISODate(d).getDay(); // 0=Sun .. 6=Sat
}

export function prettyDate(d: ISODate): string {
  return format(fromISODate(d), 'EEEE, MMM d');
}

export function addDaysISO(d: ISODate, days: number): ISODate {
  const date = fromISODate(d);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function diffInDays(a: ISODate, b: ISODate): number {
  const ms = fromISODate(a).getTime() - fromISODate(b).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}
