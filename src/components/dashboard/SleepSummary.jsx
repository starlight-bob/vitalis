import { motion } from 'framer-motion';
import { Moon, Star } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function SleepSummary({ log }) {
  const { t } = useLanguage();
  if (!log) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Moon className="h-4 w-4" /> {t('sleepSummary')}
        </h3>
        <p className="text-muted-foreground text-sm">{t('noSleepData')}</p>
      </div>
    );
  }

  const qualityStars = Math.round(log.sleep_quality / 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        <Moon className="h-4 w-4 text-blue-400" /> {t('sleepSummary')}
      </h3>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{t('duration')}</p>
          <p className="text-2xl font-bold text-foreground">
            {log.sleep_duration}<span className="text-sm text-muted-foreground ml-1">hrs</span>
          </p>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (log.sleep_duration / 9) * 100)}%` }}
              transition={{ delay: 0.5, duration: 1 }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{t('targetSleep')}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">{t('quality')}</p>
          <p className="text-2xl font-bold text-foreground">
            {log.sleep_quality}<span className="text-sm text-muted-foreground ml-1">/10</span>
          </p>
          <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${star <= qualityStars ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}