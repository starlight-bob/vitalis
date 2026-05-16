import { calculateRecoveryScore } from './healthUtils';
import { format, subDays } from 'date-fns';

/**
 * Builds a rich text summary of the user's health data to inject into the LLM prompt
 */
export function buildHealthContext(logs) {
  if (!logs || logs.length === 0) {
    return 'The user has no logged health data yet.';
  }

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const today = sorted[0];
  const last7 = sorted.slice(0, 7);
  const last30 = sorted.slice(0, 30);

  const withRecovery = sorted.map(log => ({
    ...log,
    recovery: calculateRecoveryScore(log),
  }));

  const avg = (arr, key) => {
    const vals = arr.map(l => l[key]).filter(v => v != null && !isNaN(v));
    return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : 'N/A';
  };

  const latest = withRecovery[0];
  const prev7 = withRecovery.slice(0, 7);
  const prev7_avg_hrv = parseFloat(avg(prev7, 'hrv'));
  const prev14_avg_hrv = withRecovery.slice(7, 14).length
    ? parseFloat(avg(withRecovery.slice(7, 14), 'hrv'))
    : null;

  const hrvTrend = prev14_avg_hrv
    ? (((prev7_avg_hrv - prev14_avg_hrv) / prev14_avg_hrv) * 100).toFixed(1)
    : null;

  const avgRecovery7 = (prev7.reduce((s, l) => s + l.recovery, 0) / prev7.length).toFixed(0);
  const avgStrain7 = avg(prev7, 'workout_strain');
  const avgSleep7 = avg(prev7, 'sleep_duration');
  const avgSleepQ7 = avg(prev7, 'sleep_quality');

  const todaySection = latest
    ? `
TODAY (${latest.date}):
- Recovery Score: ${latest.recovery}/100
- Resting Heart Rate: ${latest.heart_rate_avg} bpm
- HRV: ${latest.hrv} ms
- Sleep: ${latest.sleep_duration} hours (quality: ${latest.sleep_quality}/10)
- Steps: ${latest.steps?.toLocaleString() ?? 'N/A'}
- Workout Strain: ${latest.workout_strain}/21
${latest.notes ? `- Notes: "${latest.notes}"` : ''}
`.trim()
    : 'No data for today.';

  const trends7 = `
LAST 7 DAYS AVERAGES:
- Avg Recovery Score: ${avgRecovery7}/100
- Avg HRV: ${avg(prev7, 'hrv')} ms
- Avg Resting HR: ${avg(prev7, 'heart_rate_avg')} bpm
- Avg Sleep Duration: ${avgSleep7} hrs
- Avg Sleep Quality: ${avgSleepQ7}/10
- Avg Workout Strain: ${avgStrain7}/21
- Avg Daily Steps: ${avg(prev7, 'steps')}
${hrvTrend !== null ? `- HRV trend vs prior week: ${hrvTrend > 0 ? '+' : ''}${hrvTrend}%` : ''}
`.trim();

  const recent = last7.map(l => {
    const r = calculateRecoveryScore(l);
    return `  ${l.date}: Recovery ${r}, HRV ${l.hrv}ms, Sleep ${l.sleep_duration}h (Q:${l.sleep_quality}), Strain ${l.workout_strain}, Steps ${l.steps?.toLocaleString() ?? 'N/A'}`;
  }).join('\n');

  const anomalies = [];
  if (latest && latest.hrv && prev7_avg_hrv) {
    const hrvDrop = ((prev7_avg_hrv - latest.hrv) / prev7_avg_hrv) * 100;
    if (hrvDrop > 15) anomalies.push(`HRV dropped ${hrvDrop.toFixed(0)}% below 7-day average`);
  }
  if (latest && latest.sleep_duration < 6) anomalies.push(`Sleep is under 6 hours (${latest.sleep_duration}h)`);
  if (latest && latest.recovery < 30) anomalies.push(`Recovery score is critically low (${latest.recovery})`);
  if (latest && latest.workout_strain > 18) anomalies.push(`Very high workout strain (${latest.workout_strain}/21) — potential overtraining risk`);
  const strainVals = prev7.map(l => l.workout_strain);
  const highStrainDays = strainVals.filter(s => s > 14).length;
  if (highStrainDays >= 4) anomalies.push(`${highStrainDays} high-strain days in the last 7 days — possible overtraining`);

  return `
=== USER HEALTH DATA CONTEXT ===

${todaySection}

${trends7}

RECENT DAILY LOG (last ${last7.length} days):
${recent}

${anomalies.length ? `DETECTED ANOMALIES / FLAGS:\n${anomalies.map(a => `- ⚠️ ${a}`).join('\n')}` : 'No major anomalies detected.'}

DATA COVERAGE: ${logs.length} total logged days
=================================
`.trim();
}