import { cn } from '@/lib/utils';
import { HEALTH_METRICS } from '@/lib/correlationEngine';

const ALL = { key: 'all', label: 'All', emoji: '🔍' };
const FILTERS = [ALL, ...HEALTH_METRICS];

export default function CorrelationFilters({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 w-full" style={{ scrollbarWidth: 'none' }}>
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={cn(
            'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all',
            active === f.key
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border hover:bg-muted'
          )}
        >
          <span>{f.emoji}</span>
          <span>{f.label}</span>
        </button>
      ))}
    </div>
  );
}