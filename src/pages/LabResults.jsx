import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/layout/PullToRefresh';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FlaskConical, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LabTimelineItem from '@/components/labs/LabTimelineItem';
import LabUploadForm from '@/components/labs/LabUploadForm';
import LabDetailModal from '@/components/labs/LabDetailModal';

const CATEGORIES = ['All', 'Blood Work', 'Imaging', 'Urine', 'Hormone Panel', 'Other'];

export default function LabResults() {
  const [showForm, setShowForm] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['labResults'],
    queryFn: () => base44.entities.LabResult.list('-date', 200),
  });

  const filtered = useMemo(() => {
    return results
      .filter(r => activeCategory === 'All' || r.category === activeCategory)
      .filter(r => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return r.title?.toLowerCase().includes(q) || r.notes?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [results, activeCategory, search]);

  // Group by year for timeline
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(r => {
      const year = r.date?.slice(0, 4) || 'Unknown';
      if (!map[year]) map[year] = [];
      map[year].push(r);
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  return (
    <PullToRefresh queryKeys={[['labResults']]}>
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 md:pt-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Lab Results</h1>
          <p className="text-muted-foreground mt-1">Your medical records, documents, and test results</p>
        </div>
        <Button onClick={() => { setEditingResult(null); setShowForm(true); }} className="gap-2 flex-shrink-0">
          <Plus className="h-4 w-4" /> Add Record
        </Button>
      </motion.div>

      {/* Search + filter bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search records, notes, categories…"
            className="pl-10 bg-card border-border"
          />
        </div>
        {/* Category pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 font-medium ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats row */}
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Blood Work', 'Imaging', 'Hormone Panel', 'Other'].map(cat => {
            const count = results.filter(r => r.category === cat || (cat === 'Other' && ['Urine', 'Other'].includes(r.category))).length;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat === 'Other' ? 'All' : cat)}
                className="bg-card border border-border rounded-xl p-3 text-left hover:border-primary/30 transition-all">
                <p className="text-xl font-bold text-foreground">{results.filter(r => r.category === cat).length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{cat}</p>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Timeline */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FlaskConical className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {results.length === 0 ? 'No records yet' : 'No matches found'}
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs mb-5">
            {results.length === 0
              ? 'Upload your first lab result, scan, or medical document to get started.'
              : 'Try adjusting your search or filter.'}
          </p>
          {results.length === 0 && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add First Record
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([year, items]) => (
            <div key={year}>
              {/* Year header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{year}</span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{items.length} record{items.length !== 1 ? 's' : ''}</span>
              </div>
              {/* Timeline items */}
              <div>
                {items.map((r, i) => (
                  <LabTimelineItem
                    key={r.id}
                    result={r}
                    onClick={setSelectedResult}
                    isLast={i === items.length - 1}
                    delay={i * 0.05}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {(showForm || editingResult) && (
          <LabUploadForm
            existing={editingResult}
            onClose={() => { setShowForm(false); setEditingResult(null); }}
          />
        )}
        {selectedResult && (
          <LabDetailModal
            result={selectedResult}
            onClose={() => setSelectedResult(null)}
            onEdit={(r) => { setEditingResult(r); setShowForm(true); }}
          />
        )}
      </AnimatePresence>
    </div>
    </PullToRefresh>
  );
}