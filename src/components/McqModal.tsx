import React, { useState } from 'react';
import { Task } from '@/lib/nemo-data';

interface McqModalProps {
  task: Task;
  onCorrect: () => void;
  onClose: () => void;
}

const McqModal: React.FC<McqModalProps> = ({ task, onCorrect, onClose }) => {
  // Fallback MCQ (no API call in demo)
  const mcq = {
    question: `Which statement best describes the core concept in "${task.title}"?`,
    options: [
      'A) It involves systematic analysis of algorithmic complexity and data structure properties',
      'B) It is primarily concerned with database normalization and query optimization',
      'C) It is mainly a UI/UX design methodology for front-end applications',
      'D) It focuses exclusively on network protocol and communication design',
    ],
    correct: 0,
  };

  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const submit = () => {
    if (sel === null || done) return;
    setDone(true);
    const ok = sel === mcq.correct;
    setIsCorrect(ok);
    if (ok) {
      setTimeout(() => onCorrect(), 1800);
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/70 flex items-center justify-center z-[200]">
      <div className="bg-surface border-2 border-primary p-[28px] w-[510px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <div className="font-pixel text-[8px] text-muted-foreground mb-[14px]">TASK VERIFICATION — MCQ</div>
        <div className="text-[14px] leading-[1.6] mb-[18px] font-medium">{mcq.question}</div>
        <div className="flex flex-col gap-[7px] mb-[18px]">
          {mcq.options.map((o, i) => {
            let cls = 'p-[11px_14px] border-[1.5px] cursor-pointer text-[12px] leading-[1.5] transition-all text-left font-mono text-foreground';
            if (done) {
              if (i === mcq.correct) cls += ' border-nemo-green bg-nemo-green/10 text-nemo-green';
              else if (i === sel && !isCorrect) cls += ' border-nemo-red bg-nemo-red/10 text-nemo-red';
              else cls += ' border-border';
            } else if (i === sel) {
              cls += ' border-primary bg-primary text-primary-foreground';
            } else {
              cls += ' border-border hover:border-primary hover:bg-surface2';
            }
            return (
              <button key={i} className={cls} onClick={() => !done && setSel(i)}>
                {o}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button onClick={submit} className="font-pixel text-[8px] p-[10px_18px] bg-primary text-primary-foreground border-none cursor-pointer">SUBMIT</button>
          <button onClick={onClose} className="font-pixel text-[8px] p-[10px_18px] bg-transparent text-muted-foreground border-[1.5px] border-border cursor-pointer">CANCEL</button>
        </div>
        {done && (
          <div className={`p-[11px_14px] mt-[10px] font-pixel text-[8px] leading-[1.6] border-[1.5px] ${isCorrect ? 'bg-nemo-green/10 text-nemo-green border-nemo-green' : 'bg-nemo-red/10 text-nemo-red border-nemo-red'}`}>
            {isCorrect ? `✓ CORRECT! +${task.coins} coins awarded. Task complete.` : `✗ INCORRECT. Correct: Option ${String.fromCharCode(65 + mcq.correct)}. Review and try again.`}
          </div>
        )}
      </div>
    </div>
  );
};

export default McqModal;
