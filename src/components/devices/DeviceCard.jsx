import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, RefreshCw, Link2, Link2Off, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function DeviceCard({ device, connection, onConnect, onDisconnect, isSyncing, isUpdating }) {
  const isConnected = connection?.connected ?? false;
  const lastSync = connection?.last_sync;
  const busy = isSyncing || isUpdating;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative bg-card rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-300 overflow-hidden',
        isConnected
          ? 'border-primary/30 shadow-sm shadow-primary/10'
          : 'border-border hover:border-border/80'
      )}
    >
      {/* Connected glow strip */}
      {isConnected && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
      )}

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        {/* Logo + name */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'h-12 w-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm',
              device.bgClass
            )}
          >
            {device.logo}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm leading-tight">{device.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{device.category}</p>
          </div>
        </div>

        {/* Status badge */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium flex-shrink-0',
            isConnected
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {isConnected ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <Circle className="h-3 w-3" />
          )}
          {isConnected ? 'Connected' : 'Not Connected'}
        </div>
      </div>

      {/* Last sync */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground min-h-[16px]">
        <Clock className="h-3 w-3 flex-shrink-0" />
        {isConnected && lastSync ? (
          <span>Last synced {formatDistanceToNow(new Date(lastSync), { addSuffix: true })}</span>
        ) : isConnected ? (
          <span>Never synced</span>
        ) : (
          <span>Connect to start syncing</span>
        )}
        <AnimatePresence>
          {isSyncing && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="ml-1 text-primary font-medium flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3 animate-spin" /> Syncing…
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Action button */}
      {isConnected ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/40"
          onClick={() => onDisconnect(connection)}
          disabled={busy}
        >
          <Link2Off className="h-3.5 w-3.5" />
          Disconnect
        </Button>
      ) : (
        <Button
          size="sm"
          className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => onConnect(device)}
          disabled={busy}
        >
          <Link2 className="h-3.5 w-3.5" />
          Connect
        </Button>
      )}
    </motion.div>
  );
}