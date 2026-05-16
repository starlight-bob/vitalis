/**
 * Calculate current consecutive day streak from health logs
 */
export function calculateStreak(logs) {
  if (!logs || logs.length === 0) return 0;

  const dates = [...new Set(logs.map(l => l.date))].sort((a, b) => b.localeCompare(a));
  if (dates.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Streak must start from today or yesterday
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 0;
  let current = new Date(dates[0] + 'T00:00:00');

  for (const date of dates) {
    const d = new Date(date + 'T00:00:00');
    const diffDays = Math.round((current - d) / 86400000);
    if (diffDays === 0 || diffDays === 1) {
      streak++;
      current = d;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Evaluate which badges are earned
 */
export function evaluateBadges(logs, labResults, bioData) {
  const streak = calculateStreak(logs);

  const sleepMasterDays = logs.filter(l => l.sleep_duration >= 8).length;
  const recoveryKingDays = logs.filter(l => {
    // approximate 90%+ recovery: high HRV + good sleep
    return l.hrv >= 90 && l.sleep_quality >= 8;
  }).length;

  return [
    {
      id: 'first_log',
      label: 'First Log',
      emoji: '🏅',
      earned: logs.length >= 1,
      desc: 'Log your first day',
      progress: Math.min(1, logs.length),
      total: 1,
    },
    {
      id: 'streak_7',
      label: '7-Day Streak',
      emoji: '🔥',
      earned: streak >= 7,
      desc: '7 consecutive days logged',
      progress: Math.min(7, streak),
      total: 7,
    },
    {
      id: 'streak_30',
      label: '30-Day Streak',
      emoji: '💪',
      earned: streak >= 30,
      desc: '30 consecutive days logged',
      progress: Math.min(30, streak),
      total: 30,
    },
    {
      id: 'sleep_master',
      label: 'Sleep Master',
      emoji: '😴',
      earned: sleepMasterDays >= 7,
      desc: '7 nights of 8+ hours sleep',
      progress: Math.min(7, sleepMasterDays),
      total: 7,
    },
    {
      id: 'recovery_king',
      label: 'Recovery King',
      emoji: '👑',
      earned: recoveryKingDays >= 5,
      desc: '5 days of peak recovery',
      progress: Math.min(5, recoveryKingDays),
      total: 5,
    },
    {
      id: 'lab_vault',
      label: 'Lab Vault',
      emoji: '🧪',
      earned: (labResults?.length || 0) >= 1,
      desc: 'Upload your first lab result',
      progress: Math.min(1, labResults?.length || 0),
      total: 1,
    },
    {
      id: 'bio_young',
      label: 'Biologically Young',
      emoji: '🧬',
      earned: bioData ? bioData.delta < 0 : false,
      desc: 'Bio age lower than real age',
      progress: bioData && bioData.delta < 0 ? 1 : 0,
      total: 1,
    },
    {
      id: 'social',
      label: 'Social Butterfly',
      emoji: '🦋',
      earned: false,
      desc: 'Add 3 friends',
      progress: 0,
      total: 3,
    },
  ];
}