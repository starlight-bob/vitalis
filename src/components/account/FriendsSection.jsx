import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trophy, Flame, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/LanguageContext';

// Mock friends data — in a real app you'd fetch friends' public stats
const MOCK_FRIENDS = [];

export default function FriendsSection({ user }) {
  const { t } = useLanguage();
  const [addOpen, setAddOpen] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}?ref=${user?.id || 'invite'}`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('friends')}</h3>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => setAddOpen(v => !v)}>
          <UserPlus className="h-3.5 w-3.5" /> {t('addFriend')}
        </Button>
      </div>

      {addOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-muted/30 border border-border rounded-xl p-4 mb-4 space-y-3"
        >
          <div className="flex gap-2">
            <Input
              placeholder={t('enterUsernameEmail')}
              value={inviteInput}
              onChange={e => setInviteInput(e.target.value)}
              className="h-8 text-sm bg-card"
            />
            <Button size="sm" className="h-8 text-xs flex-shrink-0">{t('invite')}</Button>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground mb-1.5">{t('orShareLink')}</p>
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
              <span className="text-xs text-muted-foreground flex-1 truncate">{inviteLink}</span>
              <button onClick={copyLink} className="flex-shrink-0">
                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {MOCK_FRIENDS.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 bg-muted/20 rounded-2xl border border-border">
          <span className="text-3xl mb-2">🦋</span>
          <p className="text-sm font-medium text-foreground mb-1">{t('noFriendsYet')}</p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">{t('noFriendsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {MOCK_FRIENDS.map((friend, i) => (
            <div key={friend.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
              <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground w-5">
                {i === 0 ? <Trophy className="h-3.5 w-3.5 text-yellow-400" /> : `#${i + 1}`}
              </div>
              <div className="h-9 w-9 rounded-full bg-muted overflow-hidden flex-shrink-0">
                {friend.avatar_url ? <img src={friend.avatar_url} className="h-full w-full object-cover" /> : (
                  <div className="h-full w-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                    {friend.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{friend.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Flame className="h-3 w-3 text-orange-400" />{friend.streak}d · {friend.recoveryAvg}% recovery
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}