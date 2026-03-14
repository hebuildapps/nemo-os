import React from 'react';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

type Profile = Database['public']['Tables']['profiles']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];

interface ProfileWorkspaceProps {
  profile: Profile;
  tasks: TaskRow[];
  onReset: () => void;
}

const ProfileWorkspace: React.FC<ProfileWorkspaceProps> = ({ profile, tasks, onReset }) => {
  const { signOut } = useAuth();
  const done = tasks.filter(t => t.completed).length;

  const copyRef = () => {
    navigator.clipboard.writeText(profile.referral_code).catch(() => {});
  };

  return (
    <div>
      <div className="font-pixel text-[10px] text-foreground mb-[18px] pb-[10px] border-b-2 border-border">👤 PROFILE</div>

      <div className="bg-surface border-[1.5px] border-border p-[18px] mb-[14px]">
        <div className="font-pixel text-[7px] text-muted-foreground mb-[14px] pb-[7px] border-b border-border">MISSION STATUS</div>
        {([
          ['Name', profile.name],
          ['Target Role', profile.target_role],
          ['Placement Date', profile.placement_date],
          ['Hours / Day', `${profile.hours_per_day} hrs/day`],
          ['Current Stage', profile.current_stage],
          ['Tasks Completed', String(done)],
          ['Coins', String(profile.coins)],
          ['Streak', `${profile.streak} days`],
        ] as [string, string][]).map(([k, v]) => (
          <div key={k} className="flex justify-between py-[7px] border-b border-surface2 text-[12px]">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-pixel text-[7px] text-foreground">{v}</span>
          </div>
        ))}
      </div>

      <div className="bg-surface border-[1.5px] border-border p-[18px] mb-[14px]">
        <div className="font-pixel text-[7px] text-muted-foreground mb-[14px] pb-[7px] border-b border-border">REFERRAL</div>
        <div className="text-[11px] text-muted-foreground mb-[9px]">Share your code. Each referral = +50 coins.</div>
        <div
          onClick={copyRef}
          className="font-pixel text-[10px] bg-surface2 border-[1.5px] border-border p-[10px_14px] tracking-[2px] text-center text-primary cursor-pointer hover:border-primary transition-colors"
        >
          {profile.referral_code}
        </div>
        <div className="text-[9px] text-muted-foreground mt-[5px] text-center">click to copy</div>
      </div>

      <div className="bg-surface border-[1.5px] border-border p-[18px]">
        <div className="font-pixel text-[7px] text-muted-foreground mb-[14px] pb-[7px] border-b border-border">ACTIONS</div>
        <button className="font-pixel text-[7px] p-[9px_14px] bg-transparent border-2 border-border text-muted-foreground cursor-pointer transition-all hover:border-primary hover:text-primary block w-full text-center mt-[7px]">
          🔄 ADAPTIVE REPLAN <span className="opacity-50">[COMING SOON]</span>
        </button>
        <button
          onClick={onReset}
          className="font-pixel text-[7px] p-[9px_14px] bg-transparent border-2 border-nemo-red text-nemo-red cursor-pointer transition-all hover:opacity-80 block w-full text-center mt-[7px]"
        >
          ⚠ RESET PLAN & PROGRESS
        </button>
        <button
          onClick={signOut}
          className="font-pixel text-[7px] p-[9px_14px] bg-transparent border-2 border-border text-muted-foreground cursor-pointer transition-all hover:border-primary hover:text-primary block w-full text-center mt-[7px]"
        >
          🚪 SIGN OUT
        </button>
      </div>
    </div>
  );
};

export default ProfileWorkspace;
