import React, { useState, useMemo } from 'react';
import { Task, fmt } from '@/lib/nemo-data';
import TaskCard from './TaskCard';

interface TasksWorkspaceProps {
  tasks: Task[];
  onComplete: (id: string) => void;
}

type Filter = 'today' | 'pending' | 'done' | 'all';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'today', label: 'TODAY' },
  { id: 'pending', label: 'PENDING' },
  { id: 'done', label: 'DONE' },
  { id: 'all', label: 'ALL' },
];

const TasksWorkspace: React.FC<TasksWorkspaceProps> = ({ tasks, onComplete }) => {
  const [filter, setFilter] = useState<Filter>('today');
  const today = fmt(new Date());
  const now = new Date(today); now.setHours(0, 0, 0, 0);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'today': return tasks.filter(t => t.date === today);
      case 'pending': return tasks.filter(t => !t.completed && new Date(t.date) <= now);
      case 'done': return tasks.filter(t => t.completed);
      default: return tasks;
    }
  }, [tasks, filter, today]);

  return (
    <div>
      <div className="font-pixel text-[10px] text-foreground mb-[18px] pb-[10px] border-b-2 border-border">
        📋 TASKS
      </div>

      <div className="flex gap-[5px] mb-[14px] flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`font-pixel text-[7px] px-[10px] py-[5px] cursor-pointer border-[1.5px] transition-all
              ${filter === f.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-transparent text-muted-foreground border-border hover:bg-surface2'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="p-[36px] text-center font-pixel text-[8px] text-muted-foreground leading-[2]">
          NO TASKS FOUND<br /><br />
          {filter === 'today' ? 'Nothing scheduled today.' : filter === 'pending' ? 'All caught up!' : ''}
        </div>
      ) : (
        filtered.map(t => <TaskCard key={t.id} task={t} onComplete={onComplete} />)
      )}
    </div>
  );
};

export default TasksWorkspace;
