import React, { useState, useCallback, useEffect } from 'react';
import { WorkspaceId, SHOP_ITEMS, fmt } from '@/lib/nemo-data';
import { NemoState, loadState, saveState, clearState, createInitialState, checkNewBadges, updateStreak } from '@/lib/nemo-store';
import CharacterPanel from '@/components/CharacterPanel';
import IconRail from '@/components/IconRail';
import CalendarWorkspace from '@/components/CalendarWorkspace';
import TasksWorkspace from '@/components/TasksWorkspace';
import BadgesWorkspace from '@/components/BadgesWorkspace';
import ShopWorkspace from '@/components/ShopWorkspace';
import ProfileWorkspace from '@/components/ProfileWorkspace';
import Onboarding from '@/components/Onboarding';
import McqModal from '@/components/McqModal';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const [state, setState] = useState<NemoState | null>(() => loadState());
  const [workspace, setWorkspace] = useState<WorkspaceId>('calendar');
  const [mcqTaskId, setMcqTaskId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Save on state change
  useEffect(() => {
    if (state?.user) saveState(state);
  }, [state]);

  // Check streak on load
  useEffect(() => {
    if (!state?.user) return;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (state.user.lastActive && state.user.lastActive !== fmt(new Date()) && state.user.lastActive !== fmt(yesterday)) {
      setState(s => s ? { ...s, user: { ...s.user!, streak: 0 } } : s);
    }
  }, []);

  const onOnboard = useCallback((name: string, date: string, role: string, hours: number, ref: string) => {
    const s = createInitialState(name, date, role, hours, ref);
    setState(s);
    if (ref) toast('🪙 +50 COINS! Referral code applied.');
  }, []);

  const awardCoins = useCallback((s: NemoState, n: number) => {
    const boost = s.userItems.has('coin_boost') ? 2 : 1;
    const actual = n * boost;
    s.user!.coins += actual;
    s.user!.totalEarned = (s.user!.totalEarned || 0) + actual;
    return actual;
  }, []);

  const completeTask = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      const task = prev.tasks.find(t => t.id === id);
      if (!task || task.completed) return prev;

      if (task.isBreak) {
        const next = { ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: true } : t) };
        next.user = { ...next.user! };
        const awarded = awardCoins(next, task.coins);
        toast(`☕ Break day logged! +${awarded} coin`);

        const newBadges = checkNewBadges(next);
        newBadges.forEach(b => { next.userBadges = new Set([...next.userBadges, b]); });

        return next;
      }

      // Non-break: open MCQ
      setMcqTaskId(id);
      return prev;
    });
  }, [awardCoins]);

  const onMcqCorrect = useCallback(() => {
    setMcqTaskId(null);
    setState(prev => {
      if (!prev || !mcqTaskId) return prev;
      const task = prev.tasks.find(t => t.id === mcqTaskId);
      if (!task) return prev;

      const next = { ...prev, tasks: prev.tasks.map(t => t.id === mcqTaskId ? { ...t, completed: true, mcqVerified: true } : t) };
      next.user = { ...next.user! };
      const awarded = awardCoins(next, task.coins);

      const streakResult = updateStreak(next);
      if (streakResult.streakBonus > 0) awardCoins(next, streakResult.streakBonus);
      if (streakResult.message) toast(streakResult.message);

      const newBadges = checkNewBadges(next);
      newBadges.forEach(b => {
        next.userBadges = new Set([...next.userBadges, b]);
        toast(`🏆 Badge unlocked!`);
      });

      toast(`✓ +${awarded} coins! Task complete.`);
      return next;
    });
  }, [mcqTaskId, awardCoins]);

  const shopBuy = useCallback((id: string) => {
    setState(prev => {
      if (!prev) return prev;
      const item = SHOP_ITEMS.find(i => i.id === id);
      if (!item) return prev;

      if (prev.userItems.has(id)) {
        const next = { ...prev, equippedItem: prev.equippedItem === id ? null : id };
        toast(next.equippedItem ? `${item.name} equipped!` : `${item.name} unequipped`);
        return next;
      }

      if (prev.user!.coins < item.price) {
        toast(`Not enough coins! Need ${item.price}, have ${prev.user!.coins}`);
        return prev;
      }

      const next = { ...prev, user: { ...prev.user!, coins: prev.user!.coins - item.price }, userItems: new Set([...prev.userItems, id]) };
      toast(`✓ Purchased ${item.name}!`);
      const newBadges = checkNewBadges(next);
      newBadges.forEach(b => { next.userBadges = new Set([...next.userBadges, b]); });
      return next;
    });
  }, []);

  const onReset = useCallback(() => setShowConfirm(true), []);

  const confirmReset = useCallback(() => {
    clearState();
    setState(null);
    setShowConfirm(false);
    setWorkspace('calendar');
  }, []);

  if (!state?.user) {
    return <Onboarding onComplete={onOnboard} />;
  }

  const mcqTask = mcqTaskId ? state.tasks.find(t => t.id === mcqTaskId) : null;

  return (
    <div className="flex h-screen w-full">
      {/* Left: Character Panel */}
      <div className="max-md:hidden">
        <CharacterPanel user={state.user} tasks={state.tasks} equippedItem={state.equippedItem} />
      </div>

      {/* Center: Workspace */}
      <main className="flex-1 bg-background overflow-y-auto p-[22px] max-md:pb-[66px]">
        {workspace === 'calendar' && <CalendarWorkspace tasks={state.tasks} onComplete={completeTask} />}
        {workspace === 'tasks' && <TasksWorkspace tasks={state.tasks} onComplete={completeTask} />}
        {workspace === 'badges' && <BadgesWorkspace tasks={state.tasks} user={state.user} userBadges={state.userBadges} userItems={state.userItems} />}
        {workspace === 'shop' && <ShopWorkspace user={state.user} userItems={state.userItems} equippedItem={state.equippedItem} onBuy={shopBuy} />}
        {workspace === 'profile' && <ProfileWorkspace user={state.user} tasks={state.tasks} onReset={onReset} />}
      </main>

      {/* Right: Icon Rail */}
      <IconRail active={workspace} onSwitch={setWorkspace} />

      {/* MCQ Modal */}
      {mcqTask && (
        <McqModal task={mcqTask} onCorrect={onMcqCorrect} onClose={() => setMcqTaskId(null)} />
      )}

      {/* Confirm Reset Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-foreground/70 flex items-center justify-center z-[200]">
          <div className="bg-surface border-2 border-nemo-red p-[28px] w-[400px] max-w-[95vw]">
            <div className="font-pixel text-[9px] text-nemo-red mb-[10px]">⚠ DESTRUCTIVE ACTION</div>
            <div className="text-[12px] text-muted-foreground leading-[1.6] mb-[18px]">
              This permanently deletes your current plan, task progress, coins, streak, and all earned data. There is no undo.
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="font-pixel text-[7px] p-[9px_14px] bg-transparent text-muted-foreground border-[1.5px] border-border cursor-pointer flex-1">CANCEL</button>
              <button onClick={confirmReset} className="font-pixel text-[7px] p-[9px_14px] bg-nemo-red text-primary-foreground border-none cursor-pointer flex-1">RESET EVERYTHING</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
