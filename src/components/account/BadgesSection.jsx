import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function BadgesSection({ badges }) {
  return (
    <div className="px-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Achievements</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl border w-24 ${
              badge.earned
                ? 'bg-card border-primary/20 shadow-sm shadow-primary/5'
                : 'bg-muted/30 border-border opacity-60'
            }`}
          >
            <div className="relative">
              <span className="text-2xl">{badge.emoji}</span>
              {!badge.earned && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-muted border border-border flex items-center justify-center">
                  <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-[10px] font-semibold text-foreground text-center leading-tight">{badge.label}</p>
            {!badge.earned && badge.total > 1 && (
              <div className="w-full">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                  />
                </div>
                <p className="text-[9px] text-muted-foreground text-center mt-0.5">{badge.progress}/{badge.total}</p>
              </div>
            )}
            {badge.earned && (
              <p className="text-[9px] text-primary font-medium">Earned</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}