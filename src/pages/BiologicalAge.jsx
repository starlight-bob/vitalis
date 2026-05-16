import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Dna, Loader2, Info } from 'lucide-react';
import { calculateBioAge, buildBioAgeTrend } from '@/lib/bioAgeUtils';
import BioAgeHero from '@/components/bioage/BioAgeHero';
import BioAgeRadar from '@/components/bioage/BioAgeRadar';
import SystemCard from '@/components/bioage/SystemCard';
import BioAgeTrendChart from '@/components/bioage/BioAgeTrendChart';

// Default chronological age — in a real app you'd pull this from user profile
const CHRONO_AGE = 35;

export default function BiologicalAge() {
  const { data: rawLogs, isLoading } = useQuery({
    queryKey: ['healthLogs', 'all'],
    queryFn: () => base44.entities.HealthLog.list('-date', 120),
  });

  const logs = Array.isArray(rawLogs) ? rawLogs : [];
  const bioData = calculateBioAge(logs, CHRONO_AGE);
  const trendData = buildBioAgeTrend(logs, CHRONO_AGE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bioData || logs.length < 5) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Biological Age</h1>
          <p className="text-muted-foreground mt-1">Your body's true age based on health biomarkers</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-2xl border border-border">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Dna className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">Not enough data yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Log at least 5 days of health data to calculate your biological age. The more data, the more accurate the estimate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between pt-8 md:pt-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Biological Age</h1>
            <p className="text-muted-foreground mt-1">Your body's true age based on health biomarkers</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
            <Info className="h-3.5 w-3.5" />
            Estimates only · not medical advice
          </div>
        </div>
      </motion.div>

      {/* Hero */}
      <BioAgeHero
        bioAge={bioData.overallBioAge}
        chronoAge={bioData.chronoAge}
        delta={bioData.delta}
        dataPoints={bioData.dataPoints}
      />

      {/* Radar + System Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BioAgeRadar systems={bioData.systems} chronoAge={bioData.chronoAge} />

        <div className="grid grid-cols-1 gap-3">
          {bioData.systems.map((system, i) => (
            <SystemCard
              key={system.key}
              system={system}
              chronoAge={bioData.chronoAge}
              delay={i * 0.06}
            />
          ))}
        </div>
      </div>

      {/* Trend chart */}
      <BioAgeTrendChart trendData={trendData} chronoAge={bioData.chronoAge} />

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-start gap-2.5 bg-muted/30 border border-border rounded-xl px-4 py-3"
      >
        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Biological age estimates are based on your logged health metrics (HRV, sleep, activity, recovery). These are statistical approximations and are <strong className="text-foreground">not a medical diagnosis</strong>. Consult a healthcare professional for clinical assessment. Chronological age is set to {CHRONO_AGE} — update in your profile for personalized results.
        </p>
      </motion.div>
    </div>
  );
}