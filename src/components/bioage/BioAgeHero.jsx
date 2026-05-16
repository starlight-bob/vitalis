import { motion } from 'framer-motion';
import { Dna, TrendingDown, TrendingUp, Minus } from 'lucide-react';

export default function BioAgeHero({ bioAge, chronoAge, delta, dataPoints }) {
  const younger = delta < 0;
  const same = delta === 0;
  const absDelta = Math.abs(delta);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-card border border-border rounded-2xl p-8"
    >
      {/* Subtle gradient background */}
      <div className={`absolute inset-0 opacity-5 ${younger ? 'bg-gradient-to-br from-emerald-400 to-teal-600' : 'bg-gradient-to-br from-orange-400 to-red-600'}`} />

      <div className="relative flex flex-col md:flex-row md:items-center gap-8">
        {/* Icon */}
        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${younger ? 'bg-emerald-500/10' : 'bg-orange-500/10'}`}>
          <Dna className={`h-8 w-8 ${younger ? 'text-emerald-400' : 'text-orange-400'}`} />
        </div>

        {/* Main number */}
        <div className="flex-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Biological Age</p>
          <div className="flex items-baseline gap-4">
            <motion.span
              className="text-7xl font-black tracking-tighter text-foreground"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {bioAge}
            </motion.span>
            <span className="text-2xl text-muted-foreground font-light">yrs</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Chronological age: {chronoAge}</p>
        </div>

        {/* Delta callout */}
        <div className={`flex flex-col items-center justify-center px-6 py-4 rounded-2xl border ${younger ? 'border-emerald-500/20 bg-emerald-500/5' : same ? 'border-border bg-muted/30' : 'border-orange-500/20 bg-orange-500/5'}`}>
          <div className="flex items-center gap-2 mb-1">
            {younger ? <TrendingDown className="h-5 w-5 text-emerald-400" /> : same ? <Minus className="h-5 w-5 text-muted-foreground" /> : <TrendingUp className="h-5 w-5 text-orange-400" />}
            <span className={`text-3xl font-black ${younger ? 'text-emerald-400' : same ? 'text-muted-foreground' : 'text-orange-400'}`}>
              {same ? '±0' : `${younger ? '-' : '+'}${absDelta}`}
            </span>
          </div>
          <p className={`text-xs font-medium text-center leading-tight ${younger ? 'text-emerald-400' : same ? 'text-muted-foreground' : 'text-orange-400'}`}>
            {same ? 'At your chronological age' : younger ? `${absDelta} yr${absDelta !== 1 ? 's' : ''} younger than real age` : `${absDelta} yr${absDelta !== 1 ? 's' : ''} older than real age`}
          </p>
        </div>
      </div>

      <div className="relative mt-6 pt-4 border-t border-border/50 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        <p className="text-xs text-muted-foreground">Based on {dataPoints} days of logged health data · estimates improve with more data</p>
      </div>
    </motion.div>
  );
}