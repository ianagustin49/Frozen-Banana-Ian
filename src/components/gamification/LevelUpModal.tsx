import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  level: number | null;
  onClose: () => void;
}

export default function LevelUpModal({ level, onClose }: Props) {
  return (
    <AnimatePresence>
      {level !== null && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="flex flex-col items-center gap-3 rounded-3xl bg-white px-10 py-8 text-center shadow-card dark:bg-slate-900"
            initial={{ scale: 0.7, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-5xl">🎉</span>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-500">Level Up</p>
            <p className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">Level {level}</p>
            <p className="max-w-[16rem] text-sm text-slate-500 dark:text-slate-400">
              Keep showing up — momentum is building. Tap anywhere to continue.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
