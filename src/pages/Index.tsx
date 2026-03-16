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

const FramedViewport: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-dvh w-full bg-background px-[10vw] py-[10vh] max-md:p-0">
    <div className="mx-auto flex h-full w-full overflow-hidden bg-background rounded-xl border border-[#e3e1dd] bg-[#f6f6f5]">
      {children}
    </div>
  </div>
);

const Index: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const nemo = useNemoData();
  const [workspace, setWorkspace] = useState<WorkspaceId>('calendar');
  const [mcqTaskId, setMcqTaskId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [insufficientGems, setInsufficientGems] = useState<{ need: number; have: number } | null>(null);

  const handleComplete = useCallback((id: string) => {
    const task = nemo.tasks.find(t => t.id === id);
    if (!task || task.completed) return;

    if (task.is_break) {
      nemo.completeTask(id, false).then(() => {
        toast(`☕ Break day logged! +${task.coins_reward} gems`);
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
      toast(`✓ +${task?.coins_reward ?? 5} gems! Task complete.`);
    });
  }, [mcqTaskId, nemo]);

  const handleShopBuy = useCallback((id: string, price: number) => {
    if (!nemo.profile) return;
    const currentGems = Number(((nemo.profile as typeof nemo.profile & { gems?: number })?.gems ?? nemo.profile.coins ?? 0));
    if (currentGems < price) {
      setInsufficientGems({ need: price, have: currentGems });
      return;
    }
    nemo
      .purchaseItem(id, price)
      .then(() => toast('✓ Purchased and equipped!'))
      .catch(() => toast('Purchase failed. Please try again.'));
  }, [nemo]);

  const handleEquip = useCallback((id: string | null) => {
    nemo.equipItem(id);
  }, [nemo]);

  const handleOnboard = useCallback(async (gender: 'boy' | 'girl', name: string, date: string, role: string, hours: number, ref: string) => {
    await nemo.generatePlan(date, role, hours, name, gender, ref || undefined);
    if (ref) {
      toast(
        <span className="inline-flex items-center gap-1">
          <img
            src="/diamond.png"
            alt="gem"
            className="w-[16px] h-[16px] shrink-0"
            style={{ imageRendering: 'pixelated' }}
          />
          +50 GEMS! Referral code applied.
        </span>
      );
    }
  }, [nemo]);

  const confirmReset = useCallback(async () => {
    await nemo.resetPlan();
    setShowConfirm(false);
    setWorkspace('calendar');
    toast('Plan reset complete.');
  }, [nemo]);

  // Loading state
  if (authLoading || (user && nemo.loading && !nemo.profile)) {
    return (
      <FramedViewport>
        <div className="flex h-full w-full items-center justify-center bg-background">
          <div className="font-pixel text-[10px] text-muted-foreground">LOADING NEMO OS...</div>
        </div>
      </FramedViewport>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <FramedViewport>
        <AuthPage />
      </FramedViewport>
    );
  }

  // Onboarding needed
  if (nemo.profile && !nemo.profile.onboarding_complete) {
    return (
      <FramedViewport>
        <div className="flex h-full w-full">
          <Onboarding onComplete={handleOnboard} />
        </div>
      </FramedViewport>
    );
  }

  // Profile not ready yet
  if (!nemo.profile) {
    return (
      <FramedViewport>
        <div className="flex h-full w-full items-center justify-center bg-background">
          <div className="font-pixel text-[10px] text-muted-foreground">INITIALIZING...</div>
        </div>
      </FramedViewport>
    );
  }

  const mcqTask = mcqTaskId ? nemo.tasks.find(t => t.id === mcqTaskId) : null;
  const hideWorkspaceScrollbar = workspace === 'badges' || workspace === 'profile';

  return (
    <FramedViewport>
      <div className="flex h-full w-full bg-background overflow-hidden">
        {/* Left: Character Panel */}
        <div className="h-full max-md:hidden">
          <CharacterPanel profile={nemo.profile} tasks={nemo.tasks} />
        </div>

        {/* Center: Workspace */}
        <main className={`flex-1 h-full min-w-0 bg-[#cec8b8] overflow-y-auto px-[24px] py-[18px] max-md:pb-[72px] ${hideWorkspaceScrollbar ? 'hide-scrollbar' : ''}`}>
          <div className={workspace === 'calendar' ? 'h-full' : 'hidden h-full'}>
            <CalendarWorkspace tasks={nemo.tasks} onComplete={handleComplete} />
          </div>
          <div className={workspace === 'tasks' ? 'block' : 'hidden'}>
            <TasksWorkspace tasks={nemo.tasks} onComplete={handleComplete} />
          </div>
          <div className={workspace === 'badges' ? 'block' : 'hidden'}>
            <BadgesWorkspace
              badges={nemo.badges}
              userBadges={nemo.userBadges}
              profile={nemo.profile}
              tasks={nemo.tasks}
              userItems={nemo.userItems}
            />
          </div>
          <div className={workspace === 'shop' ? 'block' : 'hidden'}>
            <ShopWorkspace
              profile={nemo.profile}
              shopItems={nemo.shopItems}
              userItems={nemo.userItems}
              onBuy={handleShopBuy}
              onEquip={handleEquip}
            />
          </div>
          <div className={workspace === 'profile' ? 'block' : 'hidden'}>
            <ProfileWorkspace profile={nemo.profile} tasks={nemo.tasks} onReset={() => setShowConfirm(true)} />
          </div>
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
                This permanently deletes your current plan, task progress, gems, streak, and all earned data. There is no undo.
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirm(false)} className="font-pixel text-[7px] p-[9px_14px] bg-transparent text-muted-foreground border-[1.5px] border-border cursor-pointer flex-1">CANCEL</button>
                <button onClick={confirmReset} className="font-pixel text-[7px] p-[9px_14px] bg-nemo-red text-primary-foreground border-none cursor-pointer flex-1">RESET EVERYTHING</button>
              </div>
            </div>
          </div>
        )}

        {/* Insufficient Gems Modal */}
        {insufficientGems && (
          <div className="fixed inset-0 bg-foreground/70 flex items-center justify-center z-[210]">
            <div className="bg-surface border-2 border-border p-[24px] w-[360px] max-w-[95vw]">
              <div className="font-pixel text-[9px] text-foreground mb-[10px]">INSUFFICIENT GEMS</div>
              <div className="text-[12px] text-muted-foreground leading-[1.6] mb-[14px]">
                You need {insufficientGems.need} gems but currently have {insufficientGems.have}.
              </div>
              <div className="flex items-center gap-[8px] mb-[16px]">
                <img
                  src="/diamond.png"
                  alt="gems"
                  className="w-[18px] h-[18px] shrink-0"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="font-pixel text-[8px] text-coin">EARN MORE GEMS BY COMPLETING TASKS</span>
              </div>
              <button
                onClick={() => setInsufficientGems(null)}
                className="font-pixel text-[7px] p-[9px_14px] bg-transparent text-foreground border-[1.5px] border-border cursor-pointer w-full"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </FramedViewport>
  );
};

export default Index;
