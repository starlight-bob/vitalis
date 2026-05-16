import { useState } from 'react';
import { ChevronRight, Bell, Ruler, Plug, Shield, HelpCircle, LogOut, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const PLAN_BADGE = {
  Free: { label: 'Free', cls: 'text-muted-foreground' },
  Pro: { label: 'Pro', cls: 'text-primary' },
  Elite: { label: 'Elite', cls: 'text-yellow-400' },
};

export default function SettingsSection({ user, onUpdate }) {
  const [units, setUnits] = useState(user?.units || 'Metric');
  const [notifications, setNotifications] = useState(user?.notifications_enabled ?? true);
  const queryClient = useQueryClient();

  const plan = user?.plan || 'Free';

  const toggleUnits = async () => {
    const next = units === 'Metric' ? 'Imperial' : 'Metric';
    setUnits(next);
    await base44.auth.updateMe({ units: next });
    queryClient.invalidateQueries({ queryKey: ['me'] });
  };

  const toggleNotif = async () => {
    const next = !notifications;
    setNotifications(next);
    await base44.auth.updateMe({ notifications_enabled: next });
  };

  const Row = ({ icon: RowIcon, label, right, onClick, linkTo, danger }) => {
    const Icon = RowIcon;
    const content = (
      <div
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${danger ? 'hover:bg-destructive/10' : 'hover:bg-muted/50'}`}
      >
        <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${danger ? 'text-destructive' : 'text-muted-foreground'}`} />
        <span className={`flex-1 text-sm font-medium ${danger ? 'text-destructive' : 'text-foreground'}`}>{label}</span>
        <span className="text-xs text-muted-foreground">{right}</span>
        {!right && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    );
    if (linkTo) return <Link to={linkTo}>{content}</Link>;
    return content;
  };

  return (
    <div className="px-4 space-y-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Settings</h3>

      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {/* Plan */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Zap className="h-4.5 w-4.5 text-muted-foreground flex-shrink-0" />
          <span className="flex-1 text-sm font-medium text-foreground">Current Plan</span>
          <span className={`text-xs font-bold ${PLAN_BADGE[plan].cls}`}>{plan}</span>
          {plan === 'Free' && (
            <button className="ml-2 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              Upgrade
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Bell className="h-4.5 w-4.5 text-muted-foreground flex-shrink-0" />
          <span className="flex-1 text-sm font-medium text-foreground">Notifications</span>
          <button
            onClick={toggleNotif}
            className={`relative h-5 w-9 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-muted'}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${notifications ? 'translate-x-2.5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Units */}
        <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-muted/50" onClick={toggleUnits}>
          <Ruler className="h-4.5 w-4.5 text-muted-foreground flex-shrink-0" />
          <span className="flex-1 text-sm font-medium text-foreground">Units</span>
          <span className="text-xs text-muted-foreground">{units}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Connected Devices */}
        <Row icon={Plug} label="Connected Devices" linkTo="/devices" />

        {/* Privacy */}
        <Row icon={Shield} label="Privacy Settings" onClick={() => {}} />

        {/* Help */}
        <Row icon={HelpCircle} label="Help & Support" onClick={() => {}} />
      </div>

      {/* Sign out */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <Row
          icon={LogOut}
          label="Sign Out"
          danger
          onClick={() => base44.auth.logout()}
        />
      </div>
    </div>
  );
}