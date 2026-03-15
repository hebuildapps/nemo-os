import React from 'react';
import { WorkspaceId } from '@/lib/nemo-data';

interface IconRailProps {
  active: WorkspaceId;
  onSwitch: (ws: WorkspaceId) => void;
}

const ITEMS: { id: WorkspaceId; ico: string; label: string }[] = [
  { id: 'calendar', ico: '🗓️', label: 'CAL' },
  { id: 'tasks', ico: '🧾', label: 'TASKS' },
  { id: 'badges', ico: '🏅', label: 'BADGES' },
  { id: 'shop', ico: '🛍️', label: 'SHOP' },
  { id: 'profile', ico: '🙂', label: 'PROFILE' },
];

const IconRail: React.FC<IconRailProps> = ({ active, onSwitch }) => (
  <nav className="w-[72px] min-w-[72px] h-full bg-background border-l border-border/70 flex flex-col items-center py-[12px] gap-[6px]
    max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:h-[56px] max-md:flex-row max-md:border-l-0 max-md:border-t max-md:py-[3px] max-md:z-50">
    {ITEMS.map(item => (
      <button
        key={item.id}
        onClick={() => onSwitch(item.id)}
        className={`w-[52px] h-[56px] flex flex-col items-center justify-center gap-[5px] cursor-pointer border transition-all
          max-md:flex-1 max-md:h-full max-md:w-auto
          ${active === item.id
            ? 'bg-[#1f1f1f] border-[#1f1f1f] text-[#f4f4f4]'
            : 'border-transparent text-muted-foreground hover:bg-surface2/80 hover:text-foreground'
          }`}
      >
        <span className="text-[15px] leading-none">{item.ico}</span>
        <span className="font-pixel text-[6px] text-center leading-none">{item.label}</span>
      </button>
    ))}
  </nav>
);

export default IconRail;
