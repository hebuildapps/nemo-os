import React, { useState, useEffect } from 'react';
import type { Database } from '@/integrations/supabase/types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];

interface McqModalProps {
  task: TaskRow;
  onCorrect: () => void;
  onClose: () => void;
}

interface McqData {
  question: string;
  options: string[];
  correct: number;
}

const fallbackMcq = (topic: string): McqData => ({
  question: `Which statement best reflects the purpose of ${topic} in interview problem solving?`,
  options: [
    'It helps structure a correct and efficient solution to a class of problems.',
    'It is mainly used for choosing UI colors and layouts.',
    'It is primarily about setting up cloud billing alerts.',
    'It focuses on replacing testing with manual reviews.',
  ],
  correct: 0,
});

const isValidMcq = (value: unknown): value is McqData => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<McqData>;

  return (
    typeof candidate.question === 'string' &&
    Array.isArray(candidate.options) &&
    candidate.options.length === 4 &&
    candidate.options.every(option => typeof option === 'string') &&
    typeof candidate.correct === 'number' &&
    Number.isInteger(candidate.correct) &&
    candidate.correct >= 0 &&
    candidate.correct < candidate.options.length
  );
};

const formatDifficulty = (difficulty: string) =>
  difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase() : 'Medium';

const backendBaseUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '');
const MCQ_ENDPOINT = backendBaseUrl ? `${backendBaseUrl}/api/generate-mcq` : '/api/generate-mcq';

const McqModal: React.FC<McqModalProps> = ({ task, onCorrect, onClose }) => {
  const [mcq, setMcq] = useState<McqData | null>(null);
  const [loadingMcq, setLoadingMcq] = useState(true);
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchMcq = async () => {
      setLoadingMcq(true);
      setMcq(null);
      setSel(null);
      setDone(false);
      setIsCorrect(false);

      try {
        const response = await fetch(MCQ_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: task.title,
            difficulty: formatDifficulty(task.difficulty),
            stage: task.stage,
          }),
        });

        if (!response.ok) {
          throw new Error(`MCQ request failed with status ${response.status}`);
        }

        const data: unknown = await response.json();

        if (!active) return;

        if (!isValidMcq(data)) {
          throw new Error('Invalid MCQ payload');
        }

        setMcq(data);
      } catch {
        if (!active) return;
        setMcq(fallbackMcq(task.title));
      } finally {
        if (active) {
          setLoadingMcq(false);
        }
      }
    };

    fetchMcq();

    return () => {
      active = false;
    };
  }, [task.difficulty, task.stage, task.title]);

  const submit = () => {
    if (sel === null || !mcq || done) return;

    const ok = sel === mcq.correct;
    setDone(true);
    setIsCorrect(ok);

    if (ok) {
      setTimeout(() => onCorrect(), 1800);
    }
  };

  if (loadingMcq || !mcq) {
    return (
      <div className="fixed inset-0 bg-foreground/70 flex items-center justify-center z-[200]">
        <div className="bg-surface border-2 border-primary p-[28px] w-[510px] max-w-[95vw]">
          <div className="font-pixel text-[8px] text-muted-foreground mb-[14px]">TASK VERIFICATION — MCQ</div>
          <div className="text-center p-[36px] leading-[2]">
            <div className="font-pixel text-[9px] text-foreground animate-pulse">GENERATING QUESTION...</div>
            <div className="mt-[12px] text-[11px] text-muted-foreground">
              {task.title} · {formatDifficulty(task.difficulty)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-foreground/70 flex items-center justify-center z-[200]">
      <div className="bg-surface border-2 border-primary p-[28px] w-[510px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <div className="font-pixel text-[8px] text-muted-foreground mb-[14px]">TASK VERIFICATION — MCQ</div>
        <div className="text-[14px] leading-[1.6] mb-[18px] font-medium">{mcq.question}</div>
        <div className="flex flex-col gap-[7px] mb-[18px]">
          {mcq.options.map((option, index) => {
            let cls = 'p-[11px_14px] border-[1.5px] cursor-pointer text-[12px] leading-[1.5] transition-all text-left font-mono text-foreground';

            if (done) {
              if (index === mcq.correct) cls += ' border-nemo-green bg-nemo-green/10 text-nemo-green';
              else if (index === sel && !isCorrect) cls += ' border-nemo-red bg-nemo-red/10 text-nemo-red';
              else cls += ' border-border';
            } else if (index === sel) {
              cls += ' border-primary bg-primary text-primary-foreground';
            } else {
              cls += ' border-border hover:border-primary hover:bg-surface2';
            }

            return (
              <button key={index} className={cls} onClick={() => !done && setSel(index)}>
                {option}
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
            {isCorrect ? `✓ CORRECT! +${task.coins_reward} gems awarded. Task complete.` : `✗ INCORRECT. Correct: Option ${String.fromCharCode(65 + mcq.correct)}. Review and try again.`}
          </div>
        )}
      </div>
    </div>
  );
};

export default McqModal;
