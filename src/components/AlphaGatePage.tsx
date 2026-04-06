import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AlphaGatePage: React.FC = () => {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [note, setNote] = useState('');

  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const [waitlistError, setWaitlistError] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState('');

  const submitWaitlist = async () => {
    setWaitlistError('');
    setWaitlistSuccess('');

    if (!waitlistEmail.trim()) {
      setWaitlistError('Email is required');
      return;
    }

    setWaitlistLoading(true);

    const payload = {
      email: waitlistEmail.trim().toLowerCase(),
      note: note.trim() || null,
      status: 'pending',
    };

    const { error } = await (supabase as any)
      .from('alpha_waitlist')
      .upsert(payload, { onConflict: 'email' });

    if (error) {
      setWaitlistError('Something went wrong.');

      if (import.meta.env.DEV) {
        console.error('Waitlist submission failed:', error);
      }
    } else {
      setWaitlistSuccess('You are on the waitlist. If approved, we will send your magic-link invite by email.');
      setWaitlistEmail('');
      setNote('');
    }

    setWaitlistLoading(false);
  };

  return (
    <div className="h-full w-full bg-background flex items-center justify-center">
      <div className="bg-surface border-2 border-border p-[28px] w-[820px] max-w-[95vw]">
        <div className="font-pixel text-[12px] mb-[8px]">NEMO OS ALPHA</div>
        <div className="text-[12px] text-muted-foreground mb-[20px] leading-[1.6]">
          Access is currently limited to invited testers.
        </div>

        <div className="grid grid-cols-2 gap-[14px] max-md:grid-cols-1">
          <div className="border-[1.5px] border-border bg-surface2 p-[14px]">
            <div className="font-pixel text-[8px] mb-[10px]">JOIN WAITLIST</div>

            {waitlistError && (
              <div className="font-pixel text-[7px] text-nemo-red mb-[8px] p-2 border border-nemo-red bg-nemo-red/5">{waitlistError}</div>
            )}
            {waitlistSuccess && (
              <div className="font-pixel text-[7px] text-nemo-green mb-[8px] p-2 border border-nemo-green bg-nemo-green/5">{waitlistSuccess}</div>
            )}

            <label className="font-pixel text-[7px] text-muted-foreground block mb-[4px]">EMAIL</label>
            <input
              type="email"
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
              className="w-full p-[8px_10px] border-[1.5px] border-border bg-background font-mono text-[12px] mb-[10px] text-foreground outline-none focus:border-primary"
              placeholder="you@example.com"
            />

            <label className="font-pixel text-[7px] text-muted-foreground block mb-[4px]">WHY DO YOU WANT ACCESS? (OPTIONAL)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-[8px_10px] border-[1.5px] border-border bg-background font-mono text-[12px] mb-[10px] text-foreground outline-none focus:border-primary min-h-[90px] resize-none"
              placeholder="Role, goals, and what you'll test"
            />

            <button
              onClick={submitWaitlist}
              disabled={waitlistLoading}
              className="font-pixel text-[8px] p-[11px] w-full bg-primary text-primary-foreground border-none cursor-pointer transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {waitlistLoading ? 'SUBMITTING...' : 'JOIN WAITLIST'}
            </button>
          </div>

          <div className="border-[1.5px] border-border bg-surface2 p-[14px]">
            <div className="font-pixel text-[8px] mb-[10px]">HOW ACCESS WORKS</div>
            <div className="text-[11px] text-muted-foreground leading-[1.7]">
              1. Join waitlist with your email.
            </div>
            <div className="text-[11px] text-muted-foreground leading-[1.7]">
              2. We review and approve a small set of testers.
            </div>
            <div className="text-[11px] text-muted-foreground leading-[1.7]">
              3. Approved emails receive a magic-link invite directly by email.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AlphaGatePage;
