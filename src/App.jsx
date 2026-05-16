import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from '@/components/layout/AppLayout';
import ThemeProvider from '@/lib/ThemeProvider';
import { Loader2 } from 'lucide-react';

const Dashboard      = lazy(() => import('@/pages/Dashboard'));
const LogEntry       = lazy(() => import('@/pages/LogEntry'));
const Trends         = lazy(() => import('@/pages/Trends'));
const HealthCoach    = lazy(() => import('@/pages/HealthCoach'));
const ConnectDevices = lazy(() => import('@/pages/ConnectDevices'));
const LabResults     = lazy(() => import('@/pages/LabResults'));
const BiologicalAge  = lazy(() => import('@/pages/BiologicalAge'));
const Account        = lazy(() => import('@/pages/Account'));
const DeviceSettings = lazy(() => import('@/pages/DeviceSettings'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const pageVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, x: -24, transition: { duration: 0.18, ease: [0.55, 0, 1, 0.45] } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ willChange: 'opacity, transform' }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log" element={<LogEntry />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/coach" element={<HealthCoach />} />
            <Route path="/devices" element={<ConnectDevices />} />
            <Route path="/labs" element={<LabResults />} />
            <Route path="/bio-age" element={<BiologicalAge />} />
            <Route path="/account" element={<Account />} />
            <Route path="/device-settings" element={<DeviceSettings />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/*" element={<AnimatedRoutes />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App