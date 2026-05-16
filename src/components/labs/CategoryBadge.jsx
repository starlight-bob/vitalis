import { cn } from '@/lib/utils';

const CONFIG = {
  'Blood Work':    { color: 'bg-red-500/10 text-red-400 border-red-500/20',     dot: 'bg-red-400' },
  'Imaging':       { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',   dot: 'bg-blue-400' },
  'Urine':         { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400' },
  'Hormone Panel': { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dot: 'bg-purple-400' },
  'Other':         { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
};

export function getCategoryConfig(category) {
  return CONFIG[category] || CONFIG['Other'];
}

export default function CategoryBadge({ category, size = 'sm' }) {
  const cfg = getCategoryConfig(category);
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
      cfg.color
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {category}
    </span>
  );
}