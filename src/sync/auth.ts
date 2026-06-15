import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSyncConfigured, supabase } from './supabaseClient';

// Email magic-link sign in. Returns an error message or null on success.
export async function signInWithEmail(email: string): Promise<string | null> {
  if (!supabase) return 'Sync is not configured.';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href },
  });
  return error ? error.message : null;
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}

// React hook exposing the current auth session (null when signed out / unconfigured).
export function useSession(): { session: Session | null; configured: boolean } {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, configured: isSyncConfigured };
}
