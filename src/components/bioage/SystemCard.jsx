import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';

export default function SystemCard({ system, chronoAge, delay = 0 }) {
  const { t } = useLanguage();
  const { label, age, delta, icon, description } = system;
  const younger = delta < 0;
  const same = delta === 0;
  const absDelta = Math.abs(delta);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-[11px] text-muted-foreground">{description}</p>
          </div>
        </div>
        {/* Delta badge */}
        <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
          younger ? 'bg-emerald-500/10 text-emerald-400' :
          same ? 'bg-muted text-muted-foreground' :
          'bg-orange-500/10 text-orange-400'
        }`}>
          {same ? '±0' : younger ? `-${absDelta}y` : `+${absDelta}y`}
        </span>
      </div>

      {/* Age display */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-4xl font-black tracking-tighter text-foreground">{age}</span>
        <span className="text-sm text-muted-foreground">{t('yrs')}</span>
      </div>

      {/* Bar */}
      <div className="space-y-1">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${younger ? 'bg-emerald-500' : same ? 'bg-primary' : 'bg-orange-500'}`}
            style={{ width: `${Math.min(100, Math.max(5, ((chronoAge - Math.abs(delta)) / chronoAge) * 100))}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(10, 100 - (absDelta * 4)))}%` }}
            transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{t('optimal')}</span>
          <span>{t('needsAttention')}</span>
        </div>
      </div>
    </motion.div>
  );
}