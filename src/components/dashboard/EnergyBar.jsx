import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { calculateEnergyLevel } from '@/lib/healthUtils';
import { useLanguage } from '@/lib/LanguageContext';

export default function EnergyBar({ log }) {
  const { t } = useLanguage();
  const { level, label } = calculateEnergyLevel(log, t);

  const getBarColor = () => {
    if (level >= 75) return 'bg-green-500';
    if (level >= 50) return 'bg-yellow-500';
    if (level >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" /> {t('energyLevel')}
        </h3>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold text-foreground">{level}</span>
        <span className="text-sm text-muted-foreground">/ 100</span>
      </div>

      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getBarColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}