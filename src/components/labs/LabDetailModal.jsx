import { motion } from 'framer-motion';
import { X, FileText, Download, Edit2, Trash2, Calendar, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CategoryBadge from './CategoryBadge';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function LabDetailModal({ result, onClose, onEdit }) {
  const qc = useQueryClient();
  const isImage = result.file_type?.startsWith('image/');
  const isPdf = result.file_type === 'application/pdf';

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.LabResult.delete(result.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['labResults'] });
      toast.success('Record deleted');
      onClose();
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 16 }}
        className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="space-y-1.5">
            <CategoryBadge category={result.category} />
            <h2 className="text-lg font-semibold text-foreground leading-tight">{result.title}</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(result.date + 'T00:00:00'), 'MMMM d, yyyy')}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {/* Document preview */}
          {result.file_url && (
            <div className="border-b border-border bg-black/20">
              {isImage ? (
                <img
                  src={result.file_url}
                  alt={result.title}
                  className="w-full max-h-[400px] object-contain"
                />
              ) : isPdf ? (
                <iframe
                  src={result.file_url}
                  title={result.title}
                  className="w-full h-[400px]"
                />
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">{result.file_name || 'Document'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!result.file_url && (
            <div className="flex items-center justify-center py-12 border-b border-border">
              <div className="text-center space-y-2">
                <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <p className="text-xs text-muted-foreground">No document attached</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {result.notes && (
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-2">
                <StickyNote className="h-3.5 w-3.5" /> Notes
              </div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result.notes}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-border flex items-center gap-2 flex-shrink-0">
          {result.file_url && (
            <a href={result.file_url} target="_blank" rel="noopener noreferrer" download>
              <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground">
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </a>
          )}
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:border-destructive/40"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => { onClose(); onEdit(result); }}>
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}