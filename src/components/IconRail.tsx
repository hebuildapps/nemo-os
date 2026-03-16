import React from 'react';
import { WorkspaceId } from '@/lib/nemo-data';

interface IconRailProps {
  active: WorkspaceId;
  onSwitch: (ws: WorkspaceId) => void;
}

type NavItem = { id: WorkspaceId; img?: string; ico?: string; label: string };

const ITEMS: NavItem[] = [
  { id: 'calendar', img: '/cal.svg',     label: 'CAL'     },
  { id: 'tasks',    img: '/tasks.svg',   label: 'TASKS'   },
  { id: 'badges',   img: '/badges.svg',  label: 'BADGES' },
  { id: 'shop',     img: '/shop.svg',    label: 'SHOP'    },
  { id: 'profile',  img: '/profile.svg', label: 'PROFILE' },
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
            ? 'bg-[#1f1f1f] border-[#1f1f1f]'
            : 'border-transparent hover:bg-surface2/80'
          }`}
      >
        {item.img ? (
          <img
            src={item.img}
            alt={item.label}
            className={
              item.id === 'tasks' ? 'w-[16px] h-[28px] shrink-0' :
              item.id === 'profile' ? 'w-[22px] h-[32px] shrink-0' :
              'w-[22px] h-[22px] shrink-0'
            }
          />
        ) : null}
        <span
          className={`font-pixel text-[6px] text-center leading-none ${
            active === item.id ? 'text-[#f4f4f4]' : 'text-muted-foreground'
          }`}
        >
          {item.label}
        </span>
      </button>
    ))}
  </nav>
);

export default IconRail;
