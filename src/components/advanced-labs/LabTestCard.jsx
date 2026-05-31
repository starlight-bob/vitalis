import { motion } from 'framer-motion';
import { ShoppingCart, Clock, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

const CATEGORY_COLORS = {
  'Blood Panel': 'text-red-500 bg-red-500/10',
  'Hormone Panel': 'text-purple-500 bg-purple-500/10',
  'Vitamin & Minerals': 'text-amber-500 bg-amber-500/10',
  'Thyroid': 'text-blue-500 bg-blue-500/10',
  'Metabolic': 'text-emerald-500 bg-emerald-500/10',
  'Cardiovascular': 'text-pink-500 bg-pink-500/10',
  'Gut Health': 'text-orange-500 bg-orange-500/10',
};

export default function LabTestCard({ test, onBuy, delay = 0 }) {
  const { t } = useLanguage();
  const colorClass = CATEGORY_COLORS[test.category] || 'text-primary bg-primary/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full', colorClass)}>
              {test.category}
            </span>
            {test.popular && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <Star className="h-2.5 w-2.5 fill-current" /> {t('popular')}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-foreground">{test.name}</h3>
          {test.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{test.description}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-foreground">${test.price}</p>
        </div>
      </div>

      {test.biomarkers?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {test.biomarkers.slice(0, 5).map(b => (
            <span key={b} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{b}</span>
          ))}
          {test.biomarkers.length > 5 && (
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">+{test.biomarkers.length - 5} {t('moreMarkers')}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-1">
        {test.turnaround_days && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{test.turnaround_days} {t('businessDays')}</span>
          </div>
        )}
        <Button
          size="sm"
          onClick={() => onBuy(test)}
          className="ml-auto gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {t('orderTest')}
        </Button>
      </div>
    </motion.div>
  );
}