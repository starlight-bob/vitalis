import { useState, useEffect } from 'react';
import { ChevronRight, Bell, Ruler, Plug, Shield, HelpCircle, LogOut, Zap, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PLAN_BADGE = {
  Free: { label: 'Free', cls: 'text-muted-foreground' },
  Pro: { label: 'Pro', cls: 'text-primary' },
  Elite: { label: 'Elite', cls: 'text-yellow-400' }
};

export default function SettingsSection({ user, onUpdate }) {
  const [units, setUnits] = useState('Metric');
  const [notifications, setNotifications] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  // Sync from user once it loads (handles real iOS where user arrives after mount)
  useEffect(() => {
    if (user?.units) setUnits(user.units);
    if (user?.notifications_enabled != null) setNotifications(user.notifications_enabled);
  }, [user?.units, user?.notifications_enabled]);

  const plan = user?.plan || 'Free';

  const toggleUnits = async () => {
    const next = units === 'Metric' ? 'Imperial' : 'Metric';
    setUnits(next);
    await base44.auth.updateMe({ units: next });
    queryClient.invalidateQueries({ queryKey: ['me'] });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await base44.functions.invoke('deleteAccount', {});
    base44.auth.logout();
  };

  const toggleNotif = async () => {
    const next = !notifications;
    setNotifications(next);
    await base44.auth.updateMe({ notifications_enabled: next });
  };

  const Row = ({ icon: RowIcon, label, right, onClick, linkTo, danger }) => {
    const Icon = RowIcon;
    const content =
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${danger ? 'hover:bg-destructive/10' : 'hover:bg-muted/50'}`}>
      
        <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${danger ? 'text-destructive' : 'text-muted-foreground'}`} />
        <span className={`flex-1 text-sm font-medium ${danger ? 'text-destructive' : 'text-foreground'}`}>{label}</span>
        <span className="text-xs text-muted-foreground">{right}</span>
        {!right && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>;

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
          {plan === 'Free' &&
          <button className="ml-2 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              Upgrade
            </button>
          }
        </div>

        {/* Notifications */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Bell className="h-4.5 w-4.5 text-muted-foreground flex-shrink-0" />
          <span className="flex-1 text-sm font-medium text-foreground">Notifications</span>
          <button
            onClick={toggleNotif}
            className={`relative h-5 w-9 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-muted'}`}>
            
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${notifications ? 'translate-x-(-1)' : 'translate-x-0.5'}`} />
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
          onClick={() => base44.auth.logout()} />
        
      </div>

      {/* Danger zone */}
      <div>
        <div className="bg-card border border-destructive/30 rounded-2xl overflow-hidden">
          <Row
            icon={Trash2}
            label="Delete Account"
            danger
            onClick={() => setShowDeleteDialog(true)}
          />
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all associated data — including health logs, lab results, journal entries, and device connections. <strong>This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteAccount}
            >
              {isDeleting ? 'Deleting…' : 'Delete My Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);

}