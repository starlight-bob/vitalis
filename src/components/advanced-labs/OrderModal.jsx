import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FlaskConical, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function OrderModal({ test, onClose }) {
  const [step, setStep] = useState('confirm'); // confirm | success
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  if (!test) return null;

  const handleOrder = async () => {
    setLoading(true);
    // Create a pending AdvancedLabResult for the user
    await base44.entities.AdvancedLabResult.create({
      test_name: test.name,
      test_id: test.id,
      date_ordered: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pending',
    });
    queryClient.invalidateQueries({ queryKey: ['advancedLabResults'] });
    setLoading(false);
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="bg-card w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        {step === 'confirm' ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-foreground">Order Test</h2>
              <button onClick={onClose} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-muted rounded-xl p-4 mb-5 space-y-2">
              <p className="text-sm font-semibold text-foreground">{test.name}</p>
              {test.description && <p className="text-xs text-muted-foreground">{test.description}</p>}
              {test.turnaround_days && (
                <p className="text-xs text-muted-foreground">Results in {test.turnaround_days} business days</p>
              )}
              <p className="text-xl font-bold text-foreground">${test.price}</p>
            </div>

            <p className="text-xs text-muted-foreground text-center mb-5">
              This will place an order for the selected lab test. You'll be notified when your results are ready.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleOrder} disabled={loading} className="flex-1 rounded-xl gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Confirm Order · ${test.price}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-4 gap-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Order Placed!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your <span className="font-medium text-foreground">{test.name}</span> has been ordered. Check "My Results" for updates.
              </p>
            </div>
            <Button onClick={onClose} className="w-full rounded-xl">Done</Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}