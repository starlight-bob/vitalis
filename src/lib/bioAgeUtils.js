import { calculateRecoveryScore } from './healthUtils';

/**
 * Calculate all biological sub-ages and overall bio age from health logs.
 * @param {Array} logs - sorted health logs (most recent first)
 * @param {number} chronoAge - user's chronological age (default 35 for estimation)
 */
export function calculateBioAge(logs, chronoAge = 35) {
  const safeLogs = Array.isArray(logs) ? logs : [];
  if (safeLogs.length === 0) return null;

  const sorted = [...safeLogs].sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, 30);
  const avg = (arr, key) => {
    const vals = arr.map(l => l[key]).filter(v => v != null && !isNaN(v));
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  };

  const avgHRV = avg(recent, 'hrv');
  const avgRHR = avg(recent, 'heart_rate_avg');
  const avgSleep = avg(recent, 'sleep_duration');
  const avgSleepQ = avg(recent, 'sleep_quality');
  const avgStrain = avg(recent, 'workout_strain');
  const avgSteps = avg(recent, 'steps');
  const avgRecovery = recent.map(calculateRecoveryScore).reduce((s, v) => s + v, 0) / recent.length;

  // Sleep consistency std-dev approximation
  const sleepVals = recent.map(l => l.sleep_duration).filter(Boolean);
  const sleepMean = sleepVals.reduce((s, v) => s + v, 0) / (sleepVals.length || 1);
  const sleepStdDev = sleepVals.length > 1
    ? Math.sqrt(sleepVals.reduce((s, v) => s + Math.pow(v - sleepMean, 2), 0) / sleepVals.length)
    : 1;

  // HRV variability
  const hrvVals = recent.map(l => l.hrv).filter(Boolean);
  const hrvMean = hrvVals.reduce((s, v) => s + v, 0) / (hrvVals.length || 1);
  const hrvStdDev = hrvVals.length > 1
    ? Math.sqrt(hrvVals.reduce((s, v) => s + Math.pow(v - hrvMean, 2), 0) / hrvVals.length)
    : 5;

  // Workout frequency
  const workoutDays = recent.filter(l => l.workout_strain > 5).length;
  const workoutFreqPerWeek = (workoutDays / recent.length) * 7;

  // --- Sub-age calculations (all relative to chronoAge) ---
  // Each metric scores a "age delta" — negative = younger, positive = older

  // Cardiovascular: HRV high = younger, RHR low = younger
  const cardioHRVDelta = avgHRV ? Math.max(-10, Math.min(10, (70 - avgHRV) / 5)) : 0;
  const cardioRHRDelta = avgRHR ? Math.max(-8, Math.min(8, (avgRHR - 60) / 4)) : 0;
  const cardiovascularAge = Math.round(chronoAge + (cardioHRVDelta + cardioRHRDelta) / 2);

  // Metabolic: steps + strain + recovery
  const stepsDelta = avgSteps ? Math.max(-6, Math.min(6, (8000 - avgSteps) / 1000)) : 0;
  const strainDelta = avgStrain ? Math.max(-5, Math.min(5, (7 - avgStrain) / 2)) : 0;
  const recoveryDelta = Math.max(-7, Math.min(7, (50 - avgRecovery) / 5));
  const metabolicAge = Math.round(chronoAge + (stepsDelta + strainDelta + recoveryDelta) / 3);

  // Sleep: duration, quality, consistency
  const sleepDurDelta = avgSleep ? Math.max(-8, Math.min(8, (8 - avgSleep) * 1.5)) : 0;
  const sleepQDelta = avgSleepQ ? Math.max(-6, Math.min(6, (7 - avgSleepQ) * 1.2)) : 0;
  const sleepConsistDelta = Math.max(-5, Math.min(5, (sleepStdDev - 0.5) * 3));
  const sleepAge = Math.round(chronoAge + (sleepDurDelta + sleepQDelta + sleepConsistDelta) / 3);

  // Respiratory: approximated from RHR and HRV (no direct VO2/resp rate data)
  const respDelta = avgRHR && avgHRV
    ? Math.max(-7, Math.min(7, (avgRHR - 60) / 5 - (avgHRV - 60) / 15))
    : 0;
  const respiratoryAge = Math.round(chronoAge + respDelta);

  // Stress: HRV variability and recovery
  const hrvVarDelta = Math.max(-6, Math.min(6, (hrvStdDev - 8) / 3));
  const stressDelta = Math.max(-7, Math.min(7, (50 - avgRecovery) / 6));
  const stressAge = Math.round(chronoAge + (hrvVarDelta + stressDelta) / 2);

  // Musculoskeletal: workout frequency + strain balance
  const freqDelta = Math.max(-6, Math.min(6, (3 - workoutFreqPerWeek) * 1.5));
  const strainBalDelta = avgStrain ? Math.max(-5, Math.min(5, (avgStrain - 10) / 3)) : 0;
  const musculoskeletalAge = Math.round(chronoAge + (freqDelta + strainBalDelta) / 2);

  const subAges = [cardiovascularAge, metabolicAge, sleepAge, respiratoryAge, stressAge, musculoskeletalAge];
  const overallBioAge = Math.round(subAges.reduce((s, v) => s + v, 0) / subAges.length);

  return {
    overallBioAge,
    chronoAge,
    delta: overallBioAge - chronoAge,
    systems: [
      { key: 'cardiovascular', labelKey: 'sysCardiovascular', descKey: 'sysCardiovascularDesc', age: cardiovascularAge, delta: cardiovascularAge - chronoAge, icon: '❤️' },
      { key: 'metabolic', labelKey: 'sysMetabolic', descKey: 'sysMetabolicDesc', age: metabolicAge, delta: metabolicAge - chronoAge, icon: '⚡' },
      { key: 'sleep', labelKey: 'sysSleep', descKey: 'sysSleepDesc', age: sleepAge, delta: sleepAge - chronoAge, icon: '🌙' },
      { key: 'respiratory', labelKey: 'sysRespiratory', descKey: 'sysRespiratoryDesc', age: respiratoryAge, delta: respiratoryAge - chronoAge, icon: '🫁' },
      { key: 'stress', labelKey: 'sysStress', descKey: 'sysStressDesc', age: stressAge, delta: stressAge - chronoAge, icon: '🧠' },
      { key: 'musculoskeletal', labelKey: 'sysMusculoskeletal', descKey: 'sysMusculoskeletalDesc', age: musculoskeletalAge, delta: musculoskeletalAge - chronoAge, icon: '💪' },
    ],
    dataPoints: recent.length,
  };
}

/**
 * Build monthly bio age trend for the past 6 months
 */
export function buildBioAgeTrend(logs, chronoAge = 35) {
  const safeLogs = Array.isArray(logs) ? logs : [];
  if (safeLogs.length === 0) return [];

  const sorted = [...safeLogs].sort((a, b) => a.date.localeCompare(b.date));
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString(typeof window !== 'undefined' && localStorage.getItem('app_lang') === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', year: '2-digit' });

    const monthLogs = (Array.isArray(sorted) ? sorted : []).filter(l => {
      const ld = new Date(l.date + 'T00:00:00');
      return ld.getFullYear() === year && ld.getMonth() === month;
    });

    if (monthLogs.length >= 3) {
      const result = calculateBioAge(monthLogs, chronoAge);
      if (result) months.push({ label, bioAge: result.overallBioAge, chronoAge });
    } else if (months.length > 0) {
      // carry forward with label but no data point
      months.push({ label, bioAge: null, chronoAge });
    }
  }

  return months;
}