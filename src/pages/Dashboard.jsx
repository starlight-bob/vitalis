import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Heart, Activity, Footprints, Flame, Loader2 } from 'lucide-react';
import { calculateRecoveryScore } from '@/lib/healthUtils';
import RecoveryGauge from '@/components/dashboard/RecoveryGauge';
import MetricCard from '@/components/dashboard/MetricCard';
import SleepSummary from '@/components/dashboard/SleepSummary';
import EnergyBar from '@/components/dashboard/EnergyBar';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PullToRefresh from '@/components/layout/PullToRefresh';
import { useLanguage } from '@/lib/LanguageContext';

export default function Dashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { t } = useLanguage();

  const { data: rawLogs, isLoading } = useQuery({
    queryKey: ['healthLogs', 'today'],
    queryFn: () => base44.entities.HealthLog.filter({ date: today }, '-created_date', 1),
  });

  const logs = Array.isArray(rawLogs) ? rawLogs : [];

  const todayLog = logs[0] || null;
  const recoveryScore = todayLog ? calculateRecoveryScore(todayLog) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PullToRefresh queryKeys={[['healthLogs']]}>
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pt-8 md:pt-0"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('todaysVitals')}</h1>
          <p className="text-muted-foreground mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        {!todayLog && (
          <Link to="/log">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              {t('logToday')}
            </Button>
          </Link>
        )}
      </motion.div>

      {!todayLog ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border"
        >
          <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">{t('noDataLogged')}</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-sm">
            {t('noDataDesc')}
          </p>
          <Link to="/log">
            <Button size="lg" className="gap-2">
              <PlusCircle className="h-5 w-5" />
              {t('logHealthMetrics')}
            </Button>
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Recovery + Energy Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-card rounded-2xl border border-border p-6 flex items-center justify-center">
              <RecoveryGauge score={recoveryScore} />
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 gap-6">
              <EnergyBar log={todayLog} />
              <SleepSummary log={todayLog} />
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={Heart}
              label={t('restingHR')}
              value={todayLog.heart_rate_avg}
              unit="bpm"
              subtitle={t('averageResting')}
              accentColor="text-red-500"
              delay={0.1}
            />
            <MetricCard
              icon={Activity}
              label={t('hrv')}
              value={todayLog.hrv}
              unit="ms"
              subtitle={t('heartRateVariability')}
              accentColor="text-blue-500"
              delay={0.2}
            />
            <MetricCard
              icon={Footprints}
              label={t('steps')}
              value={todayLog.steps?.toLocaleString()}
              subtitle={todayLog.steps >= 10000 ? t('goalReached') : `${(10000 - todayLog.steps).toLocaleString()} ${t('toGoal')}`}
              accentColor="text-emerald-500"
              delay={0.3}
            />
            <MetricCard
              icon={Flame}
              label={t('strain')}
              value={todayLog.workout_strain}
              unit="/ 21"
              subtitle={t('workoutIntensity')}
              accentColor="text-orange-500"
              delay={0.4}
            />
          </div>

          {/* Notes */}
          {todayLog.notes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t('notes')}</p>
              <p className="text-foreground">{todayLog.notes}</p>
            </motion.div>
          )}
        </>
      )}
    </div>
    </PullToRefresh>
  );
}