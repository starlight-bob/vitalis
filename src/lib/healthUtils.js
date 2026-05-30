/**
 * Calculate Recovery Score (0-100) from sleep and HRV data
 * Higher HRV + better sleep = higher recovery
 */
export function calculateRecoveryScore(log) {
  if (!log) return 0;

  // HRV component (0-40 points) - Higher HRV is better
  // Average HRV for adults: 20-100ms, athletes can be higher
  const hrvScore = Math.min(40, (log.hrv / 120) * 40);

  // Sleep duration component (0-30 points) - 7-9 hours is optimal
  const sleepHours = log.sleep_duration;
  let sleepDurationScore = 0;
  if (sleepHours >= 7 && sleepHours <= 9) {
    sleepDurationScore = 30;
  } else if (sleepHours >= 6) {
    sleepDurationScore = 20;
  } else if (sleepHours >= 5) {
    sleepDurationScore = 10;
  }

  // Sleep quality component (0-20 points)
  const sleepQualityScore = (log.sleep_quality / 10) * 20;

  // Resting heart rate component (0-10 points) - Lower is better
  const rhrScore = Math.max(0, Math.min(10, ((80 - log.heart_rate_avg) / 30) * 10));

  return Math.round(Math.min(100, hrvScore + sleepDurationScore + sleepQualityScore + rhrScore));
}

/**
 * Get recovery level label and color
 */
export function getRecoveryLevel(score, t) {
  const label = (k, fallback) => (t ? t(k) : fallback);
  if (score >= 80) return { label: label('recoveryExcellent', 'Excellent'), color: 'text-green-500', bg: 'bg-green-500' };
  if (score >= 60) return { label: label('recoveryGood', 'Good'), color: 'text-emerald-400', bg: 'bg-emerald-400' };
  if (score >= 40) return { label: label('recoveryModerate', 'Moderate'), color: 'text-yellow-500', bg: 'bg-yellow-500' };
  if (score >= 20) return { label: label('recoveryLow', 'Low'), color: 'text-orange-500', bg: 'bg-orange-500' };
  return { label: label('recoveryPoor', 'Poor'), color: 'text-red-500', bg: 'bg-red-500' };
}

/**
 * Calculate energy level based on recovery, strain, and steps
 */
export function calculateEnergyLevel(log, t) {
  const label = (k, fallback) => (t ? t(k) : fallback);
  if (!log) return { level: 0, label: label('energyNoData', 'No Data') };
  const recovery = calculateRecoveryScore(log);
  const strainPenalty = (log.workout_strain / 21) * 30;
  const energy = Math.max(0, Math.min(100, recovery - strainPenalty + 10));
  
  if (energy >= 75) return { level: Math.round(energy), label: label('energyHigh', 'High Energy') };
  if (energy >= 50) return { level: Math.round(energy), label: label('energyMed', 'Moderate') };
  if (energy >= 25) return { level: Math.round(energy), label: label('energyLow', 'Low Energy') };
  return { level: Math.round(energy), label: label('energyRest', 'Rest Day') };
}

/**
 * Format date for display
 */
export function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const locale = typeof window !== 'undefined' && localStorage.getItem('app_lang') === 'zh' ? 'zh-CN' : 'en-US';
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}