import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Watch, RefreshCw, Trash2, Plus, ChevronLeft, CheckCircle2, XCircle, Clock, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const FREQ_OPTIONS = [
  { value: '5min',  label: 'Every 5 min' },
  { value: '15min', label: 'Every 15 min' },
  { value: '30min', label: 'Every 30 min' },
  { value: '1hr',   label: 'Every hour' },
];

const MOCK_BATTERY = 72;
const MOCK_FIRMWARE = 'v4.12.1';

const ADD_DEVICES = [
  { id: 'apple_watch', name: 'Apple Watch', icon: '⌚', sub: 'Series 4 and later' },
  { id: 'garmin', name: 'Garmin', icon: '🟡', sub: 'All models via Connect IQ' },
  { id: 'fitbit', name: 'Fitbit', icon: '📟', sub: 'Charge, Sense, Versa' },
  { id: 'oura', name: 'Oura Ring', icon: '💍', sub: 'Gen 2 & Gen 3' },
  { id: 'whoop', name: 'WHOOP', icon: '💪', sub: 'WHOOP 4.0 & 5.0' },
  { id: 'samsung', name: 'Galaxy Watch', icon: '🔵', sub: 'Galaxy Watch 4+' },
  { id: 'manual', name: 'Manual Entry', icon: '✏️', sub: 'Log data manually' },
];

function getBatteryColor(pct) {
  if (pct >= 75) return 'bg-emerald-500';
  if (pct >= 30) return 'bg-yellow-400';
  return 'bg-red-500';
}

function Toggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-5 w-9 rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
    </button>
  );
}

const MOCK_SYNC_LOG = [
  { id: 1, status: 'success', device: 'Apple Watch', time: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 2, status: 'success', device: 'Garmin Connect', time: new Date(Date.now() - 1000 * 60 * 62) },
  { id: 3, status: 'failed', device: 'Oura Ring', time: new Date(Date.now() - 1000 * 60 * 120) },
  { id: 4, status: 'success', device: 'Apple Watch', time: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: 5, status: 'success', device: 'WHOOP', time: new Date(Date.now() - 1000 * 60 * 60 * 8) },
  { id: 6, status: 'success', device: 'Apple Watch', time: new Date(Date.now() - 1000 * 60 * 60 * 11) },
  { id: 7, status: 'failed', device: 'Garmin Connect', time: new Date(Date.now() - 1000 * 60 * 60 * 14) },
  { id: 8, status: 'success', device: 'Apple Watch', time: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: 9, status: 'success', device: 'WHOOP', time: new Date(Date.now() - 1000 * 60 * 60 * 30) },
  { id: 10, status: 'success', device: 'Apple Watch', time: new Date(Date.now() - 1000 * 60 * 60 * 36) },
];

export default function DeviceSettings() {
  const [syncing, setSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [bgSync, setBgSync] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [syncFreq, setSyncFreq] = useState('15min');
  const [freqSheetOpen, setFreqSheetOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data: connections = [] } = useQuery({
    queryKey: ['deviceConnections'],
    queryFn: () => base44.entities.DeviceConnection.list(),
  });

  const connected = connections.filter(c => c.connected);
  const primary = connected[0] || null;

  const removeMutation = useMutation({
    mutationFn: async (conn) => base44.entities.DeviceConnection.update(conn.id, { connected: false }),
    onMutate: async (conn) => {
      await queryClient.cancelQueries({ queryKey: ['deviceConnections'] });
      const prev = queryClient.getQueryData(['deviceConnections']);
      queryClient.setQueryData(['deviceConnections'], (old = []) =>
        old.map(c => c.id === conn.id ? { ...c, connected: false } : c)
      );
      return { prev };
    },
    onError: (_err, _conn, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['deviceConnections'], ctx.prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceConnections'] });
      toast.success('Device removed');
    },
  });

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1800));
    if (primary) {
      await base44.entities.DeviceConnection.update(primary.id, { last_sync: new Date().toISOString() });
      queryClient.invalidateQueries({ queryKey: ['deviceConnections'] });
    }
    setSyncing(false);
    toast.success('Sync complete');
  };

  const handleAdd = (device) => {
    toast.info(`${device.name} — OAuth pairing coming soon`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4 flex items-center gap-3">
        <Link to="/" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors">
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </Link>
        <h1 className="text-base font-semibold tracking-tight text-foreground">Device Settings</h1>
      </div>

      <div className="px-4 py-6 space-y-6">

        {/* Connected Device Card */}
        {primary ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Watch className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{primary.device_name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-emerald-600">Connected</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
            </div>

            {/* Battery bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Battery</span>
                <span className="text-[11px] text-slate-600 font-medium">{MOCK_BATTERY}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getBatteryColor(MOCK_BATTERY)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${MOCK_BATTERY}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted border border-border rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground mb-0.5">Firmware</p>
                <p className="text-xs font-medium text-foreground">{MOCK_FIRMWARE}</p>
              </div>
              <div className="bg-muted border border-border rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground mb-0.5">Last Sync</p>
                <p className="text-xs font-medium text-foreground">
                  {primary.last_sync
                    ? formatDistanceToNow(new Date(primary.last_sync), { addSuffix: true })
                    : 'Never'}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-5 text-center">
            <Watch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No device connected</p>
          </div>
        )}

        {/* My Devices */}
        {connections.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">My Devices</p>
            <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
              {connections.map((conn) => (
                <div key={conn.id} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${conn.connected ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{conn.device_name}</p>
                      <p className="text-[10px] text-muted-foreground">{conn.connected ? 'Active' : 'Disconnected'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRemoveTarget(conn)}
                    className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Add New Device */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Add New Device</p>
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {ADD_DEVICES.map((d) => (
              <button
                key={d.id}
                onClick={() => handleAdd(d)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg leading-none">{d.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    <p className="text-[10px] text-muted-foreground">{d.sub}</p>
                  </div>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Sync Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Sync Settings</p>
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {[
              { label: 'Auto-Sync', sub: 'Automatically sync when in range', val: autoSync, set: setAutoSync },
              { label: 'Background Sync', sub: 'Sync while app is in background', val: bgSync, set: setBgSync },
              { label: 'Wi-Fi Only', sub: 'Only sync on Wi-Fi connections', val: wifiOnly, set: setWifiOnly },
            ].map(({ label, sub, val, set }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
                <Toggle enabled={val} onToggle={() => set(v => !v)} />
              </div>
            ))}

            {/* Sync Frequency */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-foreground">Sync Frequency</p>
                <p className="text-[10px] text-muted-foreground">How often to check for new data</p>
              </div>
              <button
                onClick={() => setFreqSheetOpen(true)}
                className="flex items-center gap-1.5 bg-muted border border-border text-foreground text-xs rounded-lg px-2.5 py-1.5"
              >
                {FREQ_OPTIONS.find(o => o.value === syncFreq)?.label}
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Sync Log */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Sync Log</p>
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {MOCK_SYNC_LOG.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                {entry.status === 'success'
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  : <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{entry.device}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.status === 'success' ? 'Sync successful' : 'Sync failed'}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(entry.time, { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Sync Frequency Sheet */}
      <Sheet open={freqSheetOpen} onOpenChange={setFreqSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl safe-bottom">
          <SheetHeader className="mb-4">
            <SheetTitle>Sync Frequency</SheetTitle>
          </SheetHeader>
          <div className="space-y-1 pb-2">
            {FREQ_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setSyncFreq(opt.value); setFreqSheetOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  syncFreq === opt.value ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Remove Device AlertDialog */}
      <AlertDialog open={!!removeTarget} onOpenChange={open => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Device?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect <strong>{removeTarget?.device_name}</strong>. You can reconnect it at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { removeMutation.mutate(removeTarget); setRemoveTarget(null); }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}