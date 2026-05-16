import { motion } from 'framer-motion';
import { FileText, ImageIcon, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import CategoryBadge, { getCategoryConfig } from './CategoryBadge';
import { cn } from '@/lib/utils';

export default function LabTimelineItem({ result, onClick, isLast, delay = 0 }) {
  const isImage = result.file_type?.startsWith('image/');
  const cfg = getCategoryConfig(result.category);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="relative flex gap-4"
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0 w-8">
        <div className={cn('h-3 w-3 rounded-full border-2 border-card mt-4 flex-shrink-0 z-10', cfg.dot)} />
        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
      </div>

      {/* Card */}
      <button
        onClick={() => onClick(result)}
        className="flex-1 mb-4 bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5 transition-all duration-200 group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <CategoryBadge category={result.category} />
              <span className="text-[11px] text-muted-foreground">
                {format(new Date(result.date + 'T00:00:00'), 'MMM d, yyyy')}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">{result.title}</p>
            {result.notes && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{result.notes}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {result.file_url && (
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                {isImage ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              </div>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>
      </button>
    </motion.div>
  );
}