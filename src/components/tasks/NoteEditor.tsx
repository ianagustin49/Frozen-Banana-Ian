import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { notesForTask } from '../../store/selectors';

interface Props {
  taskId: string;
  areaId: string;
}

// Notes attached to a task — "put notes in between tasks".
export default function NoteEditor({ taskId, areaId }: Props) {
  const notes = useAppStore((s) => notesForTask(s, taskId));
  const upsertNote = useAppStore((s) => s.upsertNote);
  const deleteNote = useAppStore((s) => s.deleteNote);
  const [draft, setDraft] = useState('');

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    upsertNote({ text, taskId, areaId });
    setDraft('');
  };

  return (
    <div className="mt-2 space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
      {notes.map((n) => (
        <div key={n.id} className="group flex items-start gap-2">
          <textarea
            className="flex-1 resize-none rounded-lg border border-transparent bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-accent-300 dark:bg-slate-900 dark:text-slate-200"
            value={n.text}
            rows={Math.max(1, n.text.split('\n').length)}
            onChange={(e) => upsertNote({ id: n.id, text: e.target.value, taskId, areaId })}
          />
          <button
            onClick={() => deleteNote(n.id)}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950"
            aria-label="Delete note"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-accent-300 dark:border-slate-700 dark:bg-slate-900"
          placeholder="Add a note…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button
          onClick={add}
          className="rounded-lg bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
        >
          Add
        </button>
      </div>
    </div>
  );
}
