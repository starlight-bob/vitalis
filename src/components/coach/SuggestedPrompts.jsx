import { motion } from 'framer-motion';

const PROMPTS = [
  { label: "How's my recovery?", emoji: '💚' },
  { label: 'Analyze my sleep', emoji: '🌙' },
  { label: 'Should I train today?', emoji: '🏋️' },
  { label: 'Why am I so tired?', emoji: '😴' },
  { label: 'Am I overtraining?', emoji: '⚠️' },
  { label: 'HRV trend this week', emoji: '📈' },
];

const chipStyle = {};

export default function SuggestedPrompts({ onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PROMPTS.map((p, i) => (
        <motion.button
          key={p.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => onSelect(p.label)}
          disabled={disabled}
          className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-full bg-card border border-border text-foreground/80 hover:text-foreground hover:border-emerald-400/50 hover:bg-muted transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{p.emoji}</span>
          <span className="font-medium">{p.label}</span>
        </motion.button>
      ))}
    </div>
  );
}