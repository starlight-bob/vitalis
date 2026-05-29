import { motion } from 'framer-motion';

const PROMPTS = [
  { label: "How's my recovery?", emoji: '💚' },
  { label: 'Analyze my sleep', emoji: '🌙' },
  { label: 'Should I train today?', emoji: '🏋️' },
  { label: 'Why am I so tired?', emoji: '😴' },
  { label: 'Am I overtraining?', emoji: '⚠️' },
  { label: 'HRV trend this week', emoji: '📈' },
];

const chipStyle = {
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.15)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
};

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
          style={chipStyle}
          className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-full text-foreground/80 hover:text-foreground hover:border-emerald-400/40 hover:bg-white/10 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{p.emoji}</span>
          <span className="font-medium">{p.label}</span>
        </motion.button>
      ))}
    </div>
  );
}