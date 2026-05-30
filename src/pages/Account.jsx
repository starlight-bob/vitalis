import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { calculateStreak, evaluateBadges } from '@/lib/streakUtils';
import { calculateBioAge } from '@/lib/bioAgeUtils';
import ProfileHeader from '@/components/account/ProfileHeader';
import BadgesSection from '@/components/account/BadgesSection';
import FriendsSection from '@/components/account/FriendsSection';
import SettingsSection from '@/components/account/SettingsSection';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';

export default function Account() {
  const { t } = useLanguage();
  const [avatarUrl, setAvatarUrl] = useState(null);

  const { data: me, isLoading: meLoading, isError: meError } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    retry: 2,
  });

  const { data: rawLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['healthLogs', 'all'],
    queryFn: () => base44.entities.HealthLog.list('-date', 120),
    retry: 2,
  });

  const { data: rawLabResults, isLoading: labsLoading } = useQuery({
    queryKey: ['labResults'],
    queryFn: () => base44.entities.LabResult.list('-date', 200),
    retry: 2,
  });

  // Always safe arrays regardless of what the API returns
  const logs = Array.isArray(rawLogs) ? rawLogs : [];
  const labResults = Array.isArray(rawLabResults) ? rawLabResults : [];

  // Only treat me as valid if it has an id (not an empty object {})
  const meData = me && me.id ? me : null;
  const user = meData ? { ...meData, avatar_url: avatarUrl ?? meData.avatar_url } : null;

  const streak = calculateStreak(logs);
  const bioData = calculateBioAge(logs, 35);
  const badges = evaluateBadges(logs, labResults, bioData);

  const isLoading = meLoading || logsLoading || labsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (meError || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <span className="text-4xl">👤</span>
        <p className="text-base font-semibold text-foreground">{t('couldntLoadProfile')}</p>
        <p className="text-sm text-muted-foreground text-center max-w-xs">{t('checkConnection')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-8">
      <ProfileHeader
        user={user}
        streak={streak}
        onAvatarUpdate={setAvatarUrl}
      />

      <div className="h-px bg-border mx-4" />

      <BadgesSection badges={badges} />

      <div className="h-px bg-border mx-4" />

      <FriendsSection user={user} />

      <div className="h-px bg-border mx-4" />

      <SettingsSection user={user} />
    </div>
  );
}