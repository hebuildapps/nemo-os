import React, { useState, useCallback } from 'react';
import { WorkspaceId } from '@/lib/nemo-data';
import { useAuth } from '@/hooks/useAuth';
import { useNemoData } from '@/hooks/useNemoData';
import CharacterPanel from '@/components/CharacterPanel';
import IconRail from '@/components/IconRail';
import CalendarWorkspace from '@/components/CalendarWorkspace';
import TasksWorkspace from '@/components/TasksWorkspace';
import BadgesWorkspace from '@/components/BadgesWorkspace';
import ShopWorkspace from '@/components/ShopWorkspace';
import ProfileWorkspace from '@/components/ProfileWorkspace';
import Onboarding from '@/components/Onboarding';
import AuthPage from '@/components/AuthPage';
import McqModal from '@/components/McqModal';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const nemo = useNemoData();
  const [workspace, setWorkspace] = useState<WorkspaceId>('calendar');
  const [mcqTaskId, setMcqTaskId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleComplete = useCallback((id: string) => {
    const task = nemo.tasks.find(t => t.id === id);
    if (!task || task.completed) return;

    if (task.is_break) {
      nemo.completeTask(id, false).then(() => {
        toast(`☕ Break day logged! +${task.coins_reward} coin`);
      });
      return;
    }
    setMcqTaskId(id);
  }, [nemo]);

  const onMcqCorrect = useCallback(() => {
    if (!mcqTaskId) return;
    const task = nemo.tasks.find(t => t.id === mcqTaskId);
    setMcqTaskId(null);
    nemo.completeTask(mcqTaskId, true).then(() => {
      toast(`✓ +${task?.coins_reward ?? 5} coins! Task complete.`);
    });
  }, [mcqTaskId, nemo]);

  const handleShopBuy = useCallback((id: string, price: number) => {
    if (!nemo.profile) return;
    if (nemo.profile.coins < price) {
      toast(`Not enough coins! Need ${price}, have ${nemo.profile.coins}`);
      return;
    }
    nemo.purchaseItem(id, price).then(() => toast('✓ Purchased!'));
  }, [nemo]);

  const handleEquip = useCallback((id: string | null) => {
    nemo.equipItem(id);
  }, [nemo]);

  const handleOnboard = useCallback(async (name: string, date: string, role: string, hours: number, ref: string) => {
    await nemo.generatePlan(date, role, hours, name, ref || undefined);
    if (ref) toast('🪙 +50 COINS! Referral code applied.');
  }, [nemo]);

  const confirmReset = useCallback(async () => {
    await nemo.resetPlan();
    setShowConfirm(false);
    setWorkspace('calendar');
    toast('Plan reset complete.');
  }, [nemo]);

  // Loading state
  if (authLoading || (user && nemo.loading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="font-pixel text-[10px] text-muted-foreground">LOADING NEMO OS...</div>
      </div>
    );
  }

  // Not logged in
  if (!user) return <AuthPage />;

  // Onboarding needed
  if (nemo.profile && !nemo.profile.onboarding_complete) {
    return (
      <div className="flex h-screen w-full">
        <Onboarding onComplete={handleOnboard} />
      </div>
    );
  }

  // Profile not ready yet
  if (!nemo.profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="font-pixel text-[10px] text-muted-foreground">INITIALIZING...</div>
      </div>
    );
  }

  const mcqTask = mcqTaskId ? nemo.tasks.find(t => t.id === mcqTaskId) : null;

  return (
    <div className="flex h-screen w-full">
      {/* Left: Character Panel */}
      <div className="max-md:hidden">
        <CharacterPanel profile={nemo.profile} tasks={nemo.tasks} />
      </div>

      {/* Center: Workspace */}
      <main className="flex-1 bg-background overflow-y-auto p-[22px] max-md:pb-[66px]">
        {workspace === 'calendar' && <CalendarWorkspace tasks={nemo.tasks} onComplete={handleComplete} />}
        {workspace === 'tasks' && <TasksWorkspace tasks={nemo.tasks} onComplete={handleComplete} />}
        {workspace === 'badges' && <BadgesWorkspace badges={nemo.badges} userBadges={nemo.userBadges} />}
        {workspace === 'shop' && (
          <ShopWorkspace
            profile={nemo.profile}
            shopItems={nemo.shopItems}
            userItems={nemo.userItems}
            onBuy={handleShopBuy}
            onEquip={handleEquip}
          />
        )}
        {workspace === 'profile' && (
          <ProfileWorkspace profile={nemo.profile} tasks={nemo.tasks} onReset={() => setShowConfirm(true)} />
        )}
      </main>

      {/* Right: Icon Rail */}
      <IconRail active={workspace} onSwitch={setWorkspace} />

      {/* MCQ Modal */}
      {mcqTask && (
        <McqModal task={mcqTask} onCorrect={onMcqCorrect} onClose={() => setMcqTaskId(null)} />
      )}

      {/* Confirm Reset */}
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
