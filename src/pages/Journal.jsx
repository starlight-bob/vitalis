import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Loader2, FlaskConical, ClipboardList, Sparkles, PlusCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { computeCorrelations, getEnabledQuestions, JOURNAL_QUESTIONS } from '@/lib/correlationEngine';
import DailyCheckin from '@/components/journal/DailyCheckin';
import CorrelationCard from '@/components/journal/CorrelationCard';
import CorrelationFilters from '@/components/journal/CorrelationFilters';
import { calculateRecoveryScore } from '@/lib/healthUtils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

const TODAY = format(new Date(), 'yyyy-MM-dd');

export default function Journal() {
  const { t } = useLanguage();
  const TABS = [
    { key: 'insights', label: t('correlations'), icon: FlaskConical },
    { key: 'log', label: t('journalLog'), icon: ClipboardList },
  ];
  const [tab, setTab] = useState('insights');
  const [filterMetric, setFilterMetric] = useState('all');
  const [showCheckin, setShowCheckin] = useState(false);
  const queryClient = useQueryClient();

  // Data fetching
  const { data: rawEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: () => base44.entities.JournalEntry.list('-date', 120),
    retry: 2,
  });

  const { data: rawSettings } = useQuery({
    queryKey: ['journalSettings'],
    queryFn: () => base44.entities.JournalSettings.list('-created_date', 1),
    retry: 2,
  });

  const { data: rawHealthLogs } = useQuery({
    queryKey: ['healthLogs', 'all'],
    queryFn: () => base44.entities.HealthLog.list('-date', 120),
    retry: 2,
  });

  const entries = Array.isArray(rawEntries) ? rawEntries : [];
  const healthLogs = Array.isArray(rawHealthLogs) ? rawHealthLogs : [];
  const settings = Array.isArray(rawSettings) && rawSettings.length > 0 ? rawSettings[0] : null;

  const todayEntry = entries.find(e => e.date === TODAY);
  const enabledKeys = getEnabledQuestions(settings);

  // Mutations
  const saveEntryMutation = useMutation({
    mutationFn: async ({ answers, date }) => {
      const existingForDate = entries.find(e => e.date === date);
      if (existingForDate?.id) {
        return base44.entities.JournalEntry.update(existingForDate.id, answers);
      }
      return base44.entities.JournalEntry.create({ date, ...answers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      setShowCheckin(false);
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (enabledArr) => {
      if (settings?.id) {
        return base44.entities.JournalSettings.update(settings.id, { enabled_questions: enabledArr });
      }
      return base44.entities.JournalSettings.create({ enabled_questions: enabledArr });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalSettings'] });
      setShowCheckin(false);
    },
  });

  const handleCheckinSave = (answers, date) => {
    // Settings-only save (from customise screen)
    if (answers.__settings) {
      saveSettingsMutation.mutate(answers.__settings);
      return;
    }
    saveEntryMutation.mutate({ answers, date });
  };

  // Correlations computation (memoized)
  const allCorrelations = useMemo(
    () => computeCorrelations(entries, healthLogs),
    [entries, healthLogs]
  );

  const filteredCorrelations = useMemo(() => {
    if (filterMetric === 'all') return allCorrelations;
    return allCorrelations.filter(c => c.healthKey === filterMetric);
  }, [allCorrelations, filterMetric]);

  const hasEnoughData = entries.length >= 3;

  if (entriesLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8 w-full" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Header */}
      <div className="flex items-start justify-between pt-12 md:pt-1">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">{t('journalTitle')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('journalSubtitle')}</p>
        </div>
        <Button
          onClick={() => setShowCheckin(true)}
          size="sm"
          className={cn(
            'gap-1.5 rounded-xl',
            todayEntry ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-primary hover:bg-primary/90'
          )}
        >
          {todayEntry ? <><Sparkles className="h-3.5 w-3.5" /> {t('todayDone')}</> : <><PlusCircle className="h-3.5 w-3.5" /> {t('checkIn')}</>}
        </Button>
      </div>

      {/* Today check-in banner (if not done) */}
      {!todayEntry && (
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowCheckin(true)}
          className="w-full bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 text-left hover:bg-primary/15 transition-colors"
        >
          <span className="text-3xl">🌅</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{t('morningCheckin')}</p>
            <p className="text-xs text-muted-foreground">{t('morningCheckinDesc')}</p>
          </div>
          <PlusCircle className="h-5 w-5 text-primary flex-shrink-0" />
        </motion.button>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-full">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CORRELATIONS TAB ── */}
      {tab === 'insights' && (
        <div className="space-y-4">
          {!hasEnoughData ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <span className="text-5xl">🔬</span>
              <div>
                <p className="text-base font-bold text-foreground">{t('notEnoughDataJournal')}</p>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">
                  {t('notEnoughDataJournalDesc')} <strong>3 {t('dailyCheckins')}</strong> {t('toUnlock')} {entries.length} {t('soFar')}
                </p>
              </div>
              {/* Mini progress */}
              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(100, (entries.length / 3) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{entries.length}/3 {t('checkinsComplete')}</p>
              <Button onClick={() => setShowCheckin(true)} className="gap-2">
                <PlusCircle className="h-4 w-4" /> {t('startCheckin')}
              </Button>
            </div>
          ) : (
            <>
              <CorrelationFilters active={filterMetric} onChange={setFilterMetric} />
              {filteredCorrelations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <span className="text-4xl">🔍</span>
                  <p className="text-sm font-semibold text-foreground">{t('noCorrelations')}</p>
                  <p className="text-xs text-muted-foreground">{t('noCorrelationsDesc')}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border border-border rounded-xl px-3 py-2 w-full overflow-hidden">
                    <Info className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{t('rankedBy')} {entries.length} {t('daysCheckins')}</span>
                  </div>
                  <div className="space-y-3">
                    {filteredCorrelations.map((c, i) => (
                      <CorrelationCard key={c.id} correlation={c} index={i} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── JOURNAL LOG TAB ── */}
      {tab === 'log' && (
        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <span className="text-4xl">📓</span>
              <p className="text-sm font-semibold text-foreground">{t('noEntriesYet')}</p>
              <p className="text-xs text-muted-foreground">{t('noEntriesDesc')}</p>
            </div>
          ) : (
            [...entries]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((entry, i) => (
                <JournalLogRow
                  key={entry.id}
                  entry={entry}
                  index={i}
                  enabledKeys={enabledKeys}
                  onEdit={() => setShowCheckin(true)}
                  isToday={entry.date === TODAY}
                />
              ))
          )}
        </div>
      )}

      {/* Daily Check-in Modal */}
      <AnimatePresence>
        {showCheckin && (
          <DailyCheckin
            onSave={handleCheckinSave}
            onClose={() => setShowCheckin(false)}
            settings={settings}
            existingEntry={todayEntry}
            initialDate={TODAY}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function JournalLogRow({ entry, index, enabledKeys, onEdit, isToday }) {
  const { t } = useLanguage();
  const activeQuestions = JOURNAL_QUESTIONS.filter(q => enabledKeys.includes(q.key));
  const filledCount = activeQuestions.filter(q => entry[q.key] != null).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-card border border-border rounded-2xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">
            {isToday ? t('today') : format(new Date(entry.date + 'T00:00:00'), 'EEE, MMM d')}
          </p>
          <p className="text-[10px] text-muted-foreground">{filledCount}/{activeQuestions.length} {t('questionsAnswered')}</p>
        </div>
        {isToday && (
          <button onClick={onEdit} className="text-xs text-primary font-semibold">{t('edit')}</button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {activeQuestions.map(q => {
          const val = entry[q.key];
          if (val == null) return null;
          const display = q.type === 'boolean' ? (val ? 'Yes' : 'No') : `${val}${q.unit ? q.unit : ''}`;
          return (
            <span key={q.key} className="inline-flex items-center gap-1 text-[10px] bg-muted border border-border rounded-lg px-2 py-1 font-medium">
              <span>{q.emoji}</span>
              <span className="text-muted-foreground">{q.label}:</span>
              <span className="text-foreground">{display}</span>
            </span>
          );
        })}
      </div>
      {entry.notes && (
        <p className="text-xs text-muted-foreground italic">"{entry.notes}"</p>
      )}
    </motion.div>
  );
}