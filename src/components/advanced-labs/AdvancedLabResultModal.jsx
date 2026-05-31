import { motion, AnimatePresence } from 'framer-motion';
import { X, FlaskConical, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import BiomarkerRow from './BiomarkerRow';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  'Pending':         { color: 'text-muted-foreground',  bg: 'bg-muted' },
  'Processing':      { color: 'text-blue-500',           bg: 'bg-blue-500/10' },
  'Normal':          { color: 'text-emerald-500',        bg: 'bg-emerald-500/10' },
  'Review Needed':   { color: 'text-amber-500',          bg: 'bg-amber-500/10' },
  'Action Required': { color: 'text-red-500',            bg: 'bg-red-500/10' },
};

export default function AdvancedLabResultModal({ result, onClose }) {
  if (!result) return null;
  const cfg = STATUS_CONFIG[result.status] || STATUS_CONFIG['Pending'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">{result.test_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {result.date_completed && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(result.date_completed), 'MMM d, yyyy')}
                    </div>
                  )}
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', cfg.color, cfg.bg)}>
                    {result.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Biomarkers */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {result.biomarkers?.length > 0 ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Biomarkers ({result.biomarkers.length})
              </p>
              {result.biomarkers.map((b, i) => (
                <BiomarkerRow key={i} biomarker={b} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FlaskConical className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">Results pending</p>
              <p className="text-xs text-muted-foreground mt-1">Your biomarker data will appear here once processed</p>
            </div>
          )}

          {result.notes && (
            <div className="mt-4 p-4 bg-muted rounded-xl">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-foreground">{result.notes}</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-8 pt-4 border-t border-border flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="w-full rounded-xl">Close</Button>
        </div>
      </motion.div>
    </div>
  );
}