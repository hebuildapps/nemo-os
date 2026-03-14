import React, { useState } from 'react';
import { fmt } from '@/lib/nemo-data';

interface OnboardingProps {
  onComplete: (name: string, date: string, role: string, hours: number, ref: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const defaultDate = new Date();
  defaultDate.setMonth(defaultDate.getMonth() + 3);

  const [name, setName] = useState('');
  const [date, setDate] = useState(fmt(defaultDate));
  const [role, setRole] = useState('');
  const [hours, setHours] = useState('4');
  const [ref, setRef] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!date) { setError('Please set your placement date!'); return; }
    if (!role) { setError('Please select a target role!'); return; }
    if (new Date(date) <= new Date()) { setError('Placement date must be in the future!'); return; }
    onComplete(name.trim() || 'NEMO', date, role, parseInt(hours), ref.trim().toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-[100]">
      <div className="bg-surface border-2 border-border p-[36px] w-[470px] max-w-[95vw]">
        <div className="font-pixel text-[12px] mb-[6px] leading-[1.6]">NEMO OS</div>
        <div className="text-[12px] text-muted-foreground mb-[24px] leading-[1.5]">
          Gamified placement prep OS. Set up your mission parameters.
        </div>

        {error && (
          <div className="font-pixel text-[7px] text-nemo-red mb-[10px] p-2 border border-nemo-red bg-nemo-red/5">⚠ {error}</div>
        )}

        <label className="font-pixel text-[7px] text-muted-foreground block mb-[5px]">YOUR NAME</label>
        <input
          value={name} onChange={e => setName(e.target.value)} maxLength={20}
          placeholder="Enter name..."
          className="w-full p-[9px_11px] border-[1.5px] border-border bg-surface2 font-mono text-[12px] mb-[14px] text-foreground outline-none focus:border-primary"
        />

        <label className="font-pixel text-[7px] text-muted-foreground block mb-[5px]">PLACEMENT DATE</label>
        <input
          type="date" value={date} onChange={e => setDate(e.target.value)}
          className="w-full p-[9px_11px] border-[1.5px] border-border bg-surface2 font-mono text-[12px] mb-[14px] text-foreground outline-none focus:border-primary"
        />

        <label className="font-pixel text-[7px] text-muted-foreground block mb-[5px]">TARGET ROLE</label>
        <select
          value={role} onChange={e => setRole(e.target.value)}
          className="w-full p-[9px_11px] border-[1.5px] border-border bg-surface2 font-mono text-[12px] mb-[14px] text-foreground outline-none focus:border-primary"
        >
          <option value="">Select role...</option>
          <option value="Software Engineer">Software Engineer</option>
          <option value="Frontend Developer">Frontend Developer</option>
          <option value="Backend Developer">Backend Developer</option>
          <option value="Full Stack Developer">Full Stack Developer</option>
        </select>

        <label className="font-pixel text-[7px] text-muted-foreground block mb-[5px]">STUDY HOURS / DAY</label>
        <select
          value={hours} onChange={e => setHours(e.target.value)}
          className="w-full p-[9px_11px] border-[1.5px] border-border bg-surface2 font-mono text-[12px] mb-[14px] text-foreground outline-none focus:border-primary"
        >
          {[2, 3, 4, 5, 6, 8].map(h => (
            <option key={h} value={h}>{h} hours</option>
          ))}
        </select>

        <label className="font-pixel text-[7px] text-muted-foreground block mb-[5px]">REFERRAL CODE (optional)</label>
        <input
          value={ref} onChange={e => setRef(e.target.value)} maxLength={10}
          placeholder="Friend's code for +50 coins..."
          className="w-full p-[9px_11px] border-[1.5px] border-border bg-surface2 font-mono text-[12px] mb-[14px] text-foreground outline-none focus:border-primary"
        />

        <button
          onClick={submit}
          className="font-pixel text-[9px] p-[13px] w-full bg-primary text-primary-foreground border-none cursor-pointer mt-[6px] transition-opacity hover:opacity-85"
        >
          INITIALIZE NEMO OS →
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
