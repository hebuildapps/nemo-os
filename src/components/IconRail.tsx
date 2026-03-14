import React from 'react';
import { WorkspaceId } from '@/lib/nemo-data';

interface IconRailProps {
  active: WorkspaceId;
  onSwitch: (ws: WorkspaceId) => void;
}

const ITEMS: { id: WorkspaceId; ico: string; label: string }[] = [
  { id: 'calendar', ico: '📅', label: 'CAL' },
  { id: 'tasks', ico: '📋', label: 'TASKS' },
  { id: 'badges', ico: '🏆', label: 'BADGES' },
  { id: 'shop', ico: '🛒', label: 'SHOP' },
  { id: 'profile', ico: '👤', label: 'PROFILE' },
];

const IconRail: React.FC<IconRailProps> = ({ active, onSwitch }) => (
  <nav className="w-[70px] min-w-[70px] bg-surface border-l-2 border-border flex flex-col items-center py-[14px] gap-[3px]
    max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:w-full max-md:h-[56px] max-md:flex-row max-md:border-l-0 max-md:border-t-2 max-md:py-[3px] max-md:z-50">
    {ITEMS.map(item => (
      <button
        key={item.id}
        onClick={() => onSwitch(item.id)}
        className={`w-[50px] h-[50px] flex flex-col items-center justify-center gap-[3px] cursor-pointer border-[1.5px] transition-all
          max-md:flex-1 max-md:h-full max-md:w-auto
          ${active === item.id
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-transparent text-muted-foreground hover:bg-surface2 hover:border-border'
          }`}
      >
        <span className="text-[18px]">{item.ico}</span>
        <span className="font-pixel text-[6px] text-center">{item.label}</span>
      </button>
    ))}
  </nav>
);

export default IconRail;
