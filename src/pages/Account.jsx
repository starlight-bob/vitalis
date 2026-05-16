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

export default function Account() {
  const [avatarUrl, setAvatarUrl] = useState(null);

  const { data: me, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['healthLogs', 'all'],
    queryFn: () => base44.entities.HealthLog.list('-date', 120),
  });

  const { data: labResults = [] } = useQuery({
    queryKey: ['labResults'],
    queryFn: () => base44.entities.LabResult.list('-date', 200),
  });

  const user = me ? { ...me, avatar_url: avatarUrl ?? me.avatar_url } : null;
  const streak = calculateStreak(logs);
  const bioData = calculateBioAge(logs, 35);
  const badges = evaluateBadges(logs, labResults, bioData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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