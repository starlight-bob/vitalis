import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plug, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import DeviceCard from '@/components/devices/DeviceCard';
import SyncButton from '@/components/devices/SyncButton';

const DEVICES = [
  {
    id: 'apple_health',
    name: '苹果健康',
    category: 'Apple Health',
    logo: '🍎',
    bgClass: 'bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30',
  },
  {
    id: 'huawei_health',
    name: '华为',
    category: '华为运动健康',
    logo: '❤️',
    bgClass: 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30',
  },
  {
    id: 'garmin',
    name: 'Garmin Connect',
    category: 'Sports Watch',
    logo: '⌚',
    bgClass: 'bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-800/50 dark:to-gray-800/50',
  },
  {
    id: 'google_fitbit',
    name: 'Google Fitbit',
    category: 'Fitness Tracker',
    logo: '📟',
    bgClass: 'bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30',
  },
  {
    id: 'whoop',
    name: 'WHOOP',
    category: 'Recovery Tracker',
    logo: '💪',
    bgClass: 'bg-gradient-to-br from-black/5 to-zinc-200 dark:from-zinc-800/50 dark:to-zinc-700/30',
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    category: 'Smart Ring',
    logo: '💍',
    bgClass: 'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30',
  },
  {
    id: 'samsung_health',
    name: 'Samsung Health',
    category: 'Smartphone Platform',
    logo: '🔵',
    bgClass: 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30',
  },
];

export default function ConnectDevices() {
  const [syncingIds, setSyncingIds] = useState(new Set());
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['deviceConnections'],
    queryFn: () => base44.entities.DeviceConnection.list(),
  });

  const connectionMap = Object.fromEntries(connections.map(c => [c.device_id, c]));

  const connectMutation = useMutation({
    mutationFn: async (device) => {
      setUpdatingIds(prev => new Set([...prev, device.id]));
      // Check if record exists
      const existing = connectionMap[device.id];
      if (existing) {
        return base44.entities.DeviceConnection.update(existing.id, {
          connected: true,
          last_sync: new Date().toISOString(),
        });
      }
      return base44.entities.DeviceConnection.create({
        device_id: device.id,
        device_name: device.name,
        connected: true,
        last_sync: new Date().toISOString(),
      });
    },
    onSuccess: (_, device) => {
      queryClient.invalidateQueries({ queryKey: ['deviceConnections'] });
      setUpdatingIds(prev => { const s = new Set(prev); s.delete(device.id); return s; });
      toast.success(`${device.name} connected`);
    },
    onError: (_, device) => {
      setUpdatingIds(prev => { const s = new Set(prev); s.delete(device.id); return s; });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (connection) => {
      setUpdatingIds(prev => new Set([...prev, connection.device_id]));
      return base44.entities.DeviceConnection.update(connection.id, {
        connected: false,
        last_sync: connection.last_sync,
      });
    },
    onSuccess: (_, connection) => {
      queryClient.invalidateQueries({ queryKey: ['deviceConnections'] });
      setUpdatingIds(prev => { const s = new Set(prev); s.delete(connection.device_id); return s; });
      const device = DEVICES.find(d => d.id === connection.device_id);
      toast.success(`${device?.name ?? 'Device'} disconnected`);
    },
    onError: (_, connection) => {
      setUpdatingIds(prev => { const s = new Set(prev); s.delete(connection.device_id); return s; });
    },
  });

  const handleSyncAll = useCallback(async () => {
    const connected = connections.filter(c => c.connected);
    if (!connected.length) return;

    setIsSyncingAll(true);
    const ids = connected.map(c => c.device_id);
    setSyncingIds(new Set(ids));

    // Stagger the sync animations
    await new Promise(res => setTimeout(res, 1800));

    // Update all last_sync timestamps
    await Promise.all(
      connected.map(c =>
        base44.entities.DeviceConnection.update(c.id, { last_sync: new Date().toISOString() })
      )
    );

    queryClient.invalidateQueries({ queryKey: ['deviceConnections'] });
    setSyncingIds(new Set());
    setIsSyncingAll(false);
    setJustSynced(true);
    toast.success(`Synced ${connected.length} device${connected.length > 1 ? 's' : ''}`);
    setTimeout(() => setJustSynced(false), 3000);
  }, [connections, queryClient]);

  const connectedCount = connections.filter(c => c.connected).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 md:pt-0"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Connect Devices</h1>
          <p className="text-muted-foreground mt-1">
            Link your wearables and health platforms to sync data automatically
          </p>
        </div>
        <SyncButton
          onSync={handleSyncAll}
          isSyncing={isSyncingAll}
          justSynced={justSynced}
          connectedCount={connectedCount}
        />
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-6 bg-card rounded-2xl border border-border px-6 py-4"
      >
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{connectedCount}</p>
          <p className="text-xs text-muted-foreground">Connected</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{DEVICES.length - connectedCount}</p>
          <p className="text-xs text-muted-foreground">Available</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-2 flex-1">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(connectedCount / DEVICES.length) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {Math.round((connectedCount / DEVICES.length) * 100)}% linked
          </span>
        </div>
      </motion.div>

      {/* Note banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3"
      >
        <Plug className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">OAuth integration coming soon.</span>{' '}
          Connection status is saved to your account. Full real-time sync will be available when platform integrations launch.
        </p>
      </motion.div>

      {/* Device grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DEVICES.map((device, i) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <DeviceCard
                device={device}
                connection={connectionMap[device.id]}
                onConnect={connectMutation.mutate}
                onDisconnect={disconnectMutation.mutate}
                isSyncing={syncingIds.has(device.id)}
                isUpdating={updatingIds.has(device.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}