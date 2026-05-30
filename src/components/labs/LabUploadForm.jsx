import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { X, Upload, FileText, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

const CATEGORIES = ['Blood Work', 'Imaging', 'Urine', 'Hormone Panel', 'Other'];

export default function LabUploadForm({ onClose, existing }) {
  const { t } = useLanguage();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    title: existing?.title || '',
    date: existing?.date || today,
    category: existing?.category || '',
    notes: existing?.notes || '',
  });
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const fileRef = useRef();
  const qc = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async () => {
      let fileData = {};
      if (file) {
        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setUploading(false);
        fileData = { file_url, file_name: file.name, file_type: file.type };
      }
      const payload = { ...form, ...fileData };
      if (existing) return base44.entities.LabResult.update(existing.id, payload);
      return base44.entities.LabResult.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['labResults'] });
      toast.success(existing ? t('recordUpdated') : t('labResultSaved'));
      onClose();
    },
  });

  const handleFile = (f) => {
    if (f && (f.type.startsWith('image/') || f.type === 'application/pdf')) {
      setFile(f);
    } else {
      toast.error(t('invalidFileType'));
    }
  };

  const valid = form.title.trim() && form.date && form.category;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 16 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {existing ? t('editRecord') : t('addLabResult')}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t('title')}</Label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Blood Panel - March 2026"
              className="bg-background border-border"
            />
          </div>

          {/* Date + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t('date')}</Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t('category')}</Label>
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border bg-background text-sm text-foreground"
              >
                <span className={form.category ? 'text-foreground' : 'text-muted-foreground'}>
                  {form.category || t('selectCategory')}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="bottom" className="rounded-t-2xl pb-safe">
                  <SheetHeader className="mb-4">
                    <SheetTitle>{t('selectCategorySheet')}</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-1">
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setForm(f => ({ ...f, category: c })); setSheetOpen(false); }}
                        className={cn(
                          'w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                          form.category === c ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* File drop zone */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              {t('document')} <span className="normal-case text-muted-foreground/60">{t('pdfOrImage')}</span>
            </Label>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              className={cn(
                'rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200',
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30'
              )}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-muted-foreground hover:text-foreground ml-1">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : existing?.file_url ? (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{existing.file_name || t('existingFile')}</span>
                  <span className="text-xs">{t('uploadNewToReplace')}</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">{t('dropFileHere')} <span className="text-primary">{t('browse')}</span></p>
                  <p className="text-xs text-muted-foreground/60">{t('pdfSizeLimit')}</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t('notesLabel')}</Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Doctor's comments, key values, follow-up actions…"
              className="resize-none h-20 bg-background border-border"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">{t('cancel')}</Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!valid || saveMutation.isPending}
            className="flex-1 gap-2"
          >
            {saveMutation.isPending || uploading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {uploading ? t('uploading') : t('saving')}</>
            ) : (
              <><CheckCircle2 className="h-4 w-4" /> {existing ? t('update') : t('saveRecord')}</>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}