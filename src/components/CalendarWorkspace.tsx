import React, { useState, useMemo } from 'react';
import { stageColor, stageBorderColor, stageTextColor } from '@/lib/nemo-data';
import type { Database } from '@/integrations/supabase/types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];

interface CalendarWorkspaceProps {
  tasks: TaskRow[];
  onComplete: (id: string) => void;
}

const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

const getDifficultyClass = (difficulty: string) =>
  difficulty === 'easy'
    ? 'border-nemo-green text-nemo-green'
    : difficulty === 'hard'
      ? 'border-nemo-red text-nemo-red'
      : 'border-coin text-coin';

const toLocalIsoDate = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0];
};

const getDateParts = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return {
    day: String(day).padStart(2, '0'),
    month: MONTHS[month - 1],
    year: String(year),
  };
};

const CalendarWorkspace: React.FC<CalendarWorkspaceProps> = ({ tasks, onComplete }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selDate, setSelDate] = useState<string | null>(null);
  const [showDayTasks, setShowDayTasks] = useState(false);

  const today = toLocalIsoDate(new Date());

  const byDate = useMemo(() => {
    const m: Record<string, TaskRow[]> = {};
    tasks.forEach(t => { if (!m[t.date]) m[t.date] = []; m[t.date].push(t); });
    return m;
  }, [tasks]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalSlots = 42;

  const nav = (dir: number) => {
    let m = month + dir, y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m); setYear(y);
  };

  const selectedTasks = selDate ? (byDate[selDate] || []) : [];
  const selectedDateParts = selDate ? getDateParts(selDate) : null;

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-[10px]">
        <button
          onClick={() => nav(-1)}
          className="bg-transparent w-[30px] h-[30px] font-pixel text-[10px] text-foreground/75 cursor-pointer transition-colors hover:text-foreground"
        >
          ◀
        </button>
        <span className="font-pixel text-[10px] text-foreground/85">{MONTHS[month]} {year}</span>
        <button
          onClick={() => nav(1)}
          className="bg-transparent w-[30px] h-[30px] font-pixel text-[10px] text-foreground/75 cursor-pointer transition-colors hover:text-foreground"
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-[8px] px-[8px] pb-[8px]">
        {DAYS.map(d => <div key={d} className="font-pixel text-[6px] text-foreground/55 py-[5px] text-center">{d}</div>)}
      </div>

      <div className="flex-1 min-h-0 bg-[#2C2C2E] p-[10px]">
        <div className="h-full grid grid-cols-7 grid-rows-6 gap-[6px]">
          {Array.from({ length: totalSlots }).map((_, slot) => {
            const d = slot - firstDay + 1;
            if (d < 1 || d > daysInMonth) {
              return <div key={`e-${slot}`} className="bg-[#2c2c2e]" />;
            }

          const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dt = byDate[ds] || [];
          const allDone = dt.length > 0 && dt.every(t => t.completed);
          const hasBreak = dt.some(t => t.is_break) && dt.every(t => t.is_break);
          const isToday = ds === today;
          const isSelected = ds === selDate;
          const hasTasks = dt.length > 0;
          const isFuture = ds > today;

          let cls = 'flex flex-col items-center justify-center gap-[2px] rounded-xl text-[14px] cursor-pointer transition-colors';
          if (isSelected) cls += ' bg-[#1f1f20] text-white';
          else if (isToday) cls += ' text-[#1A1A1A] bg-[#E5E0D8] text-foreground';
          else if (allDone) cls += ' text-[#F2F2F7] bg-[#50C878] text-foreground/80';
          else if (isFuture) cls += ' text-[#1A1A1A] bg-[#cec8b8] hover:bg-[#d6cfbf]';
          else if (hasBreak) cls += ' text-[#F2F2F7] bg-[#cec8b8] opacity-60 text-foreground/75';
          else if (hasTasks) cls += ' bg-[#c4c4c4] text-foreground/75 hover:bg-[#c9c9c9]';
          else cls += ' text-[#F2F2F7] bg-[#434345] text-foreground/65 hover:bg-[#d0d0d0]';

          const dotCls = isSelected
            ? 'bg-white/80'
            : allDone
              ? 'bg-[#C2B280]'
              : 'bg-foreground/35';

          return (
            <div
              key={d}
              className={cls}
              onClick={() => {
                setSelDate(ds);
                setShowDayTasks(true);
              }}
            >
              {d}
              {hasTasks && <div className={`w-[4px] h-[4px] ${dotCls}`} />}
            </div>
          );
          })}
        </div>
      </div>

      {showDayTasks && selDate && selectedDateParts && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end">
          <button
            type="button"
            onClick={() => setShowDayTasks(false)}
            className="absolute inset-0 bg-black/16 backdrop-blur-[1px]"
            aria-label="Close selected day tasks"
          />

          <div className="relative w-full max-h-[78%] bg-[#2C2C2E] border-t border-[#434345] rounded-t-[14px] shadow-[0_-10px_28px_rgba(0,0,0,0.35)] animate-in slide-in-from-bottom-8 duration-200">
            <div className="h-full min-h-0 grid grid-cols-[120px_1fr] max-md:grid-cols-1">
              <div className="bg-[#36363a] border-r border-[#4a4a50] max-md:border-r-0 max-md:border-b p-[12px] flex flex-col items-center justify-center gap-[8px]">
                <div className="font-pixel text-[7px] text-[#d1d1d6]/80">{selectedDateParts.month}</div>
                <div className="font-pixel text-[22px] leading-none text-[#f2f2f7]">{selectedDateParts.day}</div>
                <div className="font-pixel text-[7px] text-[#d1d1d6]/80">{selectedDateParts.year}</div>
              </div>

              <div className="min-h-0 flex flex-col">
                <div className="flex items-center justify-between p-[10px] border-b border-[#4a4a50]">
                  <div className="font-pixel text-[8px] text-[#f2f2f7]/90">TASKS — {selDate}</div>
                  <button
                    type="button"
                    onClick={() => setShowDayTasks(false)}
                    className="font-pixel text-[7px] px-[8px] py-[4px] border border-[#5a5a62] text-[#d1d1d6]/85 hover:text-[#f2f2f7]"
                  >
                    CLOSE
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-[10px] space-y-[9px]">
                  {selectedTasks.length === 0 && (
                    <div className="h-full border border-dashed border-[#5a5a62] bg-[#36363a] flex items-center justify-center text-[11px] text-[#d1d1d6]/85">
                      No tasks for this date.
                    </div>
                  )}

                  {selectedTasks.map(t => {
                    const diffCls = getDifficultyClass(t.difficulty);

                    return (
                      <div key={t.id} className={`bg-[#36363a] border-[1.5px] border-[#4a4a50] p-[12px] ${t.completed ? 'opacity-80' : ''}`}>
                        <div className="font-pixel text-[7px] mb-[6px] leading-[1.7] text-[#f2f2f7]">
                          {t.is_break ? '☕ ' : ''}{t.title}
                        </div>

                        <div className="text-[11px] text-[#d1d1d6]/90 mb-[8px] leading-[1.45]">{t.description}</div>

                        <div className="flex gap-[6px] flex-wrap mb-[8px]">
                          <span
                            className="font-pixel text-[6px] px-[7px] py-[2px] border inline-flex items-center justify-center text-center leading-none"
                            style={{
                              background: stageColor(t.stage_key),
                              borderColor: stageBorderColor(t.stage_key),
                              color: stageTextColor(t.stage_key),
                            }}
                          >
                            {t.stage}
                          </span>
                          <span className={`font-pixel text-[6px] px-[7px] py-[2px] border inline-flex items-center justify-center text-center leading-none ${diffCls}`}>{t.difficulty.toUpperCase()}</span>
                          {t.is_break && <span className="font-pixel text-[6px] px-[7px] py-[2px] border border-coin text-coin inline-flex items-center justify-center text-center leading-none">BREAK</span>}
                          {t.completed && <span className="font-pixel text-[6px] px-[7px] py-[2px] border border-nemo-green text-nemo-green inline-flex items-center justify-center text-center leading-none">✓ DONE</span>}
                          <span className="font-pixel text-[6px] px-[7px] py-[2px] border border-[#5a5a62] text-[#d1d1d6]/90 bg-[#2C2C2E] inline-flex items-center justify-center text-center leading-none gap-[4px]">
                            <img
                              src="/diamond.png"
                              alt="gems"
                              className="w-[14px] h-[14px] shrink-0"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            +{t.coins_reward}
                          </span>
                        </div>

                        {!t.completed ? (
                          <button
                            type="button"
                            onClick={() => onComplete(t.id)}
                            className={`font-pixel text-[8px] px-[14px] py-[7px] border-none cursor-pointer transition-opacity hover:opacity-85 ${t.is_break ? 'bg-coin' : 'bg-primary'} text-primary-foreground`}
                          >
                            {t.is_break ? '☕ TAKE BREAK' : '✓ DONE?'}
                          </button>
                        ) : (
                          <div className="font-pixel text-[7px] text-nemo-green">
                            ✓ COMPLETED{t.mcq_verified ? ' + MCQ VERIFIED' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWorkspace;
