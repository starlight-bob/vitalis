import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function SyncButton({ onSync, isSyncing, justSynced, connectedCount }) {
  return (
    <Button
      onClick={onSync}
      disabled={isSyncing || connectedCount === 0}
      variant="outline"
      className={cn(
        'gap-2 transition-all duration-300 border',
        justSynced
          ? 'border-primary/40 text-primary bg-primary/5'
          : 'border-border text-muted-foreground hover:text-foreground'
      )}
    >
      <AnimatePresence mode="wait">
        {isSyncing ? (
          <motion.span key="syncing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" /> Syncing…
          </motion.span>
        ) : justSynced ? (
          <motion.span key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Synced!
          </motion.span>
        ) : (
          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Sync All
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}