import { motion } from 'framer-motion';

// Soft, slow-moving colored blobs that drift behind the dashboard header to
// give the page life without overwhelming the minimal look.
const BLOBS = [
  { color: '#a5b4fc', size: 170, x: [0, 28, 0], y: [0, 18, 0], dur: 9, pos: { top: -50, left: -30 } },
  { color: '#fcd34d', size: 140, x: [0, -22, 0], y: [0, 24, 0], dur: 11, pos: { top: -30, right: -10 } },
  { color: '#6ee7b7', size: 130, x: [0, 20, 0], y: [0, -22, 0], dur: 13, pos: { bottom: -60, left: '40%' } },
  { color: '#f9a8d4', size: 110, x: [0, -18, 0], y: [0, -16, 0], dur: 12, pos: { bottom: -40, right: '30%' } },
];

export default function AnimatedBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-50 blur-2xl dark:opacity-30"
          style={{ width: b.size, height: b.size, background: b.color, ...b.pos }}
          animate={{ x: b.x, y: b.y, scale: [1, 1.12, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
