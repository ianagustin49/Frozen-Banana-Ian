import type { AppData } from '../types/models';

export const SCHEMA_VERSION = 1;

export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function downloadBackup(data: AppData): void {
  const blob = new Blob([exportData(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `frozen-banana-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Light validation: confirm it looks like our blob before importing.
export function parseBackup(json: string): AppData {
  const parsed = JSON.parse(json) as Partial<AppData>;
  if (
    !parsed ||
    !Array.isArray(parsed.areas) ||
    !Array.isArray(parsed.tasks) ||
    !Array.isArray(parsed.completions) ||
    !parsed.game
  ) {
    throw new Error('This file does not look like a Frozen Banana backup.');
  }
  return parsed as AppData;
}
