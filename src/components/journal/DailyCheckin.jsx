import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, Settings2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JOURNAL_QUESTIONS, getEnabledQuestions } from '@/lib/correlationEngine';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { useLanguage } from '@/lib/LanguageContext';

function QuestionInput({ q, value, onChange, t }) {
  if (q.type === 'boolean') {
    return (
      <div className="flex gap-2">
        {[{ label: t ? t('yes') : 'Yes', val: true }, { label: t ? t('no') : 'No', val: false }].map(opt => (
          <button
            key={opt.label}
            onClick={() => onChange(opt.val)}
            className={cn(
              'flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all',
              value === opt.val
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted border-border text-muted-foreground hover:bg-accent'
            )}
          >{opt.label}</button>
        ))}
      </div>
    );
  }

  if (q.type === 'slider') {
    const v = value ?? Math.round((q.min + q.max) / 2);
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{q.min}</span>
          <span className="font-bold text-foreground text-base">{v}</span>
          <span>{q.max}</span>
        </div>
        <input
          type="range"
          min={q.min}
          max={q.max}
          value={v}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{q.key === 'stress_level' ? (t ? t('relaxed') : 'Relaxed') : (t ? t('low') : 'Low')}</span>
          <span>{q.key === 'stress_level' ? (t ? t('overwhelmed') : 'Overwhelmed') : (t ? t('high') : 'High')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="number"
        inputMode="numeric"
        placeholder={q.placeholder}
        value={value ?? ''}
        onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
      {q.unit && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{q.unit}</span>
      )}
    </div>
  );
}

export default function DailyCheckin({ onSave, onClose, settings, existingEntry, initialDate }) {
  const { t } = useLanguage();
  const enabledKeys = getEnabledQuestions(settings);
  const activeQuestions = JOURNAL_QUESTIONS.filter(q => enabledKeys.includes(q.key));

  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(initialDate || today);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => {
    const init = {};
    if (existingEntry) {
      for (const q of activeQuestions) {
        if (existingEntry[q.key] != null) init[q.key] = existingEntry[q.key];
      }
    }
    return init;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [pendingEnabled, setPendingEnabled] = useState(new Set(enabledKeys));

  const current = activeQuestions[step];
  const isLast = step === activeQuestions.length - 1;
  const progress = activeQuestions.length > 0 ? ((step + 1) / activeQuestions.length) * 100 : 100;

  const handleNext = () => {
    if (isLast) {
      onSave(answers, selectedDate);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => setStep(s => Math.max(0, s - 1));

  const handleSkip = () => {
    const next = { ...answers };
    delete next[current.key];
    setAnswers(next);
    handleNext();
  };

  const toggleQuestion = (key) => {
    setPendingEnabled(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  };

  if (showSettings) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="bg-card w-full max-w-md rounded-t-3xl p-6 pb-10 space-y-4 max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-foreground">{t('customiseQuestions')}</h2>
            <button onClick={() => setShowSettings(false)} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{t('chooseHabits')}</p>
          <div className="space-y-2">
            {JOURNAL_QUESTIONS.map(q => (
              <button
                key={q.key}
                onClick={() => toggleQuestion(q.key)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
                  pendingEnabled.has(q.key) ? 'bg-primary/10 border-primary/30' : 'bg-muted border-border opacity-60'
                )}
              >
                <span className="text-xl">{q.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{q.label}</p>
                  <p className="text-[10px] text-muted-foreground">{q.description}</p>
                </div>
                {pendingEnabled.has(q.key) && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
              </button>
            ))}
          </div>
          <Button
            className="w-full"
            onClick={() => {
              setShowSettings(false);
              // Persist settings via parent
              onSave({ __settings: Array.from(pendingEnabled) });
            }}
          >
            {t('savePreferences')}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-card w-full max-w-md rounded-t-3xl p-6 pb-10 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{t('dailyCheckinTitle')}</p>
            <h2 className="text-base font-bold text-foreground mt-0.5">{step + 1} {t('of')} {activeQuestions.length}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(true)} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={onClose} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Date selector */}
        <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
          <CalendarDays className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
          <button
            onClick={() => setSelectedDate(today)}
            className={cn(
              'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all',
              selectedDate === today ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >{t('today').replace('📅 ', '')}</button>
          <button
            onClick={() => setSelectedDate(yesterday)}
            className={cn(
              'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all',
              selectedDate === yesterday ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >{t('yesterday') || 'Yesterday'}</button>
          <div className="flex-1 relative">
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={e => setSelectedDate(e.target.value)}
              className={cn(
                'w-full py-1.5 rounded-lg text-xs font-semibold bg-transparent text-center cursor-pointer transition-all focus:outline-none',
                selectedDate !== today && selectedDate !== yesterday
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question */}
        {current && (
          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{current.emoji}</span>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{current.label}</h3>
                  <p className="text-sm text-muted-foreground">{current.description}</p>
                </div>
              </div>
              <QuestionInput
                q={current}
                value={answers[current.key]}
                onChange={val => setAnswers(prev => ({ ...prev, [current.key]: val }))}
                t={t}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">{t('back')}</Button>
          )}
          <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground text-sm">{t('skip')}</Button>
          <Button onClick={handleNext} className="flex-1 gap-1">
            {isLast ? t('saveCheckin') : t('next')}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}