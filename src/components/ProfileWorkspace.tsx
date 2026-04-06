import React, { useState } from 'react';
import { SignOut, Trash } from '@phosphor-icons/react';
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
  const { user, signOut, deleteAccount } = useAuth();
  const done = tasks.filter(t => t.completed).length;
  const gems = Number(((profile as Profile & { gems?: number }).gems ?? profile.coins ?? 0));
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const copyRef = () => {
    navigator.clipboard.writeText(profile.referral_code).catch(() => { });
  };

  // SVGs for actions
  const actionSvgs = ['/cal.svg', '/tasks.svg', '/shop.svg', '/badges.svg', '/profile.svg', '/placeholder.svg'];
  const getRandomSvg = (idx: number) => actionSvgs[idx % actionSvgs.length];

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('This permanently deletes your account and all progress. This cannot be undone. Continue?');
    if (!confirmed) return;

    setDeleteError('');
    setDeleting(true);
    const { error } = await deleteAccount();
    if (error) {
      setDeleteError(error);
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="font-pixel text-[10px] bg-[#152337] text-[#f9d362] p-2 mb-[18px] pb-[10px] border-b-2 border-border flex items-center gap-2">
        <img src="/profile.svg" alt="profile" className="w-[22px] h-[32px]" /> PROFILE
      </div>

      <div className="bg-surface border-[1.5px] border-border p-[18px] mb-[14px]">
        <div className="font-pixel text-[7px] text-muted-foreground mb-[14px] pb-[7px] border-b border-border">MISSION STATUS</div>
        {([
          ['Name', profile.name],
          ['Logged In Email', user?.email ?? '-'],
          ['Target Role', profile.target_role],
          ['Placement Date', profile.placement_date],
          ['Hours / Day', `${profile.hours_per_day} hrs/day`],
          ['Current Stage', profile.current_stage],
          ['Tasks Completed', String(done)],
          ['Gems', String(gems)],
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
        <div className="text-[11px] text-muted-foreground mb-[9px]">Share your code. Each referral = +50 gems.</div>
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
        {deleteError && (
          <div className="font-pixel text-[7px] text-nemo-red mb-[10px] p-2 border border-nemo-red bg-nemo-red/5">{deleteError}</div>
        )}
        <button className="font-pixel text-[7px] p-[9px_14px] bg-transparent border-2 border-border text-muted-foreground cursor-pointer transition-all hover:border-primary hover:text-primary w-full text-center mt-[7px] flex items-center gap-2">
          <img src="/cal.svg" alt="action" className="w-[16px] h-[16px]" /> ADAPTIVE REPLAN <span className="opacity-50">[COMING SOON]</span>
        </button>
        <button
          onClick={onReset}
          className="font-pixel text-[7px] p-[9px_14px] bg-transparent border-2 border-nemo-red text-nemo-red cursor-pointer transition-all hover:opacity-80 w-full text-center mt-[7px] flex items-center gap-2"
        >
          <img src="badges/fire.svg" alt="action" className="w-[16px] h-[16px]" /> RESET PLAN & PROGRESS
        </button>
        <button
          onClick={signOut}
          className="font-pixel text-[7px] p-[9px_14px] bg-transparent border-2 border-border text-muted-foreground cursor-pointer transition-all hover:border-primary hover:text-primary w-full text-center mt-[7px] flex items-center gap-2"
        >
          <SignOut size={16} /> LOG OUT
        </button>
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="font-pixel text-[7px] p-[9px_14px] bg-transparent border-2 border-nemo-red text-nemo-red cursor-pointer transition-all hover:opacity-80 disabled:opacity-50 w-full text-center mt-[7px] flex items-center gap-2"
        >
          <Trash size={16} /> {deleting ? 'DELETING ACCOUNT...' : 'DELETE ACCOUNT'}
        </button>
      </div>
    </div>
  );
};

export default ProfileWorkspace;
