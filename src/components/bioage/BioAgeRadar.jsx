import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-foreground">{d.label}</p>
      <p className="text-muted-foreground">Age: <span className="text-foreground font-bold">{d.age}</span></p>
    </div>
  );
};

export default function BioAgeRadar({ systems, chronoAge }) {
  const data = systems.map(s => ({
    label: s.label,
    age: s.age,
    // score: invert delta so "younger" = higher score on radar
    score: Math.max(0, Math.min(100, 50 - s.delta * 4)),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">System Overview</p>
      <p className="text-sm text-foreground font-medium mb-4">Biological systems radar</p>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
          />
          <Radar
            name="Bio Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 justify-center mt-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-primary" />
          Your systems
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          Higher = younger
        </div>
      </div>
    </motion.div>
  );
}