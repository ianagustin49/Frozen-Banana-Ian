import type { Area } from '../types/models';

// Ian's five life areas, seeded on first run. Editable in Settings.
export const DEFAULT_AREAS: Area[] = [
  { id: 'area-banana', name: 'Frozen Banana Business', shortName: 'Banana', color: '#facc15', icon: '🍌', order: 0, archived: false },
  { id: 'area-drums', name: 'Drum Lessons', shortName: 'Drums', color: '#fb7185', icon: '🥁', order: 1, archived: false },
  { id: 'area-web', name: 'Website Building', shortName: 'Websites', color: '#38bdf8', icon: '💻', order: 2, archived: false },
  { id: 'area-fitness', name: 'Workouts', shortName: 'Fitness', color: '#34d399', icon: '💪', order: 3, archived: false },
  { id: 'area-studies', name: 'Studies', shortName: 'School', color: '#a78bfa', icon: '📚', order: 4, archived: false },
];
