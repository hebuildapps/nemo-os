import React, { useState, useMemo } from 'react';
import { Task, fmt } from '@/lib/nemo-data';
import TaskCard from './TaskCard';

const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

interface CalendarWorkspaceProps {
  tasks: Task[];
  onComplete: (id: string) => void;
}

const CalendarWorkspace: React.FC<CalendarWorkspaceProps> = ({ tasks, onComplete }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selDate, setSelDate] = useState<string | null>(null);

  const today = fmt(new Date());

  const byDate = useMemo(() => {
    const m: Record<string, Task[]> = {};
    tasks.forEach(t => { if (!m[t.date]) m[t.date] = []; m[t.date].push(t); });
    return m;
  }, [tasks]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const nav = (dir: number) => {
    let m = month + dir;
    let y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m);
    setYear(y);
  };

  const selectedTasks = selDate ? (byDate[selDate] || []) : [];

  return (
    <div>
      <div className="font-pixel text-[10px] text-foreground mb-[18px] pb-[10px] border-b-2 border-border">
        📅 CALENDAR
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between mb-[14px]">
        <button onClick={() => nav(-1)} className="bg-transparent border-[1.5px] border-border w-[30px] h-[30px] font-pixel text-[10px] text-foreground cursor-pointer hover:bg-surface2 transition-colors">◀</button>
        <span className="font-pixel text-[10px]">{MONTHS[month]} {year}</span>
        <button onClick={() => nav(1)} className="bg-transparent border-[1.5px] border-border w-[30px] h-[30px] font-pixel text-[10px] text-foreground cursor-pointer hover:bg-surface2 transition-colors">▶</button>
      </div>

      {/* Header */}
      <div className="grid grid-cols-7 gap-[2px]">
        {DAYS.map(d => (
          <div key={d} className="font-pixel text-[6px] text-muted-foreground py-[5px] text-center">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-[2px]">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dt = byDate[ds] || [];
          const allDone = dt.length > 0 && dt.every(t => t.completed);
          const hasBreak = dt.some(t => t.isBreak) && dt.every(t => t.isBreak);
          const isToday = ds === today;
          const isSelected = ds === selDate;
          const hasTasks = dt.length > 0;

          let cls = 'aspect-square flex flex-col items-center justify-center text-[12px] cursor-pointer border-[1.5px] transition-all relative gap-[2px]';
          if (isSelected) cls += ' bg-primary text-primary-foreground border-primary';
          else if (allDone) cls += ' bg-nemo-green/10 border-nemo-green';
          else if (hasBreak) cls += ' bg-coin/10 border-coin';
          else if (isToday) cls += ' border-primary bg-surface font-semibold';
          else cls += ' border-transparent hover:border-border hover:bg-surface';

          return (
            <div key={d} className={cls} onClick={() => setSelDate(ds)}>
              {d}
              {hasTasks && (
                <div className={`w-1 h-1 ${isSelected ? 'bg-primary-foreground' : allDone ? 'bg-nemo-green' : 'bg-primary'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Day panel */}
      {selDate && selectedTasks.length > 0 && (
        <div className="mt-[18px] bg-surface border-[1.5px] border-border p-[14px]">
          <div className="font-pixel text-[8px] text-muted-foreground mb-[10px]">TASKS — {selDate}</div>
          {selectedTasks.map(t => (
            <TaskCard key={t.id} task={t} onComplete={onComplete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarWorkspace;
