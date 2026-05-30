import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { useLanguage } from '@/lib/LanguageContext';

const CustomTooltip = ({ active, payload, label, tFn }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2.5 text-xs shadow-xl space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value} {tFn ? tFn('yrs') : 'yrs'}
        </p>
      ))}
    </div>
  );
};

export default function BioAgeTrendChart({ trendData, chronoAge }) {
  const { t } = useLanguage();
  const hasData = trendData.some(d => d.bioAge !== null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <div className="mb-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{t('bioAgeTrend')}</p>
        <p className="text-sm text-foreground font-medium">{t('bioAgeOverTime')}</p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
          {t('needMoreTrendData')}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip tFn={t} />} />
            <ReferenceLine
              y={chronoAge}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: t('realAge'), fill: 'hsl(var(--muted-foreground))', fontSize: 10, position: 'right' }}
            />
            <Line
              type="monotone"
              dataKey="bioAge"
              name={t('bioAgeLabel')}
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}