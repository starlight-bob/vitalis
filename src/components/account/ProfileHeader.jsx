import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';

const PLAN_COLORS = {
  Free: 'bg-muted text-muted-foreground',
  Pro: 'bg-primary/10 text-primary border border-primary/20',
  Elite: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
};

export default function ProfileHeader({ user, streak, onAvatarUpdate }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const { t, lang } = useLanguage();

  const memberSince = user?.created_date
    ? new Date(user.created_date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', year: 'numeric' })
    : t('restartStreak');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ avatar_url: file_url });
    onAvatarUpdate(file_url);
    setUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center pt-8 pb-6"
    >
      {/* Avatar */}
      <div className="relative mb-4">
        <div className="h-24 w-24 rounded-full bg-muted border-2 border-border overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
              {((user?.full_name || user?.email || '?')[0] || '?').toUpperCase()}
            </div>
          )}
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" /> : <Camera className="h-3.5 w-3.5 text-white" />}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Name & username */}
      <h2 className="text-xl font-bold text-foreground">{user?.full_name || 'Your Name'}</h2>
      <p className="text-sm text-muted-foreground mb-2">
        {user?.username ? `@${user.username}` : user?.email}
      </p>

      {/* Plan badge */}
      <span className={`text-xs font-semibold px-3 py-1 rounded-full mb-3 ${PLAN_COLORS[user?.plan || 'Free']}`}>
        {user?.plan || 'Free'} {t('member')}
      </span>

      {/* Member since */}
      <p className="text-xs text-muted-foreground mb-4">{t('memberSince')} {memberSince}</p>

      {/* Streak */}
      <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border ${
        streak > 0 ? 'border-orange-500/30 bg-orange-500/10' : 'border-border bg-muted/30'
      }`}>
        <span className="text-2xl">🔥</span>
        {streak > 0 ? (
          <div>
            <p className="text-lg font-black text-orange-400 leading-none">{streak} {t('dayStreak')}</p>
            <p className="text-[11px] text-orange-400/70">{t('keepItUp')}</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-bold text-muted-foreground">{t('noActiveStreak')}</p>
            <p className="text-[11px] text-muted-foreground">{t('restartStreak')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}