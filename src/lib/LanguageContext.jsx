import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Nav
    dashboard: 'Dashboard',
    trends: 'Trends',
    bioAge: 'Bio Age',
    logEntry: 'Log Entry',
    journal: 'Daily Journal',
    connectDevices: 'Connect Devices',
    labResults: 'Lab Results',
    biologicalAge: 'Biological Age',
    healthCoach: 'Health Coach',
    more: 'More',
    coach: 'Coach',
    signOut: 'Sign Out',

    // Dashboard
    todaysVitals: "Today's Vitals",
    noDataLogged: 'No data logged today',
    noDataDesc: 'Log your health metrics to see your recovery score, energy level, and sleep summary.',
    logHealthMetrics: 'Log Health Metrics',
    logToday: 'Log Today',
    restingHR: 'Resting HR',
    averageResting: 'Average resting',
    heartRateVariability: 'Heart rate variability',
    workoutIntensity: 'Workout intensity',
    goalReached: 'Goal reached!',
    toGoal: 'to goal',
    notes: 'Notes',
    strain: 'Strain',
    steps: 'Steps',

    // Log Entry
    logEntryTitle: 'Log Health Data',
    logEntryDesc: 'Track your daily health metrics',
    save: 'Save',
    saving: 'Saving…',
    savedSuccess: 'Saved successfully!',
    date: 'Date',
    heartRate: 'Heart Rate',
    hrv: 'HRV',
    sleepDuration: 'Sleep Duration',
    sleepQuality: 'Sleep Quality',
    workoutStrain: 'Workout Strain',
    stepsLabel: 'Steps',
    notesLabel: 'Notes',

    // Trends
    trendsTitle: 'Trends',
    trendsDesc: 'Your health data over time',

    // Bio Age
    biologicalAgeTitle: 'Biological Age',
    biologicalAgeDesc: "Your body's true age based on health biomarkers",
    notEnoughData: 'Not enough data yet',
    notEnoughDataDesc: 'Log at least 5 days of health data to calculate your biological age. The more data, the more accurate the estimate.',
    estimatesOnly: 'Estimates only · not medical advice',

    // Journal
    journalTitle: 'Daily Journal',
    journalDesc: 'Track daily habits and lifestyle factors',

    // Lab Results
    labResultsTitle: 'Lab Results',
    labResultsDesc: 'Your medical test results',

    // Account / Settings
    settings: 'Settings',
    currentPlan: 'Current Plan',
    upgrade: 'Upgrade',
    notifications: 'Notifications',
    units: 'Units',
    connectedDevices: 'Connected Devices',
    privacySettings: 'Privacy Settings',
    helpSupport: 'Help & Support',
    language: 'Language',
    deleteAccount: 'Delete Account',
    deleteAccountTitle: 'Delete Account?',
    deleteAccountDesc: 'This will permanently delete your account and all associated data — including health logs, lab results, journal entries, and device connections. This action cannot be undone.',
    cancel: 'Cancel',
    deleteMyAccount: 'Delete My Account',
    deleting: 'Deleting…',

    // Connect Devices
    connectDevicesTitle: 'Connect Devices',
    connectDevicesDesc: 'Sync your wearables and health apps',

    // Health Coach
    healthCoachTitle: 'Health Coach',
  },
  zh: {
    // Nav
    dashboard: '仪表盘',
    trends: '趋势',
    bioAge: '生物年龄',
    logEntry: '记录数据',
    journal: '每日日记',
    connectDevices: '连接设备',
    labResults: '检验报告',
    biologicalAge: '生物年龄',
    healthCoach: '健康教练',
    more: '更多',
    coach: '教练',
    signOut: '退出登录',

    // Dashboard
    todaysVitals: '今日健康数据',
    noDataLogged: '今日暂无数据',
    noDataDesc: '记录您的健康指标，查看恢复评分、能量水平和睡眠摘要。',
    logHealthMetrics: '记录健康指标',
    logToday: '立即记录',
    restingHR: '静息心率',
    averageResting: '平均静息',
    heartRateVariability: '心率变异性',
    workoutIntensity: '运动强度',
    goalReached: '已达目标！',
    toGoal: '距目标',
    notes: '备注',
    strain: '运动负荷',
    steps: '步数',

    // Log Entry
    logEntryTitle: '记录健康数据',
    logEntryDesc: '追踪您的每日健康指标',
    save: '保存',
    saving: '保存中…',
    savedSuccess: '保存成功！',
    date: '日期',
    heartRate: '心率',
    hrv: '心率变异性',
    sleepDuration: '睡眠时长',
    sleepQuality: '睡眠质量',
    workoutStrain: '运动负荷',
    stepsLabel: '步数',
    notesLabel: '备注',

    // Trends
    trendsTitle: '健康趋势',
    trendsDesc: '您的健康数据变化',

    // Bio Age
    biologicalAgeTitle: '生物年龄',
    biologicalAgeDesc: '基于健康生物标志物的身体真实年龄',
    notEnoughData: '数据不足',
    notEnoughDataDesc: '请至少记录5天的健康数据以计算您的生物年龄。数据越多，估算越准确。',
    estimatesOnly: '仅供参考 · 非医疗建议',

    // Journal
    journalTitle: '每日日记',
    journalDesc: '追踪每日习惯和生活方式',

    // Lab Results
    labResultsTitle: '检验报告',
    labResultsDesc: '您的医疗检验结果',

    // Account / Settings
    settings: '设置',
    currentPlan: '当前套餐',
    upgrade: '升级',
    notifications: '通知',
    units: '单位',
    connectedDevices: '已连接设备',
    privacySettings: '隐私设置',
    helpSupport: '帮助与支持',
    language: '语言',
    deleteAccount: '删除账户',
    deleteAccountTitle: '删除账户？',
    deleteAccountDesc: '这将永久删除您的账户及所有相关数据，包括健康日志、检验报告、日记和设备连接。此操作无法撤销。',
    cancel: '取消',
    deleteMyAccount: '删除我的账户',
    deleting: '删除中…',

    // Connect Devices
    connectDevicesTitle: '连接设备',
    connectDevicesDesc: '同步您的可穿戴设备和健康应用',

    // Health Coach
    healthCoachTitle: '健康教练',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');

  const switchLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = (key) => translations[lang]?.[key] ?? translations['en'][key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}