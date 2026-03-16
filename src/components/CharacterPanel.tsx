import React, { useEffect, useMemo, useState } from 'react';
import { TIERS } from '@/lib/nemo-data';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];

interface CharacterPanelProps {
  profile: Profile;
  tasks: TaskRow[];
}

const MS_PER_DAY = 864e5;

const toLocalIsoDate = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
};

const parseDateOnly = (value: string) => {
  const [year, month, day] = value.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
};

const dayDiff = (from: Date, to: Date) => Math.floor((from.getTime() - to.getTime()) / MS_PER_DAY);

const compactGems = (value: number) => {
  if (value >= 1_000_000) {
    const million = value / 1_000_000;
    const rounded = million >= 10 ? Math.round(million) : Math.round(million * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded}m`;
  }

  if (value >= 1_000) {
    const thousand = value / 1_000;
    const rounded = thousand >= 10 ? Math.round(thousand) : Math.round(thousand * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded}k`;
  }

  return `${value}`;
};

const companionImageCandidates = (itemId: string) => [
  `/${itemId}_display.png`,
  `/shop-items/${itemId}_display.png`,
  `/${itemId}.png`,
  `/shop-items/${itemId}.png`,
];

const CharacterPanel: React.FC<CharacterPanelProps> = ({ profile, tasks }) => {
  const today = toLocalIsoDate(new Date());
  const todayUtc = new Date().toISOString().split('T')[0];
  const start = parseDateOnly(profile.created_at);
  const end = parseDateOnly(profile.placement_date);
  const now = parseDateOnly(today);
  const total = Math.max(1, dayDiff(end, start));
  const elapsed = Math.max(0, Math.min(total, dayDiff(now, start)));
  const progressPct = Math.min(100, Math.round((elapsed / total) * 100));

  const done = tasks.filter(t => t.completed).length;
  const completedToday = tasks.filter(t => t.completed && (t.date === today || t.date === todayUtc)).length;
  const totalTaskCount = tasks.length;
  const completedTaskCount = done;
  const taskCompletionPct = totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;
  const mood = taskCompletionPct <= 25 ? 'sad' : taskCompletionPct <= 75 ? 'neutral' : 'happy';
  const gender = profile.gender?.toLowerCase() === 'girl' ? 'girl' : 'boy';
  const characterSrc = `/${gender}_${mood}.png`;
  const equippedImageCandidates = profile.equipped_item ? companionImageCandidates(profile.equipped_item) : [];

  const [displaySrc, setDisplaySrc] = useState(characterSrc);
  const [isVisible, setIsVisible] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (characterSrc === displaySrc) return;
    setIsVisible(false);
    const timer = window.setTimeout(() => {
      setDisplaySrc(characterSrc);
      setIsVisible(true);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [characterSrc, displaySrc]);

  const characterBackdropStyle = useMemo<React.CSSProperties>(() => {
    if (completedToday > 7) {
      return {
        background: 'linear-gradient(90deg, #ff4f6d 0%, #ffb347 25%, #fff275 45%, #62d9a0 65%, #5ec2ff 85%, #c28fff 100%)',
        opacity: 0.95,
        boxShadow: '0 0 0 1px rgba(255,255,255,0.25), 0 10px 22px rgba(0,0,0,0.28)',
      };
    }
    if (completedToday >= 2) {
      return { background: '#D4AF37', opacity: 0.86, boxShadow: '0 0 0 1px rgba(127,95,31,0.8), 0 8px 20px rgba(212,175,55,0.3)' };
    }
    if (completedToday === 1) {
      return { background: '#C0C0C0', opacity: 0.82, boxShadow: '0 0 0 1px rgba(120,120,120,0.7), 0 8px 20px rgba(192,192,192,0.28)' };
    }
    return { background: '#9a9a9a', opacity: 0.22, boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' };
  }, [completedToday]);

  const stoneThresh = [5, 15, 30, 50];
  const tierIdx = Math.min(TIERS.length - 1, Math.floor(done / 10));

  return (
    <aside className="relative w-[260px] min-w-[260px] h-full bg-background border-r border-border/70 flex flex-col items-center justify-center px-[18px] py-[20px] gap-[12px] overflow-hidden">
      <div className={`w-full flex flex-col items-center gap-[12px] transition-opacity duration-200 ${showGuide ? 'opacity-70' : 'opacity-100'}`}>
        <div className="flex items-center justify-center gap-[6px]">
          <div className="font-pixel text-[7px] text-muted-foreground/80 text-center tabular-nums">
            {elapsed} / {total} days
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="font-pixel text-[7px] w-[14px] h-[14px] border border-border/80 text-muted-foreground/90 rounded-full flex items-center justify-center leading-none"
            aria-label="Open character status guide"
          >
            ?
          </button>
        </div>

        <div className="w-full px-[6px] flex items-center justify-center">
          <div className="relative w-full h-[9px] bg-surface2 border border-border/70">
            <span className="absolute -left-[12px] font-pixel text-[9px] -top-[2px] text-foreground"></span>
            <span className="absolute -right-[12px] font-pixel text-[9px] -top-[2px] text-foreground"></span>
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="my-[8px] py-[10px] flex items-center justify-center">
          <div className="relative w-[150px] h-[172px]">
            <div className="absolute -inset-[6px] rounded-[10px] transition-all duration-300" style={characterBackdropStyle} />
            <img
              src={displaySrc}
              alt={`${gender} character ${mood}`}
              className="relative z-[1] w-full h-full"
              style={{
                transition: 'opacity 0.4s ease',
                opacity: isVisible ? 1 : 0,
                imageRendering: 'pixelated',
              }}
            />
            {profile.equipped_item && (
              <img
                src={equippedImageCandidates[0]}
                alt={profile.equipped_item}
                className="absolute bottom-0 right-0 z-[2] w-[40px] h-[40px]"
                data-fallback-step="0"
                onError={(event) => {
                  const currentStep = Number(event.currentTarget.dataset.fallbackStep || '0');
                  const nextStep = currentStep + 1;

                  if (nextStep < equippedImageCandidates.length) {
                    event.currentTarget.dataset.fallbackStep = String(nextStep);
                    event.currentTarget.src = equippedImageCandidates[nextStep];
                    return;
                  }

                  event.currentTarget.onerror = null;
                }}
                style={{ imageRendering: 'pixelated' }}
              />
            )}
          </div>
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

        <div
          className="mt-[2px] inline-flex items-center gap-[6px] px-[8px] py-[4px] border border-border/80 bg-surface2/70 rounded-[4px]"
          aria-label={`Current gems: ${profile.coins}`}
        >
          <img
            src="/diamond.png"
            alt="gems"
            className="w-[14px] h-[14px] shrink-0"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="font-pixel text-[7px] text-coin tabular-nums">
            {compactGems(profile.coins)} GEMS
          </span>
        </div>
      </div>

      {showGuide && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <button
            type="button"
            onClick={() => setShowGuide(false)}
            className="absolute inset-0 bg-black/22 backdrop-blur-[1px]"
            aria-label="Close character status guide"
          />
          <div className="relative bg-surface border-t border-border/80 rounded-t-[14px] p-[12px]">
            <div className="flex items-center justify-between mb-[8px]">
              <div className="font-pixel text-[7px] text-foreground/90">STATUS GUIDE</div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="font-pixel text-[7px] px-[6px] py-[2px] border border-border/80 text-muted-foreground/90"
              >
                CLOSE
              </button>
            </div>

            <div className="flex items-end justify-between gap-[6px] mb-[8px]">
              {(['sad', 'neutral', 'happy'] as const).map(state => (
                <div key={state} className="flex-1 flex flex-col items-center gap-[3px]">
                  <img
                    src={`/${gender}_${state}.png`}
                    alt={`${gender} ${state}`}
                    className="w-[46px] h-[52px]"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <div className="font-pixel text-[6px] text-muted-foreground/80">{state.toUpperCase()}</div>
                </div>
              ))}
            </div>

            <div className="text-[10px] leading-[1.5] text-muted-foreground">
              Complete tasks to improve mood and unlock a brighter character state.
            </div>
            <div className="mt-[6px] text-[9px] leading-[1.5] text-muted-foreground/90">
              Background bonus: 1 task today = silver, 2+ tasks = gold, 8+ tasks = rainbow.
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default CharacterPanel;
