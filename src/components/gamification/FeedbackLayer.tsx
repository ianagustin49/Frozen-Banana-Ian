import { useEffect, useState } from 'react';
import type { EarnedBadge } from '../../types/models';
import { useAppStore } from '../../store/useAppStore';
import LevelUpModal from './LevelUpModal';
import BadgeToast from './BadgeToast';

// Watches the store's ephemeral feedback and surfaces level-ups and badges.
export default function FeedbackLayer() {
  const feedback = useAppStore((s) => s.feedback);
  const clearFeedback = useAppStore((s) => s.clearFeedback);

  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);

  useEffect(() => {
    if (!feedback) return;
    if (feedback.levelUp) setLevelUp(feedback.levelUp);
    if (feedback.badges.length) {
      setBadges(feedback.badges);
      const t = setTimeout(() => setBadges([]), 4000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  // Consume the feedback event once read.
  useEffect(() => {
    if (feedback) clearFeedback();
  }, [feedback, clearFeedback]);

  return (
    <>
      <BadgeToast badges={badges} />
      <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} />
    </>
  );
}
