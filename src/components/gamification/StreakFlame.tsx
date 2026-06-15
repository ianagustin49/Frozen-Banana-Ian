import { Flame } from 'lucide-react';

interface Props {
  streak: number;
  className?: string;
}

export default function StreakFlame({ streak, className = '' }: Props) {
  const active = streak > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-bold ${
        active ? 'text-orange-500' : 'text-slate-400'
      } ${className}`}
      title={`${streak}-day streak`}
    >
      <Flame size={16} className={active ? 'fill-orange-400' : ''} />
      {streak}
    </span>
  );
}
