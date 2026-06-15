import { AnimatePresence, motion } from 'framer-motion';
import type { EarnedBadge } from '../../types/models';
import { BADGES_BY_ID } from '../../data/badges';

interface Props {
  badges: EarnedBadge[];
}

export default function BadgeToast({ badges }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {badges.map((b) => {
          const def = BADGES_BY_ID[b.badgeId];
          if (!def) return null;
          return (
            <motion.div
              key={b.badgeId + b.earnedAt}
              className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3 shadow-card dark:border-amber-900 dark:bg-slate-900"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
            >
              <span className="text-2xl">{def.icon}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
                  Badge unlocked
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{def.name}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
