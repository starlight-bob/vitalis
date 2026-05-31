import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, ShoppingBag, ClipboardList, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LabTestCard from '@/components/advanced-labs/LabTestCard';
import AdvancedLabResultItem from '@/components/advanced-labs/AdvancedLabResultItem';
import AdvancedLabResultModal from '@/components/advanced-labs/AdvancedLabResultModal';
import OrderModal from '@/components/advanced-labs/OrderModal';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'shop', label: 'Shop Tests', icon: ShoppingBag },
  { key: 'results', label: 'My Results', icon: ClipboardList },
];

const SAMPLE_TESTS = [
  {
    id: 'sample-1', name: 'Comprehensive Blood Panel', category: 'Blood Panel', price: 89,
    description: 'A full metabolic panel covering CBC, lipids, liver, kidney function, and glucose.',
    turnaround_days: 3, popular: true,
    biomarkers: ['WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'Platelets', 'LDL', 'HDL', 'Triglycerides', 'ALT', 'AST', 'Creatinine', 'Glucose'],
  },
  {
    id: 'sample-2', name: 'Hormone Panel (Male)', category: 'Hormone Panel', price: 129,
    description: 'Comprehensive male hormone assessment including testosterone, estrogen, and cortisol.',
    turnaround_days: 4, popular: true,
    biomarkers: ['Total Testosterone', 'Free Testosterone', 'Estradiol', 'Cortisol', 'DHEA-S', 'LH', 'FSH'],
  },
  {
    id: 'sample-3', name: 'Hormone Panel (Female)', category: 'Hormone Panel', price: 129,
    description: 'Female hormone balance including estrogen, progesterone, and thyroid markers.',
    turnaround_days: 4,
    biomarkers: ['Estradiol', 'Progesterone', 'Testosterone', 'LH', 'FSH', 'TSH', 'Cortisol'],
  },
  {
    id: 'sample-4', name: 'Vitamin & Mineral Screen', category: 'Vitamin & Minerals', price: 69,
    description: 'Check key vitamins and minerals that impact energy, immunity, and cognitive performance.',
    turnaround_days: 3,
    biomarkers: ['Vitamin D', 'Vitamin B12', 'Folate', 'Iron', 'Ferritin', 'Magnesium', 'Zinc'],
  },
  {
    id: 'sample-5', name: 'Thyroid Function Panel', category: 'Thyroid', price: 59,
    description: 'Full thyroid assessment to detect hypo/hyperthyroidism and autoimmune conditions.',
    turnaround_days: 3,
    biomarkers: ['TSH', 'Free T3', 'Free T4', 'Anti-TPO', 'Anti-TG'],
  },
  {
    id: 'sample-6', name: 'Metabolic & Insulin Resistance', category: 'Metabolic', price: 79,
    description: 'Assess metabolic health, insulin sensitivity, and risk of type 2 diabetes.',
    turnaround_days: 3,
    biomarkers: ['Fasting Insulin', 'HbA1c', 'Glucose', 'HOMA-IR', 'Triglycerides', 'HDL'],
  },
  {
    id: 'sample-7', name: 'Cardiovascular Risk Panel', category: 'Cardiovascular', price: 99,
    description: 'Advanced cardiac markers to assess heart disease risk beyond standard lipid panels.',
    turnaround_days: 4, popular: true,
    biomarkers: ['ApoB', 'Lp(a)', 'hsCRP', 'Homocysteine', 'LDL-P', 'HDL', 'Triglycerides'],
  },
  {
    id: 'sample-8', name: 'Gut Health Screen', category: 'Gut Health', price: 149,
    description: 'Assess gut microbiome diversity, inflammation markers, and digestive health indicators.',
    turnaround_days: 7,
    biomarkers: ['Calprotectin', 'Zonulin', 'Secretory IgA', 'Lactoferrin', 'Short Chain Fatty Acids'],
  },
];

const CATEGORY_FILTERS = ['All', 'Blood Panel', 'Hormone Panel', 'Vitamin & Minerals', 'Thyroid', 'Metabolic', 'Cardiovascular', 'Gut Health'];

export default function AdvancedLabs() {
  const [activeTab, setActiveTab] = useState('shop');
  const [activeCategory, setActiveCategory] = useState('All');
  const [orderingTest, setOrderingTest] = useState(null);
  const [viewingResult, setViewingResult] = useState(null);

  // Try to load user-created tests from DB, fall back to sample catalog
  const { data: dbTests = [] } = useQuery({
    queryKey: ['labTests'],
    queryFn: () => base44.entities.LabTest.list(),
  });

  const { data: rawResults, isLoading: loadingResults } = useQuery({
    queryKey: ['advancedLabResults'],
    queryFn: () => base44.entities.AdvancedLabResult.list('-created_date', 100),
  });

  const results = Array.isArray(rawResults) ? rawResults : [];
  const catalog = dbTests.length > 0 ? dbTests : SAMPLE_TESTS;

  const filteredCatalog = activeCategory === 'All'
    ? catalog
    : catalog.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 pt-8 md:pt-0">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <FlaskConical className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Advanced Labs</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Order precision tests · View your results</p>
        </div>
      </motion.div>

      {/* Tab switcher */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex bg-muted rounded-xl p-1 gap-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
                active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.key === 'results' && results.length > 0 && (
                <span className="h-4 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center">
                  {results.length}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'shop' && (
          <motion.div
            key="shop"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORY_FILTERS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid gap-4">
              {filteredCatalog.map((test, i) => (
                <LabTestCard
                  key={test.id}
                  test={test}
                  onBuy={setOrderingTest}
                  delay={i * 0.04}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            {loadingResults ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : results.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border text-center px-6">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">No results yet</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-xs">
                  Order your first lab test to see detailed biomarker results here.
                </p>
                <Button onClick={() => setActiveTab('shop')} className="gap-2 rounded-xl">
                  <ShoppingCart className="h-4 w-4" />
                  Browse Tests
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {results.map((result, i) => (
                  <AdvancedLabResultItem
                    key={result.id}
                    result={result}
                    onClick={setViewingResult}
                    delay={i * 0.05}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {orderingTest && (
          <OrderModal test={orderingTest} onClose={() => setOrderingTest(null)} />
        )}
        {viewingResult && (
          <AdvancedLabResultModal result={viewingResult} onClose={() => setViewingResult(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}