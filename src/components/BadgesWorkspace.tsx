import React from 'react';
import type { Database } from '@/integrations/supabase/types';

type BadgeRow = Database['public']['Tables']['badges']['Row'];
type UserBadgeRow = Database['public']['Tables']['user_badges']['Row'];

interface BadgesWorkspaceProps {
  badges: BadgeRow[];
  userBadges: UserBadgeRow[];
}

const BadgesWorkspace: React.FC<BadgesWorkspaceProps> = ({ badges, userBadges }) => {
  const earned = new Set(userBadges.map(b => b.badge_id));

  return (
    <div>
      <div className="font-pixel text-[10px] text-foreground mb-[18px] pb-[10px] border-b-2 border-border">🏆 BADGES</div>
      <div className="grid grid-cols-3 gap-[10px] max-md:grid-cols-2">
        {badges.map(b => {
          const unlocked = earned.has(b.id);
          return (
            <div key={b.id} className={`bg-surface border-[1.5px] p-[14px] text-center ${unlocked ? 'border-coin' : 'border-border'}`}>
              <span className={`text-[26px] block mb-[6px] ${unlocked ? '' : 'grayscale opacity-25'}`}>{b.icon}</span>
              <div className="font-pixel text-[6px] mb-[4px] leading-[1.5]">{b.name}</div>
              <div className="text-[10px] text-muted-foreground leading-[1.4]">{b.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgesWorkspace;
