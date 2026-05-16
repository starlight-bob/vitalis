import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CoachHeader({ logsCount }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between pb-4 border-b border-white/10"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">Health Coach</h1>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-muted-foreground">
              {logsCount > 0
                ? `Analyzing ${logsCount} days of your data`
                : 'Ready to help — log some data to unlock insights'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}