import React from 'react';
import { BADGE_DEFS, Task, User } from '@/lib/nemo-data';

interface BadgesWorkspaceProps {
  tasks: Task[];
  user: User;
  userBadges: Set<string>;
  userItems: Set<string>;
}

const BadgesWorkspace: React.FC<BadgesWorkspaceProps> = ({ tasks, user, userBadges, userItems }) => (
  <div>
    <div className="font-pixel text-[10px] text-foreground mb-[18px] pb-[10px] border-b-2 border-border">
      🏆 BADGES
    </div>
    <div className="grid grid-cols-3 gap-[10px] max-md:grid-cols-2">
      {BADGE_DEFS.map(b => {
        const unlocked = userBadges.has(b.id);
        return (
          <div key={b.id} className={`bg-surface border-[1.5px] p-[14px] text-center ${unlocked ? 'border-coin' : 'border-border'}`}>
            <span className={`text-[26px] block mb-[6px] ${unlocked ? '' : 'grayscale opacity-25'}`}>{b.ico}</span>
            <div className="font-pixel text-[6px] mb-[4px] leading-[1.5]">{b.name}</div>
            <div className="text-[10px] text-muted-foreground leading-[1.4]">{b.desc}</div>
          </div>
        );
      })}
    </div>
  </div>
);

export default BadgesWorkspace;
