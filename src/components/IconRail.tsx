import React from 'react';
import { WorkspaceId } from '@/lib/nemo-data';
import { NemoMascot } from '@/components/NemoMascot';

interface IconRailProps {
  active: WorkspaceId;
  onSwitch: (ws: WorkspaceId) => void;
}

type NavItem = { id: WorkspaceId; img?: string; label: string };

const ITEMS: NavItem[] = [
  { id: 'calendar', img: '/cal.svg',     label: 'Calendar'  },
  { id: 'tasks',    img: '/tasks.svg',   label: 'Tasks'    },
  { id: 'badges',   img: '/badges.svg',  label: 'Badges'   },
  { id: 'shop',     img: '/shop.svg',    label: 'Shop'     },
  { id: 'profile',  img: '/profile.svg', label: 'Profile'  },
];

const IconRail: React.FC<IconRailProps> = ({ active, onSwitch }) => (
  <nav
    className="w-[72px] min-w-[72px] h-full bg-background border-l border-border/70 flex flex-col items-center py-[12px] gap-[6px]
      max-md:fixed max-md:bottom-4 max-md:left-4 max-md:right-4 max-md:w-auto max-md:h-auto max-md:min-w-0
      max-md:flex-row max-md:items-stretch max-md:justify-center max-md:gap-0 max-md:border-l-0
      max-md:rounded-3xl max-md:border max-md:border-white/30 max-md:dark:border-white/[0.08]
      max-md:bg-white/70 max-md:dark:bg-[#1c1c1e]/80
      max-md:backdrop-blur-xl max-md:backdrop-saturate-150
      max-md:shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.5)]
      max-md:dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]
      max-md:px-1 max-md:py-1.5 max-md:z-50"
  >
    {ITEMS.map(item => {
      const isActive = active === item.id;

      return (
        <button
          key={item.id}
          onClick={() => onSwitch(item.id)}
          className={`relative flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ease-out
            max-md:flex-1 max-md:px-1 max-md:py-1.5
            group
            ${
              isActive
                ? 'md:bg-[#1f1f1f] md:border-[#1f1f1f] md:border md:w-[52px] md:h-[56px] md:gap-[5px] md:rounded-none'
                : 'md:border-transparent md:border md:w-[52px] md:h-[56px] md:gap-[5px] md:hover:bg-surface2/80 md:rounded-none'
            }`}
          aria-current={isActive ? 'page' : undefined}
        >
          {/* Active card on mobile */}
          {isActive && (
            <span className="hidden max-md:block absolute inset-1 rounded-2xl bg-[#1c1c1e] dark:bg-[#2c2c2e] shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
              <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-white/30 dark:bg-white/20" />
            </span>
          )}

          {/* Icon */}
          <span className={`relative z-10 flex items-center justify-center transition-transform duration-200 ease-out ${isActive ? 'max-md:scale-105' : 'max-md:group-active:scale-95'}`}>
            {item.id === 'profile' ? (
              <NemoMascot className={`shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-50 max-md:group-hover:opacity-75'} md:w-[22px] md:h-[32px] max-md:w-[20px] max-md:h-[30px]`} />
            ) : (
              <img
                src={item.img}
                alt=""
                className={`shrink-0 transition-all duration-200
                  ${isActive ? 'opacity-100 brightness-0 invert max-md:invert max-md:brightness-100' : 'opacity-40 max-md:group-hover:opacity-65 dark:invert dark:opacity-50 dark:max-md:group-hover:opacity-75'}
                  ${item.id === 'tasks' ? 'md:w-[16px] md:h-[28px] max-md:w-[18px] max-md:h-[28px]' : 'md:w-[22px] md:h-[22px] max-md:w-[20px] max-md:h-[20px]'}
                `}
              />
            )}
          </span>

          {/* Label */}
          <span
            className={`relative z-10 font-pixel tracking-[0.12em] text-center leading-none transition-all duration-200
              ${
                isActive
                  ? 'md:text-[6px] md:text-[#f4f4f4] max-md:text-[9px] max-md:text-white max-md:font-medium'
                  : 'md:text-[6px] md:text-muted-foreground max-md:text-[8px] max-md:text-[#8e8e93] max-md:dark:text-[#636366] max-md:group-hover:text-[#636366]'
              }`}
          >
            {item.label}
          </span>
        </button>
      );
    })}
  </nav>
);

export default IconRail;
