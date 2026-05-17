import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, TrendingUp, LogOut, Heart, Sparkles, Plug, FlaskConical, Dna, MoreHorizontal, X, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import MobileProfileButton from '@/components/account/MobileProfileButton';
import MobileWatchButton from '@/components/devices/MobileWatchButton';

const primaryNav = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/trends', icon: TrendingUp, label: 'Trends' },
  { path: '/bio-age', icon: Dna, label: 'Bio Age' },
];

const moreNav = [
  { path: '/log', icon: PlusCircle, label: 'Log Entry' },
  { path: '/journal', icon: BookOpen, label: 'Daily Journal' },
  { path: '/devices', icon: Plug, label: 'Connect Devices' },
  { path: '/labs', icon: FlaskConical, label: 'Lab Results' },
];

const allSidebarNav = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/log', icon: PlusCircle, label: 'Log Entry' },
  { path: '/trends', icon: TrendingUp, label: 'Trends' },
  { path: '/journal', icon: BookOpen, label: 'Daily Journal' },
  { path: '/coach', icon: Sparkles, label: 'Health Coach' },
  { path: '/devices', icon: Plug, label: 'Connect Devices' },
  { path: '/labs', icon: FlaskConical, label: 'Lab Results' },
  { path: '/bio-age', icon: Dna, label: 'Biological Age' },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleTabPress = (path) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border fixed inset-y-0 left-0 z-30">
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <Heart className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">Vitals</h1>
            <p className="text-xs text-sidebar-foreground/50">Health Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 px-3 mt-4 space-y-1">
          {allSidebarNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 mt-auto">
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent w-full transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 pt-20 md:pt-6">
          <Outlet />
        </div>
      </main>

      <div className="safe-top fixed top-0 left-0 right-0 z-40 pointer-events-none md:hidden" />
      <MobileProfileButton user={me} />
      <MobileWatchButton />

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-30 safe-bottom">
        <div className="flex items-center justify-around py-2">
          {/* Primary nav items */}
          {primaryNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleTabPress(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 min-h-[44px] rounded-xl transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(v => !v)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 min-h-[44px] rounded-xl transition-all",
              moreOpen ? "text-primary" : "text-muted-foreground"
            )}
          >
            {moreOpen ? <X className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
            <span className="text-[10px] font-medium">More</span>
          </button>

          {/* Health Coach */}
          <button
            onClick={() => handleTabPress('/coach')}
            className={cn(
              "flex flex-col items-center gap-1 px-3 min-h-[44px] rounded-xl transition-all",
              location.pathname === '/coach' ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Sparkles className={cn("h-5 w-5", location.pathname === '/coach' && "drop-shadow-sm")} />
            <span className="text-[10px] font-medium">Coach</span>
          </button>
        </div>
      </nav>

      {/* More drawer — slides up */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-20" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute bottom-20 inset-x-0 bg-card border-t border-border px-4 py-4 space-y-1 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {moreNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}