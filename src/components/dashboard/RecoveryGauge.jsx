import { motion } from 'framer-motion';
import { getRecoveryLevel } from '@/lib/healthUtils';
import { useLanguage } from '@/lib/LanguageContext';

export default function RecoveryGauge({ score, size = 200 }) {
  const { t } = useLanguage();
  const { label, color } = getRecoveryLevel(score, t);
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;

  const getStrokeColor = () => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#34d399';
    if (score >= 40) return '#eab308';
    if (score >= 20) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-bold font-mono tracking-tight text-foreground"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className={`text-sm font-semibold mt-1 ${color}`}>{label}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 uppercase tracking-widest font-medium">{t('recoveryScore')}</p>
    </div>
  );
}