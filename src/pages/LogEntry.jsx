import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Activity, Moon, Star, Footprints, Flame, Save, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import MobileHeader from '@/components/layout/MobileHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const defaultValues = {
  heart_rate_avg: 65,
  hrv: 50,
  sleep_duration: 7,
  sleep_quality: 7,
  steps: 8000,
  workout_strain: 8,
  notes: '',
};

export default function LogEntry() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [form, setForm] = useState(defaultValues);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existingLogs = [] } = useQuery({
    queryKey: ['healthLogs', 'check', date],
    queryFn: () => base44.entities.HealthLog.filter({ date }, '-created_date', 1),
  });

  const existingLog = existingLogs[0];

  React.useEffect(() => {
    if (existingLog) {
      setForm({
        heart_rate_avg: existingLog.heart_rate_avg,
        hrv: existingLog.hrv,
        sleep_duration: existingLog.sleep_duration,
        sleep_quality: existingLog.sleep_quality,
        steps: existingLog.steps,
        workout_strain: existingLog.workout_strain,
        notes: existingLog.notes || '',
      });
    } else {
      setForm(defaultValues);
    }
  }, [existingLog?.id, date]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingLog) {
        return base44.entities.HealthLog.update(existingLog.id, data);
      }
      return base44.entities.HealthLog.create(data);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['healthLogs'] });
      const prev = queryClient.getQueryData(['healthLogs', 'today']);
      queryClient.setQueryData(['healthLogs', 'today'], (old = []) => {
        const optimistic = { ...data, id: existingLog?.id || '__optimistic__' };
        if (existingLog) return old.map(l => l.id === existingLog.id ? optimistic : l);
        return [optimistic, ...old];
      });
      return { prev };
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['healthLogs', 'today'], ctx.prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthLogs'] });
      setSaved(true);
      toast.success(existingLog ? 'Health log updated!' : 'Health log saved!');
      setTimeout(() => navigate('/'), 1000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({ ...form, date });
  };

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <MobileHeader title="Log Metrics" backTo="/" />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="hidden md:block">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Log Health Metrics</h1>
        <p className="text-muted-foreground mt-1">
          {existingLog ? 'Update your entry for this date' : 'Record your daily vitals'}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date picker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl border border-border p-6">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setSaved(false); }}
            className="mt-2 max-w-xs"
          />
        </motion.div>

        {/* Heart Rate */}
        <MetricInput
          icon={Heart}
          label="Resting Heart Rate"
          value={form.heart_rate_avg}
          onChange={(v) => updateField('heart_rate_avg', v)}
          min={30} max={120} step={1} unit="bpm"
          color="text-red-500"
          delay={0.1}
        />

        {/* HRV */}
        <MetricInput
          icon={Activity}
          label="Heart Rate Variability"
          value={form.hrv}
          onChange={(v) => updateField('hrv', v)}
          min={5} max={200} step={1} unit="ms"
          color="text-blue-500"
          delay={0.15}
        />

        {/* Sleep Duration */}
        <MetricInput
          icon={Moon}
          label="Sleep Duration"
          value={form.sleep_duration}
          onChange={(v) => updateField('sleep_duration', v)}
          min={0} max={14} step={0.5} unit="hours"
          color="text-indigo-500"
          delay={0.2}
        />

        {/* Sleep Quality */}
        <MetricInput
          icon={Star}
          label="Sleep Quality"
          value={form.sleep_quality}
          onChange={(v) => updateField('sleep_quality', v)}
          min={1} max={10} step={1} unit="/ 10"
          color="text-yellow-500"
          delay={0.25}
        />

        {/* Steps */}
        <MetricInput
          icon={Footprints}
          label="Steps"
          value={form.steps}
          onChange={(v) => updateField('steps', v)}
          min={0} max={50000} step={500} unit="steps"
          color="text-emerald-500"
          delay={0.3}
        />

        {/* Workout Strain */}
        <MetricInput
          icon={Flame}
          label="Workout Strain"
          value={form.workout_strain}
          onChange={(v) => updateField('workout_strain', v)}
          min={0} max={21} step={0.5} unit="/ 21"
          color="text-orange-500"
          delay={0.35}
        />

        {/* Notes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Notes</Label>
          </div>
          <Textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="How are you feeling today?"
            className="resize-none h-24"
          />
        </motion.div>

        {/* Submit */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 h-14 text-base"
            disabled={saveMutation.isPending || saved}
          >
            {saveMutation.isPending ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle2 className="h-5 w-5" /> Saved!</>
            ) : (
              <><Save className="h-5 w-5" /> {existingLog ? 'Update Entry' : 'Save Entry'}</>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}

function MetricInput({ icon: Icon, label, value, onChange, min, max, step, unit, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl bg-muted flex items-center justify-center ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="py-2"
      />
    </motion.div>
  );
}