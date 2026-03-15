import React, { useState, useMemo } from 'react';
import TaskCard from './TaskCard';
import type { Database } from '@/integrations/supabase/types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];

interface CalendarWorkspaceProps {
  tasks: TaskRow[];
  onComplete: (id: string) => void;
}

const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

const CalendarWorkspace: React.FC<CalendarWorkspaceProps> = ({ tasks, onComplete }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selDate, setSelDate] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

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

  return (
    <div className="h-full flex flex-col">
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
          if (isSelected) cls += ' text-[#F2F2F7]bg-[#f8f8f8] text-foreground';
          else if (isToday) cls += ' text-[#1A1A1A] bg-[#E5E0D8] text-foreground';
          else if (allDone) cls += ' text-[#F2F2F7] bg-[#50C878] text-foreground/80';
          else if (hasBreak) cls += ' text-[#F2F2F7] bg-[#cec8b8] opacity-60 text-foreground/75';
          else if (hasTasks && !isFuture) cls += ' bg-[#c4c4c4] text-foreground/75 hover:bg-[#c9c9c9]';
          else cls += ' text-[#F2F2F7] bg-[#434345] text-foreground/65 hover:bg-[#d0d0d0]';

          const dotCls = isSelected
            ? 'bg-foreground/70'
            : allDone
              ? 'bg-[#C2B280]'
              : 'bg-foreground/35';

          return (
            <div key={d} className={cls} onClick={() => setSelDate(ds)}>
              {d}
              {hasTasks && <div className={`w-[4px] h-[4px] bg-[#C2B280] ${dotCls}`} />}
            </div>
          );
          })}
        </div>
      </div>

      {selDate && selectedTasks.length > 0 && (
        <div className="mt-[12px] pt-[10px] border-t border-border/40 max-h-[34%] overflow-y-auto">
          <div className="font-pixel text-[8px] text-muted-foreground mb-[10px]">TASKS — {selDate}</div>
          {selectedTasks.map(t => <TaskCard key={t.id} task={t} onComplete={onComplete} />)}
        </div>
      )}
    </div>
  );
};

export default CalendarWorkspace;
