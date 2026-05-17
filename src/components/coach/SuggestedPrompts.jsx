import { motion } from 'framer-motion';

const PROMPTS = [
  { label: "How's my recovery?", emoji: '💚' },
  { label: 'Analyze my sleep', emoji: '🌙' },
  { label: 'Should I train today?', emoji: '🏋️' },
  { label: 'Why am I so tired?', emoji: '😴' },
  { label: 'Am I overtraining?', emoji: '⚠️' },
  { label: 'HRV trend this week', emoji: '📈' },
];

export default function SuggestedPrompts({ onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PROMPTS.map((p, i) => (
        <motion.button
          key={p.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => onSelect(p.label)}
          disabled={disabled}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/10 bg-card hover:bg-sidebar-accent hover:border-emerald-500/40 text-muted-foreground hover:text-foreground transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{p.emoji}</span>
          <span>{p.label}</span>
        </motion.button>
      ))}
    </div>
  );
}