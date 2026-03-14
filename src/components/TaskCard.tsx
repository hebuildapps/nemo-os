import React from 'react';
import { Task, stageColor, stageBorderColor, stageTextColor } from '@/lib/nemo-data';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete }) => {
  const t = task;
  const diffCls = t.diff === 'easy' ? 'border-nemo-green text-nemo-green' : t.diff === 'hard' ? 'border-nemo-red text-nemo-red' : 'border-coin text-coin';

  return (
    <div className={`bg-surface border-[1.5px] border-border p-[14px] mb-[9px] transition-colors hover:border-primary ${t.completed ? 'opacity-55 bg-surface2' : ''} ${t.isBreak ? 'border-l-4 border-l-coin' : ''}`}>
      <div className="font-pixel text-[7px] mb-[7px] leading-[1.7]">
        {t.isBreak ? '☕ ' : ''}{t.title}
      </div>
      <div className="text-[12px] text-muted-foreground mb-[9px] leading-[1.5]">{t.desc}</div>
      <div className="flex gap-[6px] flex-wrap mb-[9px]">
        <span
          className="font-pixel text-[6px] px-[7px] py-[2px] border"
          style={{
            background: stageColor(t.stageKey),
            borderColor: stageBorderColor(t.stageKey),
            color: stageTextColor(t.stageKey),
          }}
        >
          {t.stage}
        </span>
        <span className={`font-pixel text-[6px] px-[7px] py-[2px] border ${diffCls}`}>{t.diff.toUpperCase()}</span>
        {t.isBreak && <span className="font-pixel text-[6px] px-[7px] py-[2px] border border-coin text-coin">BREAK</span>}
        {t.completed && <span className="font-pixel text-[6px] px-[7px] py-[2px] border border-nemo-green text-nemo-green">✓ DONE</span>}
        <span className="font-pixel text-[6px] px-[7px] py-[2px] border border-border text-muted-foreground bg-surface2">📅 {t.date}</span>
        <span className="font-pixel text-[6px] px-[7px] py-[2px] border border-border text-muted-foreground bg-surface2">🪙 +{t.coins}</span>
      </div>
      {!t.completed ? (
        <button
          onClick={() => onComplete(t.id)}
          className={`font-pixel text-[8px] px-[14px] py-[7px] border-none cursor-pointer transition-opacity hover:opacity-85 ${t.isBreak ? 'bg-coin' : 'bg-primary'} text-primary-foreground`}
        >
          {t.isBreak ? '☕ TAKE BREAK' : '✓ DONE?'}
        </button>
      ) : (
        <div className="font-pixel text-[7px] text-nemo-green">
          ✓ COMPLETED{t.mcqVerified ? ' + MCQ VERIFIED' : ''}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
