import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

const McqModal: React.FC<McqModalProps> = ({ task, onCorrect, onClose }) => {
  const [mcq, setMcq] = useState<McqData | null>(null);
  const [loadingMcq, setLoadingMcq] = useState(true);
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const fetchMcq = async () => {
      setLoadingMcq(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-mcq', {
          body: { taskTitle: task.title, taskDescription: task.description },
        });
        if (error) throw error;
        if (data && data.question && data.options) {
          setMcq(data);
        } else {
          throw new Error('Invalid response');
        }
      } catch (e) {
        // Fallback
        setMcq({
          question: `Which best describes the core concept of "${task.title}"?`,
          options: [
            'A) Systematic analysis of algorithmic complexity and data structures',
            'B) Database normalization and query optimization',
            'C) UI/UX design methodology for front-end applications',
            'D) Network protocol and communication design',
          ],
          correct: 0,
        });
      }
      setLoadingMcq(false);
    };
    fetchMcq();
  }, [task]);

  const submit = () => {
    if (sel === null || done) return;
    setDone(true);
    const ok = sel === mcq!.correct;
    setIsCorrect(ok);
    if (ok) setTimeout(() => onCorrect(), 1800);
  };

  if (loadingMcq || !mcq) {
    return (
      <div className="fixed inset-0 bg-foreground/70 flex items-center justify-center z-[200]">
        <div className="bg-surface border-2 border-primary p-[28px] w-[510px] max-w-[95vw]">
          <div className="font-pixel text-[8px] text-muted-foreground mb-[14px]">TASK VERIFICATION — MCQ</div>
          <div className="text-center p-[36px] font-pixel text-[8px] text-muted-foreground leading-[2]">
            GENERATING MCQ FOR:<br />
            <span className="text-foreground">{task.title}</span><br /><br />
            ⏳ Loading...
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
              <button key={i} className={cls} onClick={() => !done && setSel(i)}>{o}</button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button onClick={submit} className="font-pixel text-[8px] p-[10px_18px] bg-primary text-primary-foreground border-none cursor-pointer">SUBMIT</button>
          <button onClick={onClose} className="font-pixel text-[8px] p-[10px_18px] bg-transparent text-muted-foreground border-[1.5px] border-border cursor-pointer">CANCEL</button>
        </div>
        {done && (
          <div className={`p-[11px_14px] mt-[10px] font-pixel text-[8px] leading-[1.6] border-[1.5px] ${isCorrect ? 'bg-nemo-green/10 text-nemo-green border-nemo-green' : 'bg-nemo-red/10 text-nemo-red border-nemo-red'}`}>
            {isCorrect ? `✓ CORRECT! +${task.coins_reward} coins awarded. Task complete.` : `✗ INCORRECT. Correct: Option ${String.fromCharCode(65 + mcq.correct)}. Review and try again.`}
          </div>
        )}
      </div>
    </div>
  );
};

export default McqModal;
