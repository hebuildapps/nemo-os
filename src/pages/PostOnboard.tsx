import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PricingTableOne } from '@/components/billingsdk/pricing-table-one';
import { plans } from '@/lib/billingsdk-config';

type CheckoutResponse = { checkout_url: string };

export default function PostOnboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [examName, setExamName] = useState('');
  const [currentScore, setCurrentScore] = useState<number | ''>('');
  const [targetScore, setTargetScore] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const pending = typeof window !== 'undefined' ? sessionStorage.getItem('pending_plan_id') : null;

  const predictedImprovement = useMemo(() => {
    if (!currentScore || !targetScore || currentScore <= 0) return null;
    const improvement = ((targetScore - currentScore) / currentScore) * 100;
    return Math.round(improvement);
  }, [currentScore, targetScore]);

  const onPlanSelect = useCallback(
    async (planId: string) => {
      if (!user) {
        // if somehow not signed in, send user back to auth
        sessionStorage.setItem('pending_plan_id', planId);
        window.location.href = '/?flow=auth';
        return;
      }

      setLoading(true);
      try {
        const resp = await fetch('/api/dodo/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan_id: planId, quantity: 1 }),
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status} ${await resp.text()}`);
        const data = (await resp.json()) as CheckoutResponse;
        if (!data.checkout_url) throw new Error('Missing checkout_url');

        // Clear pending plan now that checkout is started
        sessionStorage.removeItem('pending_plan_id');
        window.location.href = data.checkout_url;
      } catch (e) {
        console.error('Checkout failed', e);
        alert('Checkout failed. Please try again.');
        setLoading(false);
      }
    },
    [user],
  );

  const handleSkip = () => {
    // If user skips, drop pending and continue into app
    sessionStorage.removeItem('pending_plan_id');
    navigate('/');
  };

  return (
    <div className="min-h-dvh bg-background text-foreground container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">A few quick questions</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col">
          <span className="text-sm text-muted-foreground">Last exam name (optional)</span>
          <input value={examName} onChange={(e) => setExamName(e.target.value)} className="input mt-1" placeholder="e.g. JEE Mains 2025" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-muted-foreground">Last score (optional)</span>
          <input
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={currentScore as any}
            onChange={(e) => setCurrentScore(e.target.value === '' ? '' : Number(e.target.value))}
            className="input mt-1"
            placeholder="e.g. 52"
            type="number"
            min={0}
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-muted-foreground">Target score (optional)</span>
          <input
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={targetScore as any}
            onChange={(e) => setTargetScore(e.target.value === '' ? '' : Number(e.target.value))}
            className="input mt-1"
            placeholder="e.g. 85"
            type="number"
            min={0}
          />
        </label>

        <div className="flex items-end">
          <button onClick={handleSkip} className="btn-ghost">Skip and continue</button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Predicted impact</h2>
        {predictedImprovement === null ? (
          <p className="text-sm text-muted-foreground">Provide both current and target scores to see a quick estimate of likely improvement.</p>
        ) : (
          <p className="mt-2 text-xl">Based on your inputs, you could improve by <strong>{predictedImprovement}%</strong> with a focused daily plan.</p>
        )}
      </div>

      <div id="pricing" className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Pricing</h3>
        <p className="text-sm text-muted-foreground mb-4">Choose a plan to start checkout. Your previously selected plan is preselected (if any).</p>

        <PricingTableOne
          plans={plans}
          title="Choose your plan"
          description="Start your upgrade when ready"
          onPlanSelect={(planId) => onPlanSelect(planId)}
          size="medium"
          theme="minimal"
        />

        <div className="mt-4 text-sm text-muted-foreground">Or <button onClick={handleSkip} className="underline">skip for now</button> and continue using Nemo for free.</div>
      </div>
    </div>
  );
}
