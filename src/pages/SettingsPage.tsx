import { useRef, useState } from 'react';
import { Download, LogOut, Moon, RefreshCw, Sun, Upload } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { downloadBackup, parseBackup } from '../lib/backup';
import { signInWithEmail, signOut, useSession } from '../sync/auth';
import Button from '../components/ui/Button';

export default function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const setTheme = useAppStore((s) => s.setTheme);
  const importData = useAppStore((s) => s.importData);
  const resetAll = useAppStore((s) => s.resetAll);
  const fileRef = useRef<HTMLInputElement>(null);

  const { session, configured } = useSession();
  const [email, setEmail] = useState('');
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const onImport = (file: File) => {
    file.text().then((text) => {
      try {
        importData(parseBackup(text));
        alert('Backup restored.');
      } catch (e) {
        alert((e as Error).message);
      }
    });
  };

  const sendLink = async () => {
    setSyncMsg(null);
    const err = await signInWithEmail(email.trim());
    setSyncMsg(err ?? 'Check your email for a sign-in link.');
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Settings</h1>
      </header>

      <Section title="Appearance">
        <div className="flex gap-2">
          <Button
            variant={settings.theme === 'light' ? 'primary' : 'subtle'}
            onClick={() => setTheme('light')}
          >
            <Sun size={16} /> Light
          </Button>
          <Button
            variant={settings.theme === 'dark' ? 'primary' : 'subtle'}
            onClick={() => setTheme('dark')}
          >
            <Moon size={16} /> Dark
          </Button>
        </div>
      </Section>

      <Section
        title="Sync across devices"
        hint={
          configured
            ? 'Sign in with your email to keep your tasks and streaks in sync on your phone and laptop.'
            : 'Sync is not set up yet. The app still works fully on this device. Add a Supabase project to enable phone + laptop sync (see SETUP.md).'
        }
      >
        {configured ? (
          session ? (
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/40">
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Synced</p>
                <p className="text-xs text-emerald-600/80">{session.user.email}</p>
              </div>
              <Button variant="subtle" onClick={() => void signOut()}>
                <LogOut size={16} /> Sign out
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent-400 dark:border-slate-700 dark:bg-slate-800"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={sendLink} disabled={!email.includes('@')}>
                  Send link
                </Button>
              </div>
              {syncMsg && <p className="text-xs text-slate-500">{syncMsg}</p>}
            </div>
          )
        ) : (
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800">
            Local-only mode. Your data is saved in this browser.
          </div>
        )}
      </Section>

      <Section title="Backup" hint="Export your data as a file, or restore it on another device.">
        <div className="flex gap-2">
          <Button variant="subtle" onClick={() => downloadBackup(useAppStore.getState())}>
            <Download size={16} /> Export
          </Button>
          <Button variant="subtle" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Import
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
          />
        </div>
      </Section>

      <Section title="Danger zone">
        <Button
          variant="danger"
          onClick={() => {
            if (confirm('Erase all tasks, notes and progress? This cannot be undone.')) resetAll();
          }}
        >
          <RefreshCw size={16} /> Reset everything
        </Button>
      </Section>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h2>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
