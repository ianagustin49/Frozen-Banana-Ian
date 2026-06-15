import type { RealtimeChannel } from '@supabase/supabase-js';
import type { AppData, Area, Completion, Note, Task } from '../types/models';
import { useAppStore } from '../store/useAppStore';
import { supabase } from './supabaseClient';

const TABLE = 'app_states';

// Merge two records by id, keeping the most recently updated version, and
// keeping ids that exist on only one side. This is what prevents a task edited
// on the phone and a different task edited on the laptop from clobbering.
function mergeById<T extends { id: string; updatedAt?: string }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of local) map.set(item.id, item);
  for (const item of remote) {
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else {
      const a = existing.updatedAt ?? '';
      const b = item.updatedAt ?? '';
      if (b > a) map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

function unionById<T extends { id: string }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of [...local, ...remote]) map.set(item.id, item);
  return Array.from(map.values());
}

export function mergeAppData(local: AppData, remote: AppData): AppData {
  return {
    schemaVersion: Math.max(local.schemaVersion, remote.schemaVersion),
    areas: mergeById<Area>(local.areas, remote.areas),
    tasks: mergeById<Task>(local.tasks, remote.tasks),
    // Completions are an append-only log — never lose one.
    completions: unionById<Completion>(local.completions, remote.completions),
    notes: mergeById<Note>(local.notes, remote.notes),
    // Game state is derived; recomputed by runDailyMaintenance after merge.
    // We keep the union of earned badges and the higher records.
    game: {
      ...local.game,
      earnedBadges: (() => {
        const seen = new Set<string>();
        return [...local.game.earnedBadges, ...remote.game.earnedBadges].filter((b) => {
          if (seen.has(b.badgeId)) return false;
          seen.add(b.badgeId);
          return true;
        });
      })(),
      longestGlobalStreak: Math.max(
        local.game.longestGlobalStreak,
        remote.game.longestGlobalStreak,
      ),
    },
    settings: local.settings,
  };
}

function snapshot(): AppData {
  const s = useAppStore.getState();
  return {
    schemaVersion: s.schemaVersion,
    areas: s.areas,
    tasks: s.tasks,
    completions: s.completions,
    notes: s.notes,
    game: s.game,
    settings: s.settings,
  };
}

async function pull(userId: string): Promise<AppData | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data.data as AppData;
}

async function push(userId: string, data: AppData): Promise<void> {
  if (!supabase) return;
  await supabase
    .from(TABLE)
    .upsert({ user_id: userId, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
}

let channel: RealtimeChannel | null = null;
let unsubscribeStore: (() => void) | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let applyingRemote = false;

function schedulePush(userId: string) {
  if (applyingRemote) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void push(userId, snapshot()), 1200);
}

async function syncFromRemote(userId: string) {
  const remote = await pull(userId);
  if (!remote) {
    await push(userId, snapshot());
    return;
  }
  applyingRemote = true;
  const merged = mergeAppData(snapshot(), remote);
  useAppStore.getState().importData(merged);
  useAppStore.getState().runDailyMaintenance();
  applyingRemote = false;
  await push(userId, snapshot());
}

export async function startSync(userId: string): Promise<void> {
  if (!supabase) return;
  await syncFromRemote(userId);

  channel = supabase
    .channel('app_state_' + userId)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE, filter: `user_id=eq.${userId}` },
      () => {
        if (!applyingRemote) void syncFromRemote(userId);
      },
    )
    .subscribe();

  unsubscribeStore = useAppStore.subscribe(() => schedulePush(userId));

  // Pull again whenever the tab regains focus (covers missed realtime events).
  window.addEventListener('focus', () => void syncFromRemote(userId));
}

export function stopSync(): void {
  if (channel) supabase?.removeChannel(channel);
  channel = null;
  if (unsubscribeStore) unsubscribeStore();
  unsubscribeStore = null;
}
