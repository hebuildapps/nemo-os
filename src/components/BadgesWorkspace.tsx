import React from 'react';
import type { Database } from '@/integrations/supabase/types';

type BadgeRow = Database['public']['Tables']['badges']['Row'];
type UserBadgeRow = Database['public']['Tables']['user_badges']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type UserItemRow = Database['public']['Tables']['user_items']['Row'];

interface BadgesWorkspaceProps {
  badges: BadgeRow[];
  userBadges: UserBadgeRow[];
  profile: Profile;
  tasks: TaskRow[];
  userItems: UserItemRow[];
}

interface BadgeProgress {
  current: number;
  target: number;
}

const currencyWordToGems = (text: string) =>
  text
    .replace(/\bCOINS\b/g, 'GEMS')
    .replace(/\bCOIN\b/g, 'GEM')
    .replace(/\bcoins\b/g, 'gems')
    .replace(/\bcoin\b/g, 'gem');

const completedTaskCount = (tasks: TaskRow[]) => tasks.filter(t => t.completed).length;

const stageProgress = (tasks: TaskRow[], stage: string): BadgeProgress => {
  const stageTasks = tasks.filter(t => t.stage === stage && !t.is_break);
  const target = Math.max(stageTasks.length, 1);
  const current = Math.min(stageTasks.filter(t => t.completed).length, target);
  return { current, target };
};

const getBadgeProgress = (
  badgeId: string,
  tasks: TaskRow[],
  profile: Profile,
  userItems: UserItemRow[],
): BadgeProgress => {
  const done = completedTaskCount(tasks);

  switch (badgeId) {
    case 'first_task':
      return { current: Math.min(done, 1), target: 1 };
    case 'tasks10':
      return { current: Math.min(done, 10), target: 10 };
    case 'tasks50':
      return { current: Math.min(done, 50), target: 50 };
    case 'streak5':
      return { current: Math.min(profile.streak, 5), target: 5 };
    case 'streak30':
      return { current: Math.min(profile.streak, 30), target: 30 };
    case 'stage_foundations':
      return stageProgress(tasks, 'Foundations');
    case 'stage_coredsa':
      return stageProgress(tasks, 'Core DSA');
    case 'coins100':
      return { current: Math.min(Number(profile.coins ?? 0), 100), target: 100 };
    case 'shopper':
      return { current: Math.min(userItems.length, 1), target: 1 };
    case 'coins_earned_200':
      return { current: Math.min(Number(profile.total_earned ?? 0), 200), target: 200 };
    default:
      return { current: 0, target: 1 };
  }
};

const BadgesWorkspace: React.FC<BadgesWorkspaceProps> = ({ badges, userBadges, profile, tasks, userItems }) => {
  const earned = new Set(userBadges.map(b => b.badge_id));
  // List of SVGs from public folder
  const badgeSvgs = [
    '/cal.svg', '/tasks.svg', '/shop.svg','/badges.svg', '/profile.svg', '/placeholder.svg'
  ];
  // Helper to pick random SVG for each badge
  const getRandomSvg = (idx: number) => badgeSvgs[idx % badgeSvgs.length];

  return (
    <div>
      <div className="font-pixel text-[10px] bg-[#152337] text-[#f9d362] mb-[18px] pb-[10px] border-b-2 border-border flex items-center p-2 gap-2">
        <img src="/badges.svg" alt="badges" className="w-[22px] h-[22px]" /> BADGES
      </div>
      <div className="space-y-[10px]">
        {badges.map((b, idx) => {
          const unlocked = earned.has(b.id);
          const progress = getBadgeProgress(b.id, tasks, profile, userItems);
          const pct = unlocked ? 100 : Math.round((progress.current / progress.target) * 100);

          return (
            <div key={b.id} className={`bg-surface border-[1.5px] p-[14px] ${unlocked ? 'border-coin' : 'border-border'}`}>
              <div className="flex gap-[12px] items-start">
                <img
                  src={getRandomSvg(idx)}
                  alt="badge icon"
                  className={`w-[28px] h-[28px] ${unlocked ? '' : 'grayscale opacity-35'}`}
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-[8px] mb-[4px]">
                    <div className="font-pixel text-[6px] leading-[1.5]">{currencyWordToGems(b.name)}</div>
                    <span className="font-pixel text-[6px] text-muted-foreground">{unlocked ? 'UNLOCKED' : 'PROGRESS'}</span>
                  </div>

                  <div className="text-[10px] text-muted-foreground leading-[1.4]">{currencyWordToGems(b.description)}</div>

                  <div className="mt-[8px]">
                    <div className="h-[8px] w-full bg-muted overflow-hidden rounded-full">
                      <div
                        className={`h-full transition-all duration-500 ${unlocked ? 'bg-nemo-green' : 'bg-foreground'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-[4px] tabular-nums">
                      {unlocked ? 'Completed' : `${progress.current} / ${progress.target}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgesWorkspace;
