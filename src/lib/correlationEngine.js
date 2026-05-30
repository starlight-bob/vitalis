import { calculateRecoveryScore } from './healthUtils';

/**
 * All trackable journal questions with metadata
 */
export const JOURNAL_QUESTIONS = [
  { key: 'sunlight_minutes', labelKey: 'jqSunlight', label: 'Sunlight Exposure', emoji: '☀️', unit: 'min', type: 'number', placeholder: '30', descKey: 'jqSunlightDesc', description: 'Minutes outside in natural light' },
  { key: 'water_ml', labelKey: 'jqWater', label: 'Water Intake', emoji: '💧', unit: 'ml', type: 'number', placeholder: '2000', descKey: 'jqWaterDesc', description: 'Total water consumed (ml)' },
  { key: 'alcohol_units', labelKey: 'jqAlcohol', label: 'Alcohol', emoji: '🍷', unit: 'units', type: 'number', placeholder: '0', descKey: 'jqAlcoholDesc', description: 'Standard drinks consumed' },
  { key: 'stress_level', labelKey: 'jqStress', label: 'Stress Level', emoji: '🧠', unit: '/10', type: 'slider', min: 1, max: 10, descKey: 'jqStressDesc', description: 'Overall stress today' },
  { key: 'exercise_minutes', labelKey: 'jqExercise', label: 'Exercise', emoji: '🏃', unit: 'min', type: 'number', placeholder: '45', descKey: 'jqExerciseDesc', description: 'Intentional exercise minutes' },
  { key: 'screen_time_before_bed', labelKey: 'jqScreen', label: 'Screen Before Bed', emoji: '📱', unit: 'min', type: 'number', placeholder: '30', descKey: 'jqScreenDesc', description: 'Screen time in the hour before sleep' },
  { key: 'caffeine_mg', labelKey: 'jqCaffeine', label: 'Caffeine', emoji: '☕', unit: 'mg', type: 'number', placeholder: '200', descKey: 'jqCaffeineDesc', description: 'Total caffeine intake (mg)' },
  { key: 'last_caffeine_hour', labelKey: 'jqLastCaffeine', label: 'Last Caffeine Time', emoji: '⏰', unit: 'hr', type: 'number', placeholder: '14', descKey: 'jqLastCaffeineDesc', description: 'Hour of last caffeine (0–23)' },
  { key: 'meditation_minutes', labelKey: 'jqMeditation', label: 'Meditation', emoji: '🧘', unit: 'min', type: 'number', placeholder: '10', descKey: 'jqMeditationDesc', description: 'Meditation or breathing time' },
  { key: 'cold_exposure', labelKey: 'jqCold', label: 'Cold Exposure', emoji: '🧊', type: 'boolean', descKey: 'jqColdDesc', description: 'Cold shower or ice bath' },
  { key: 'mood', labelKey: 'jqMood', label: 'Mood', emoji: '😊', unit: '/10', type: 'slider', min: 1, max: 10, descKey: 'jqMoodDesc', description: 'Overall mood today' },
];

const DEFAULT_ENABLED = [
  'sunlight_minutes', 'water_ml', 'alcohol_units', 'stress_level',
  'screen_time_before_bed', 'caffeine_mg', 'mood'
];

export function getEnabledQuestions(settings) {
  const enabled = settings?.enabled_questions;
  if (Array.isArray(enabled) && enabled.length > 0) return enabled;
  return DEFAULT_ENABLED;
}

/**
 * Health metrics we correlate against
 */
export const HEALTH_METRICS = [
  { key: 'sleep_score', labelKey: 'hmSleepScore', label: 'Sleep Score', emoji: '🌙' },
  { key: 'hrv', labelKey: 'hmHrv', label: 'HRV', emoji: '💓' },
  { key: 'recovery_score', labelKey: 'hmRecovery', label: 'Recovery Score', emoji: '⚡' },
  { key: 'sleep_duration', labelKey: 'hmSleepDuration', label: 'Sleep Duration', emoji: '😴' },
  { key: 'resting_hr', labelKey: 'hmRestingHR', label: 'Resting Heart Rate', emoji: '❤️' },
];

/**
 * Pearson correlation coefficient between two arrays
 */
function pearsonCorrelation(xs, ys) {
  const n = xs.length;
  if (n < 2) return null;
  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;
  const num = xs.reduce((s, v, i) => s + (v - meanX) * (ys[i] - meanY), 0);
  const denX = Math.sqrt(xs.reduce((s, v) => s + Math.pow(v - meanX, 2), 0));
  const denY = Math.sqrt(ys.reduce((s, v) => s + Math.pow(v - meanY, 2), 0));
  if (denX === 0 || denY === 0) return null;
  return num / (denX * denY);
}

/**
 * Given journal entries and health logs, compute all correlations.
 * Returns array of correlation objects sorted by |r| descending.
 */
export function computeCorrelations(journalEntries, healthLogs) {
  if (!Array.isArray(journalEntries) || !Array.isArray(healthLogs)) return [];
  if (journalEntries.length < 3) return [];

  // Index health logs by date
  const logsByDate = {};
  for (const log of healthLogs) {
    if (log.date) {
      logsByDate[log.date] = {
        ...log,
        recovery_score: calculateRecoveryScore(log),
        sleep_score: log.sleep_quality != null ? log.sleep_quality * 10 : null,
        resting_hr: log.heart_rate_avg,
      };
    }
  }

  const results = [];

  for (const hMetric of HEALTH_METRICS) {
    for (const jQ of JOURNAL_QUESTIONS) {
      // Gather paired data points
      const pairs = [];
      for (const entry of journalEntries) {
        const log = logsByDate[entry.date];
        if (!log) continue;
        const jVal = jQ.type === 'boolean'
          ? (entry[jQ.key] === true ? 1 : entry[jQ.key] === false ? 0 : null)
          : entry[jQ.key];
        const hVal = log[hMetric.key];
        if (jVal != null && hVal != null && !isNaN(jVal) && !isNaN(hVal)) {
          pairs.push([jVal, hVal]);
        }
      }

      if (pairs.length < 3) continue;

      const xs = pairs.map(p => p[0]);
      const ys = pairs.map(p => p[1]);
      const r = pearsonCorrelation(xs, ys);
      if (r === null || Math.abs(r) < 0.1) continue;

      // Calculate "high vs low" insight
      const median = [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
      const highXDays = pairs.filter(p => p[0] >= median);
      const lowXDays = pairs.filter(p => p[0] < median);

      const avgHighY = highXDays.length ? highXDays.reduce((s, p) => s + p[1], 0) / highXDays.length : null;
      const avgLowY = lowXDays.length ? lowXDays.reduce((s, p) => s + p[1], 0) / lowXDays.length : null;

      let pctDiff = null;
      if (avgHighY != null && avgLowY != null && avgLowY !== 0) {
        pctDiff = ((avgHighY - avgLowY) / Math.abs(avgLowY)) * 100;
        // Flip for metrics where lower is better (resting_hr, stress)
        if (hMetric.key === 'resting_hr') pctDiff = -pctDiff;
      }

      // Reverse correlation for boolean to make insight direction cleaner
      const isInverted = jQ.type !== 'boolean' && r < 0;
      const insightPolarity = isInverted ? 'lower' : 'higher';

      results.push({
        id: `${jQ.key}_${hMetric.key}`,
        journalKey: jQ.key,
        journalLabelKey: jQ.labelKey,
        journalLabel: jQ.label,
        journalEmoji: jQ.emoji,
        healthKey: hMetric.key,
        healthLabelKey: hMetric.labelKey,
        healthLabel: hMetric.label,
        healthEmoji: hMetric.emoji,
        r: Math.round(r * 100) / 100,
        absR: Math.abs(r),
        strength: Math.abs(r) >= 0.6 ? 'strong' : Math.abs(r) >= 0.35 ? 'moderate' : 'weak',
        positive: r > 0,
        pctDiff: pctDiff != null ? Math.round(pctDiff) : null,
        insightPolarity,
        dataPoints: pairs.length,
        // Time series for chart: [{date, jVal, hVal}]
        series: journalEntries
          .filter(e => {
            const log = logsByDate[e.date];
            const jv = jQ.type === 'boolean' ? (e[jQ.key] === true ? 1 : e[jQ.key] === false ? 0 : null) : e[jQ.key];
            return log && jv != null && log[hMetric.key] != null;
          })
          .map(e => {
            const log = logsByDate[e.date];
            const jv = jQ.type === 'boolean' ? (e[jQ.key] === true ? 1 : 0) : e[jQ.key];
            return { date: e.date, jVal: jv, hVal: log[hMetric.key] };
          })
          .sort((a, b) => a.date.localeCompare(b.date)),
      });
    }
  }

  return results.sort((a, b) => b.absR - a.absR);
}

/**
 * Build a text summary of top correlations for the AI Coach
 */
export function buildCorrelationContext(correlations) {
  if (!Array.isArray(correlations) || correlations.length === 0) return null;
  const top = correlations.slice(0, 8);
  const lines = top.map(c => {
    const dir = c.positive ? 'positively' : 'negatively';
    const pct = c.pctDiff != null ? ` (${c.pctDiff > 0 ? '+' : ''}${c.pctDiff}% difference)` : '';
    return `  - ${c.journalEmoji} ${c.journalLabel} is ${dir} correlated with ${c.healthEmoji} ${c.healthLabel} (r=${c.r}, ${c.strength}${pct}, n=${c.dataPoints} days)`;
  });
  return `
=== LIFESTYLE CORRELATION INSIGHTS ===
Based on ${correlations[0]?.dataPoints ?? '?'}+ days of journal data, the following patterns have emerged:

${lines.join('\n')}

Use these correlations to give highly personalised advice. If the user asks why their HRV is low or sleep is poor, reference the relevant lifestyle factors above.
======================================`.trim();
}