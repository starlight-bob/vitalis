import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

const STRENGTH_STYLES = {
  strong:   { bg: 'bg-emerald-500/10 border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-600', key: 'strongCorrelation' },
  moderate: { bg: 'bg-blue-500/10 border-blue-500/30',     badge: 'bg-blue-500/20 text-blue-600',     key: 'moderateCorrelation' },
  weak:     { bg: 'bg-muted border-border',                  badge: 'bg-muted text-muted-foreground',   key: 'weakCorrelation' },
};

export default function CorrelationCard({ correlation, index }) {
  const { t, lang } = useLanguage();
  const { journalEmoji, journalLabelKey, journalLabel, healthEmoji, healthLabelKey, healthLabel, r, strength, positive, pctDiff, dataPoints, series } = correlation;
  const jLabel = journalLabelKey ? t(journalLabelKey) : journalLabel;
  const hLabel = healthLabelKey ? t(healthLabelKey) : healthLabel;
  const styles = STRENGTH_STYLES[strength];

  const Icon = positive ? TrendingUp : r === 0 ? Minus : TrendingDown;
  const iconColor = positive ? 'text-emerald-500' : 'text-red-500';

  const insightText = (() => {
    if (pctDiff != null && Math.abs(pctDiff) >= 5) {
      const dir = pctDiff > 0 ? t('higher') : t('lower');
      const absP = Math.abs(pctDiff);
      return lang === 'zh'
        ? `在${jLabel}较多的日子，您的${hLabel}${dir}${absP}%。`
        : `On days with more ${jLabel.toLowerCase()}, your ${hLabel} was ${absP}% ${dir}.`;
    }
    return lang === 'zh'
      ? `${jLabel}与您的${hLabel}${positive ? '正' : '负'}相关。`
      : `${jLabel} ${positive ? 'positively' : 'negatively'} correlates with your ${hLabel}.`;
  })();

  const scatterData = series.map(s => ({ x: s.jVal, y: s.hVal }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn('bg-card border rounded-2xl p-3 space-y-2', styles.bg)}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{journalEmoji}</span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground leading-tight truncate">
              {jLabel} → {healthEmoji} {hLabel}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{insightText}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', styles.badge)}>
            {t(styles.key)}
          </span>
          <div className="flex items-center gap-0.5">
            <Icon className={cn('h-3 w-3', iconColor)} />
            <span className="text-[11px] font-mono font-bold text-foreground">r={r}</span>
          </div>
        </div>
      </div>

      {/* Scatter plot */}
      {scatterData.length >= 5 && (
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <XAxis
                dataKey="x"
                type="number"
                name={jLabel}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="y"
                type="number"
                name={hLabel}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                formatter={(val, name) => [val, name === 'x' ? jLabel : hLabel]}
              />
              <Scatter
                data={scatterData}
                fill="hsl(var(--primary))"
                fillOpacity={0.7}
                r={3}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground">{t('basedOn')} {dataPoints} {t('days')}</p>
    </motion.div>
  );
}