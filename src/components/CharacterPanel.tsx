import React, { useEffect, useState } from 'react';
import { TIERS } from '@/lib/nemo-data';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];

interface CharacterPanelProps {
  profile: Profile;
  tasks: TaskRow[];
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({ profile, tasks }) => {
  const today = new Date().toISOString().split('T')[0];
  const start = new Date(profile.created_at); start.setHours(0, 0, 0, 0);
  const end = new Date(profile.placement_date); end.setHours(0, 0, 0, 0);
  const now = new Date(today); now.setHours(0, 0, 0, 0);
  const total = Math.max(1, Math.round((end.getTime() - start.getTime()) / 864e5));
  const elapsed = Math.max(0, Math.round((now.getTime() - start.getTime()) / 864e5));
  const progressPct = Math.min(100, Math.round((elapsed / total) * 100));

  const done = tasks.filter(t => t.completed).length;
  const totalTaskCount = tasks.length;
  const completedTaskCount = done;
  const taskCompletionPct = totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;
  const mood = taskCompletionPct <= 25 ? 'sad' : taskCompletionPct <= 75 ? 'neutral' : 'happy';
  const gender = profile.gender?.toLowerCase() === 'girl' ? 'girl' : 'boy';
  const characterSrc = `/${gender}_${mood}.png`;

  const [displaySrc, setDisplaySrc] = useState(characterSrc);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (characterSrc === displaySrc) return;
    setIsVisible(false);
    const timer = window.setTimeout(() => {
      setDisplaySrc(characterSrc);
      setIsVisible(true);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [characterSrc, displaySrc]);

  const stoneThresh = [5, 15, 30, 50];
  const tierIdx = Math.min(TIERS.length - 1, Math.floor(done / 10));

  return (
    <aside className="w-[260px] min-w-[260px] h-full bg-background border-r border-border/70 flex flex-col items-center justify-center px-[18px] py-[20px] gap-[12px] overflow-y-auto">
      <div className="font-pixel text-[7px] text-muted-foreground/80 text-center tabular-nums">
        {elapsed} / {total} days
      </div>

      <div className="w-full px-[6px] flex items-center justify-center">
        <div className="relative w-full h-[9px] bg-surface2 border border-border/70">
          <span className="absolute -left-[12px] font-pixel text-[9px] -top-[2px] text-foreground">[</span>
          <span className="absolute -right-[12px] font-pixel text-[9px] -top-[2px] text-foreground">]</span>
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="my-[8px] py-[10px] flex items-center justify-center">
        <img
          src={displaySrc}
          alt={`${gender} character ${mood}`}
          className="w-[110px] h-[126px]"
          style={{
            transition: 'opacity 0.4s ease',
            opacity: isVisible ? 1 : 0,
            imageRendering: 'pixelated',
          }}
        />
      </div>

      <div className="text-[11px] text-muted-foreground/70 text-center leading-[1.8] italic">
        {profile.name} is prepping.
      </div>

      {/* Stones (Phase 2) */}
      <div className="flex gap-[6px] justify-center mt-[2px]">
        {stoneThresh.map((th, i) => {
          let cls = 'w-[16px] h-[16px] border transition-all';
          if (done >= th) cls += ' bg-coin/80 border-coin/70';
          else if (done >= th * 0.5) cls += ' bg-coin/40 border-coin/45';
          else cls += ' bg-border/70 border-border/80';
          return <div key={i} className={cls} />;
        })}
      </div>

      <div className="font-pixel text-[6px] px-[8px] py-[3px] border border-border/70 text-muted-foreground/80 bg-transparent">
        {TIERS[tierIdx]}
      </div>

      <div className="font-pixel text-[6px] text-muted-foreground/75 tabular-nums mt-[2px]">
        {profile.coins} gems
      </div>
    </aside>
  );
};

export default CharacterPanel;
