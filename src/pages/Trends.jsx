import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { subDays, format } from 'date-fns';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateRecoveryScore, formatDateShort } from '@/lib/healthUtils';
import TrendChart from '@/components/trends/TrendChart';

const CHART_CONFIGS = [
  { key: 'recovery', name: 'Recovery Score', color: '#22c55e', unit: '' },
  { key: 'hrv', name: 'HRV', color: '#3b82f6', unit: 'ms' },
  { key: 'heart_rate_avg', name: 'Resting Heart Rate', color: '#ef4444', unit: 'bpm' },
  { key: 'sleep_duration', name: 'Sleep Duration', color: '#818cf8', unit: 'hrs' },
  { key: 'sleep_quality', name: 'Sleep Quality', color: '#eab308', unit: '/10' },
  { key: 'steps', name: 'Steps', color: '#10b981', unit: '' },
  { key: 'workout_strain', name: 'Workout Strain', color: '#f97316', unit: '/21' },
];

export default function Trends() {
  const [days, setDays] = useState(7);

  const { data: allLogs = [], isLoading } = useQuery({
    queryKey: ['healthLogs', 'all'],
    queryFn: () => base44.entities.HealthLog.list('-date', 100),
  });

  const chartData = useMemo(() => {
    const cutoff = format(subDays(new Date(), days), 'yyyy-MM-dd');
    const filtered = allLogs
      .filter(log => log.date >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date));

    return filtered.map(log => ({
      label: formatDateShort(log.date),
      date: log.date,
      recovery: calculateRecoveryScore(log),
      hrv: log.hrv,
      heart_rate_avg: log.heart_rate_avg,
      sleep_duration: log.sleep_duration,
      sleep_quality: log.sleep_quality,
      steps: log.steps,
      workout_strain: log.workout_strain,
    }));
  }, [allLogs, days]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 md:pt-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Trends</h1>
          <p className="text-muted-foreground mt-1">Track your health metrics over time</p>
        </div>
        <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <TabsList>
            <TabsTrigger value="7">7 Days</TabsTrigger>
            <TabsTrigger value="30">30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground">No data available for the selected period</p>
          <p className="text-xs text-muted-foreground mt-2">Start logging your health metrics to see trends</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {CHART_CONFIGS.map((config, i) => (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {config.name}
                </h3>
                {chartData.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Avg: {Math.round(chartData.reduce((sum, d) => sum + (d[config.key] || 0), 0) / chartData.length)}
                    {config.unit}
                  </span>
                )}
              </div>
              <TrendChart
                data={chartData}
                dataKey={config.key}
                name={config.name}
                color={config.color}
                unit={config.unit}
                gradientId={`grad-${config.key}`}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}