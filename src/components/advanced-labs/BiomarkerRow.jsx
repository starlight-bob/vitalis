import { cn } from '@/lib/utils';
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

const FLAG_CONFIG = {
  normal:   { label: 'Normal',   color: 'text-emerald-500', bg: 'bg-emerald-500/10', Icon: CheckCircle2 },
  low:      { label: 'Low',      color: 'text-blue-500',    bg: 'bg-blue-500/10',    Icon: TrendingDown },
  high:     { label: 'High',     color: 'text-amber-500',   bg: 'bg-amber-500/10',   Icon: TrendingUp },
  critical: { label: 'Critical', color: 'text-red-500',     bg: 'bg-red-500/10',     Icon: AlertTriangle },
};

export default function BiomarkerRow({ biomarker }) {
  const flag = biomarker.flag || 'normal';
  const cfg = FLAG_CONFIG[flag] || FLAG_CONFIG.normal;
  const Icon = cfg.Icon;

  const hasRange = biomarker.range_low != null && biomarker.range_high != null;
  const rangeWidth = hasRange ? biomarker.range_high - biomarker.range_low : null;
  const pct = hasRange
    ? Math.max(0, Math.min(100, ((biomarker.value - biomarker.range_low) / rangeWidth) * 100))
    : null;

  return (
    <div className="py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-foreground">{biomarker.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            {biomarker.value} <span className="font-normal text-muted-foreground text-xs">{biomarker.unit}</span>
          </span>
          <span className={cn('flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full', cfg.color, cfg.bg)}>
            <Icon className="h-2.5 w-2.5" />
            {cfg.label}
          </span>
        </div>
      </div>
      {hasRange && (
        <div className="space-y-0.5">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
            {/* Normal range highlight */}
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full" />
            {/* Value marker */}
            <div
              className={cn('absolute top-0 bottom-0 w-2 -translate-x-1/2 rounded-full', cfg.color.replace('text-', 'bg-'))}
              style={{ left: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{biomarker.range_low} {biomarker.unit}</span>
            <span>Ref range</span>
            <span>{biomarker.range_high} {biomarker.unit}</span>
          </div>
        </div>
      )}
    </div>
  );
}