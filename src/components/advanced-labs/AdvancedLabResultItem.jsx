import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ChevronRight, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  'Pending':         { color: 'text-muted-foreground',  bg: 'bg-muted' },
  'Processing':      { color: 'text-blue-500',           bg: 'bg-blue-500/10' },
  'Normal':          { color: 'text-emerald-500',        bg: 'bg-emerald-500/10' },
  'Review Needed':   { color: 'text-amber-500',          bg: 'bg-amber-500/10' },
  'Action Required': { color: 'text-red-500',            bg: 'bg-red-500/10' },
};

export default function AdvancedLabResultItem({ result, onClick, delay = 0 }) {
  const cfg = STATUS_CONFIG[result.status] || STATUS_CONFIG['Pending'];
  const flaggedCount = result.biomarkers?.filter(b => b.flag && b.flag !== 'normal').length || 0;

  return (
    <motion.button
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.22 }}
      onClick={() => onClick(result)}
      className="w-full text-left bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all"
    >
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
        <FlaskConical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{result.test_name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {result.date_completed ? format(new Date(result.date_completed), 'MMM d, yyyy') : 'Awaiting results'}
        </p>
        {flaggedCount > 0 && (
          <p className="text-[10px] text-amber-500 mt-0.5">{flaggedCount} marker{flaggedCount > 1 ? 's' : ''} need attention</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', cfg.color, cfg.bg)}>
          {result.status}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </motion.button>
  );
}