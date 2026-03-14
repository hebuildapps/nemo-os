import React from 'react';
import { User, Task, TIERS, fmt } from '@/lib/nemo-data';
import PixelCharacter from './PixelCharacter';

interface CharacterPanelProps {
  user: User;
  tasks: Task[];
  equippedItem: string | null;
}

const CharacterPanel: React.FC<CharacterPanelProps> = ({ user, tasks, equippedItem }) => {
  const today = fmt(new Date());
  const start = new Date(user.createdAt); start.setHours(0, 0, 0, 0);
  const end = new Date(user.placementDate); end.setHours(0, 0, 0, 0);
  const now = new Date(today); now.setHours(0, 0, 0, 0);
  const total = Math.max(1, Math.round((end.getTime() - start.getTime()) / 864e5));
  const elapsed = Math.max(0, Math.round((now.getTime() - start.getTime()) / 864e5));
  const progressPct = Math.min(100, Math.round((elapsed / total) * 100));

  const done = tasks.filter(t => t.completed).length;
  const todayTask = tasks.find(t => t.date === today && !t.isBreak);
  const curStage = todayTask ? todayTask.stage : user.currentStage;

  const stoneThresh = [5, 15, 30, 50];
  const tierIdx = Math.min(TIERS.length - 1, Math.floor(done / 10));

  return (
    <aside className="w-[260px] min-w-[260px] bg-surface border-r-2 border-border flex flex-col items-center py-[18px] px-[14px] gap-[10px] overflow-y-auto">
      {/* Progress counter */}
      <div className="font-pixel text-[8px] text-muted-foreground text-center tabular-nums">
        {elapsed} / {total} days
      </div>

      {/* Progress bar */}
      <div className="w-full px-[10px] flex items-center justify-center">
        <div className="relative w-[calc(100%-20px)] h-[11px] bg-surface2 border-[1.5px] border-border">
          <span className="absolute -left-[14px] font-pixel text-[10px] -top-[2px] text-foreground">[</span>
          <span className="absolute -right-[14px] font-pixel text-[10px] -top-[2px] text-foreground">]</span>
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Streak star */}
      <div className={`text-[20px] transition-all ${user.streak >= 5 ? 'opacity-100' : 'opacity-20'}`}>
        ★
      </div>

      {/* Character */}
      <PixelCharacter
        showHat={equippedItem === 'hat'}
        showGlasses={equippedItem === 'glasses'}
      />

      {/* Name */}
      <div className="font-pixel text-[7px] text-muted-foreground text-center leading-[1.6]">
        {user.name} IS PREPPING.
      </div>

      {/* Stones */}
      <div className="flex gap-2 justify-center">
        {stoneThresh.map((th, i) => {
          let cls = 'w-[22px] h-[22px] border-2 transition-all';
          if (done >= th) cls += ' bg-coin border-coin shadow-[0_0_6px_rgba(201,147,58,0.5)]';
          else if (done >= th * 0.5) cls += ' bg-coin/50 border-coin/60';
          else cls += ' bg-border border-border';
          return <div key={i} className={cls} />;
        })}
      </div>

      {/* Tier */}
      <div className="font-pixel text-[7px] px-[10px] py-[3px] border border-border text-muted-foreground bg-surface2">
        {TIERS[tierIdx]}
      </div>

      {/* Coins */}
      <div className="flex items-center gap-[6px] w-full px-3 py-2 bg-[#fdf8ed] border-2 border-coin font-pixel text-[9px] text-coin justify-center">
        <span>🪙</span>
        <span className="tabular-nums">{user.coins}</span>
        <span>COINS</span>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-[6px] text-[11px] text-muted-foreground">
        <span>🔥</span>
        <span className="font-pixel text-[8px] tabular-nums">{user.streak}</span>
        <span className="text-[10px]">day streak</span>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center w-full px-[10px] py-[5px] bg-surface2 border border-border text-[11px]">
        <span className="text-muted-foreground text-[10px]">STAGE</span>
        <span className="font-pixel text-[7px] text-foreground">{curStage.split(' ')[0].toUpperCase().substring(0, 6)}</span>
      </div>
      <div className="flex justify-between items-center w-full px-[10px] py-[5px] bg-surface2 border border-border text-[11px]">
        <span className="text-muted-foreground text-[10px]">ROLE</span>
        <span className="font-pixel text-[6px] text-foreground">{user.targetRole.toUpperCase().substring(0, 10)}</span>
      </div>
      <div className="flex justify-between items-center w-full px-[10px] py-[5px] bg-surface2 border border-border text-[11px]">
        <span className="text-muted-foreground text-[10px]">TASKS DONE</span>
        <span className="font-pixel text-[7px] text-foreground tabular-nums">{done}</span>
      </div>
    </aside>
  );
};

export default CharacterPanel;
