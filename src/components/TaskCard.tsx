import React from 'react';
import { stageColor, stageBorderColor, stageTextColor } from '@/lib/nemo-data';
import type { Database } from '@/integrations/supabase/types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];

interface TaskCardProps {
  task: TaskRow;
  onComplete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete }) => {
  const t = task;
  const diffCls = t.difficulty === 'easy' ? 'border-nemo-green text-nemo-green' : t.difficulty === 'hard' ? 'border-nemo-red text-nemo-red' : 'border-coin text-coin';

  return (
    <div className={`bg-surface border-[1.5px] border-border p-[14px] mb-[9px] transition-colors hover:border-primary ${t.completed ? 'opacity-55 bg-surface2' : ''} ${t.is_break ? 'border-l-4 border-l-coin' : ''}`}>
      <div className="font-pixel text-[7px] mb-[7px] leading-[1.7]">
        {t.is_break ? '☕ ' : ''}{t.title}
      </div>
      <div className="text-[12px] text-muted-foreground mb-[9px] leading-[1.5]">{t.description}</div>
      <div className="flex gap-[6px] flex-wrap mb-[9px]">
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
        <span className="font-pixel text-[6px] px-[7px] py-[2px] border border-border text-muted-foreground bg-surface2 inline-flex items-center justify-center text-center leading-none">📅 {t.date}</span>
        <span className="font-pixel text-[6px] px-[7px] py-[2px] border border-border text-muted-foreground bg-surface2 inline-flex items-center justify-center text-center leading-none gap-[4px]">
          <img
            src="/public/diamond.png"
            alt="coin"
            className="w-[16px] h-[16px] shrink-0"
            style={{ imageRendering: 'pixelated' }}
          />
          +{t.coins_reward}
        </span>
      </div>
      {!t.completed ? (
        <button
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
};

export default TaskCard;
