import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Watch, RefreshCw, Trash2, Plus, ChevronLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

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
  const queryClient = useQueryClient();

  const { data: connections = [] } = useQuery({
    queryKey: ['deviceConnections'],
    queryFn: () => base44.entities.DeviceConnection.list(),
  });

  const connected = connections.filter(c => c.connected);
  const primary = connected[0] || null;

  const removeMutation = useMutation({
    mutationFn: async (conn) => base44.entities.DeviceConnection.update(conn.id, { connected: false }),
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
    <div className="min-h-screen bg-white text-slate-900 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-4 flex items-center gap-3">
        <Link to="/" className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </Link>
        <h1 className="text-base font-semibold tracking-tight text-slate-900">Device Settings</h1>
      </div>

      <div className="px-4 py-6 space-y-6">

        {/* Connected Device Card */}
        {primary ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Watch className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">{primary.device_name}</p>
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
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getBatteryColor(MOCK_BATTERY)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${MOCK_BATTERY}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-100 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-0.5">Firmware</p>
                <p className="text-xs font-medium text-slate-800">{MOCK_FIRMWARE}</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-0.5">Last Sync</p>
                <p className="text-xs font-medium text-slate-800">
                  {primary.last_sync
                    ? formatDistanceToNow(new Date(primary.last_sync), { addSuffix: true })
                    : 'Never'}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
            <Watch className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No device connected</p>
          </div>
        )}

        {/* My Devices */}
        {connections.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">My Devices</p>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {connections.map((conn) => (
                <div key={conn.id} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${conn.connected ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{conn.device_name}</p>
                      <p className="text-[10px] text-slate-400">{conn.connected ? 'Active' : 'Disconnected'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMutation.mutate(conn)}
                    className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-red-50 hover:text-red-400 text-slate-400 transition-colors"
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
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {ADD_DEVICES.map((d) => (
              <button
                key={d.id}
                onClick={() => handleAdd(d)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg leading-none">{d.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{d.name}</p>
                    <p className="text-[10px] text-slate-400">{d.sub}</p>
                  </div>
                </div>
                <Plus className="h-4 w-4 text-slate-300" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Sync Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Sync Settings</p>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {[
              { label: 'Auto-Sync', sub: 'Automatically sync when in range', val: autoSync, set: setAutoSync },
              { label: 'Background Sync', sub: 'Sync while app is in background', val: bgSync, set: setBgSync },
              { label: 'Wi-Fi Only', sub: 'Only sync on Wi-Fi connections', val: wifiOnly, set: setWifiOnly },
            ].map(({ label, sub, val, set }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="text-[10px] text-slate-400">{sub}</p>
                </div>
                <Toggle enabled={val} onToggle={() => set(v => !v)} />
              </div>
            ))}

            {/* Sync Frequency */}
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-slate-800">Sync Frequency</p>
                <p className="text-[10px] text-slate-400">How often to check for new data</p>
              </div>
              <select
                value={syncFreq}
                onChange={e => setSyncFreq(e.target.value)}
                className="bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-none"
              >
                <option value="5min">Every 5 min</option>
                <option value="15min">Every 15 min</option>
                <option value="30min">Every 30 min</option>
                <option value="1hr">Every hour</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Sync Log */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Sync Log</p>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {MOCK_SYNC_LOG.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                {entry.status === 'success'
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  : <XCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{entry.device}</p>
                  <p className="text-[10px] text-slate-400">{entry.status === 'success' ? 'Sync successful' : 'Sync failed'}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-300 flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(entry.time, { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}