interface Props {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

export default function LevelBadge({ level, size = 'md', color = '#6366f1' }: Props) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-extrabold text-white shadow-soft ${sizes[size]}`}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      title={`Level ${level}`}
    >
      {level}
    </div>
  );
}
