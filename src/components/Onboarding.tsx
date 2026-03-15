import React, { useState } from 'react';
import { fmt } from '@/lib/nemo-data';

interface OnboardingProps {
  onComplete: (gender: 'boy' | 'girl', name: string, date: string, role: string, hours: number, ref: string) => Promise<void>;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const defaultDate = new Date();
  defaultDate.setMonth(defaultDate.getMonth() + 3);

  const [name, setName] = useState('');
  const [date, setDate] = useState(fmt(defaultDate));
  const [role, setRole] = useState('');
  const [hours, setHours] = useState('4');
  const [ref, setRef] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl' | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const continueToDetails = () => {
    if (!gender) { setError('Please select BOY or GIRL!'); return; }
    setError('');
    setStep(2);
  };

  const submit = async () => {
    if (!gender) { setError('Please select BOY or GIRL!'); return; }
    if (!date) { setError('Please set your placement date!'); return; }
    if (!role) { setError('Please select a target role!'); return; }
    if (new Date(date) <= new Date()) { setError('Placement date must be in the future!'); return; }
    setLoading(true);
    try {
      await onComplete(gender, name.trim() || 'NEMO', date, role, parseInt(hours, 10), ref.trim().toUpperCase());
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="bg-surface border-2 border-border p-[36px] w-[470px] max-w-[95vw]">
        <div className="font-pixel text-[12px] mb-[6px] leading-[1.6]">NEMO OS — SETUP</div>
        <div className="text-[12px] text-muted-foreground mb-[24px] leading-[1.5]">
          Configure your placement prep mission parameters.
        </div>

        {error && (
          <div className="font-pixel text-[7px] text-nemo-red mb-[10px] p-2 border border-nemo-red bg-nemo-red/5">⚠ {error}</div>
        )}

        {step === 1 ? (
          <>
            <label className="font-pixel text-[7px] text-muted-foreground block mb-[6px]">SELECT CHARACTER</label>
            <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
              <button
                type="button"
                onClick={() => { setGender('boy'); setError(''); }}
                className={`h-[120px] border-2 font-pixel text-[13px] transition-colors ${gender === 'boy' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface2 text-foreground hover:border-primary'}`}
              >
                BOY
              </button>
              <button
                type="button"
                onClick={() => { setGender('girl'); setError(''); }}
                className={`h-[120px] border-2 font-pixel text-[13px] transition-colors ${gender === 'girl' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface2 text-foreground hover:border-primary'}`}
              >
                GIRL
              </button>
            </div>

            <button
              onClick={continueToDetails}
              className="font-pixel text-[9px] p-[13px] w-full bg-primary text-primary-foreground border-none cursor-pointer mt-[6px] transition-opacity hover:opacity-85"
            >
              CONTINUE →
            </button>
          </>
        ) : (
          <>
            <div className="font-pixel text-[7px] text-muted-foreground mb-[10px]">CHARACTER: {gender?.toUpperCase()}</div>

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
              placeholder="Friend's code for +50 gems..."
              className="w-full p-[9px_11px] border-[1.5px] border-border bg-surface2 font-mono text-[12px] mb-[14px] text-foreground outline-none focus:border-primary"
            />

            <div className="flex gap-[8px] mt-[6px]">
              <button
                onClick={() => setStep(1)}
                className="font-pixel text-[8px] p-[13px] w-[130px] bg-transparent text-muted-foreground border-[1.5px] border-border cursor-pointer transition-colors hover:border-primary hover:text-primary"
              >
                ← BACK
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="font-pixel text-[9px] p-[13px] flex-1 bg-primary text-primary-foreground border-none cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {loading ? 'GENERATING PLAN...' : 'INITIALIZE NEMO OS →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
