import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { TASK_TEMPLATES, STAGES, STAGE_KEYS, STAGE_WEIGHTS, STAGE_BREAKS } from '@/lib/nemo-data';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type BadgeRow = Database['public']['Tables']['badges']['Row'];
type UserBadgeRow = Database['public']['Tables']['user_badges']['Row'];
type ShopItemRow = Database['public']['Tables']['shop_items']['Row'];
type UserItemRow = Database['public']['Tables']['user_items']['Row'];

export interface NemoData {
  profile: Profile | null;
  tasks: TaskRow[];
  badges: BadgeRow[];
  userBadges: UserBadgeRow[];
  shopItems: ShopItemRow[];
  userItems: UserItemRow[];
  loading: boolean;
  refetch: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  completeTask: (taskId: string, mcqVerified: boolean) => Promise<void>;
  purchaseItem: (itemId: string, price: number) => Promise<void>;
  equipItem: (itemId: string | null) => Promise<void>;
  generatePlan: (placementDate: string, targetRole: string, hoursPerDay: number, name: string, gender: 'boy' | 'girl', referredBy?: string) => Promise<void>;
  resetPlan: () => Promise<void>;
}

function fmt(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function useNemoData(): NemoData {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadgeRow[]>([]);
  const [shopItems, setShopItems] = useState<ShopItemRow[]>([]);
  const [userItems, setUserItems] = useState<UserItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const fetchAll = useCallback(async (showLoader = false) => {
    if (!user) {
      setProfile(null);
      setTasks([]);
      setBadges([]);
      setUserBadges([]);
      setShopItems([]);
      setUserItems([]);
      setLoading(false);
      hasLoadedRef.current = false;
      return;
    }

    if (showLoader || !hasLoadedRef.current) {
      setLoading(true);
    }

    const [profileRes, tasksRes, badgesRes, userBadgesRes, shopRes, itemsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('tasks').select('*').eq('user_id', user.id).order('date'),
      supabase.from('badges').select('*').order('sort_order'),
      supabase.from('user_badges').select('*').eq('user_id', user.id),
      supabase.from('shop_items').select('*').order('sort_order'),
      supabase.from('user_items').select('*').eq('user_id', user.id),
    ]);

    setProfile(profileRes.data ?? null);
    setTasks(tasksRes.data ?? []);
    setBadges(badgesRes.data ?? []);
    setUserBadges(userBadgesRes.data ?? []);
    setShopItems(shopRes.data ?? []);
    setUserItems(itemsRes.data ?? []);

    setLoading(false);
    hasLoadedRef.current = true;
  }, [user]);

  useEffect(() => { fetchAll(true); }, [fetchAll]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return;
    const { data } = await supabase.from('profiles').update(updates).eq('user_id', user.id).select().single();
    if (data) setProfile(data);
  }, [user]);

  const completeTask = useCallback(async (taskId: string, mcqVerified: boolean) => {
    if (!user || !profile) return;

    const currentCoins = Number(profile.coins ?? 0);
    const currentTotalEarned = Number(profile.total_earned ?? 0);
    const currentStreak = Number(profile.streak ?? 0);

    // Update task
    await supabase.from('tasks').update({ completed: true, mcq_verified: mcqVerified }).eq('id', taskId);

    // Find task to get coins
    const task = tasks.find(t => t.id === taskId);
    const coinReward = task?.coins_reward ?? 5;
    const hasBoost = userItems.some(i => i.item_id === 'coin_boost');
    const actualCoins = coinReward * (hasBoost ? 2 : 1);

    // Update streak
    const today = fmt(new Date());
    let newStreak = currentStreak;
    let streakBonus = 0;
    if (profile.last_active !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (profile.last_active === fmt(yesterday)) {
        newStreak = currentStreak + 1;
        if (newStreak % 5 === 0) streakBonus = 20;
      } else {
        newStreak = 1;
      }
    }

    const totalBonus = actualCoins + streakBonus;

    await updateProfile({
      coins: currentCoins + totalBonus,
      total_earned: currentTotalEarned + totalBonus,
      streak: newStreak,
      last_active: today,
    });

    // Check badges
    const completedCount = tasks.filter(t => t.completed).length + 1;
    const badgeChecks: { id: string; condition: boolean }[] = [
      { id: 'first_task', condition: completedCount >= 1 },
      { id: 'tasks10', condition: completedCount >= 10 },
      { id: 'tasks50', condition: completedCount >= 50 },
      { id: 'streak5', condition: newStreak >= 5 },
      { id: 'streak30', condition: newStreak >= 30 },
      { id: 'coins100', condition: (currentCoins + totalBonus) >= 100 },
      { id: 'coins_earned_200', condition: (currentTotalEarned + totalBonus) >= 200 },
    ];

    // Check stage completion
    if (task) {
      const stageTasks = tasks.filter(t => t.stage === task.stage && !t.is_break);
      const stageAllDone = stageTasks.every(t => t.completed || t.id === taskId);
      if (task.stage === 'Foundations' && stageAllDone) badgeChecks.push({ id: 'stage_foundations', condition: true });
      if (task.stage === 'Core DSA' && stageAllDone) badgeChecks.push({ id: 'stage_coredsa', condition: true });
    }

    const existingBadgeIds = new Set(userBadges.map(b => b.badge_id));
    for (const check of badgeChecks) {
      if (check.condition && !existingBadgeIds.has(check.id)) {
        await supabase.from('user_badges').insert({ user_id: user.id, badge_id: check.id });
      }
    }

    await fetchAll(false);
  }, [user, profile, tasks, userBadges, userItems, updateProfile, fetchAll]);

  const purchaseItem = useCallback(async (itemId: string, price: number) => {
    if (!user || !profile) return;
    const currentCoins = Number(profile.coins ?? 0);
    if (currentCoins < price) return;

    const { error: itemInsertError } = await supabase
      .from('user_items')
      .insert({ user_id: user.id, item_id: itemId });

    if (itemInsertError) {
      throw itemInsertError;
    }

    const { data: updatedProfile, error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        coins: currentCoins - price,
        equipped_item: itemId,
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (profileUpdateError) {
      throw profileUpdateError;
    }

    if (updatedProfile) {
      setProfile(updatedProfile);
    }

    // Check shopper badge
    const existingBadgeIds = new Set(userBadges.map(b => b.badge_id));
    if (!existingBadgeIds.has('shopper')) {
      await supabase.from('user_badges').insert({ user_id: user.id, badge_id: 'shopper' });
    }

    await fetchAll(false);
  }, [user, profile, userBadges, fetchAll]);

  const equipItem = useCallback(async (itemId: string | null) => {
    await updateProfile({ equipped_item: itemId });
  }, [updateProfile]);

  const generatePlan = useCallback(async (placementDate: string, targetRole: string, hoursPerDay: number, name: string, gender: 'boy' | 'girl', referredBy?: string) => {
    if (!user) return;

    const startCoins = referredBy ? 50 : 0;

    // Update profile
    await updateProfile({
      name: name.toUpperCase(),
      placement_date: placementDate,
      target_role: targetRole,
      hours_per_day: hoursPerDay,
      gender,
      coins: startCoins,
      total_earned: startCoins,
      referred_by: referredBy || null,
      onboarding_complete: true,
    });

    // Generate tasks
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(placementDate); end.setHours(0, 0, 0, 0);
    const totalDays = Math.max(7, Math.round((end.getTime() - start.getTime()) / 864e5));

    let prepDays = totalDays;
    STAGE_BREAKS.forEach(b => (prepDays -= b));
    prepDays = Math.max(5, prepDays);

    const stageDaysArr = STAGE_WEIGHTS.map(w => Math.max(3, Math.round(w * prepDays)));
    const cur = new Date(start);
    const taskInserts: any[] = [];

    STAGES.forEach((stage, si) => {
      const key = STAGE_KEYS[si];
      const tpls = TASK_TEMPLATES[key] || [];
      const days = stageDaysArr[si];

      for (let d = 0; d < days; d++) {
        const dt = new Date(cur);
        const tpl = tpls[d % tpls.length];
        taskInserts.push({
          user_id: user.id,
          date: fmt(dt),
          title: tpl.t,
          description: tpl.d,
          stage,
          stage_key: key,
          difficulty: tpl.diff,
          is_break: false,
          coins_reward: 5,
        });
        cur.setDate(cur.getDate() + 1);
      }

      const bk = STAGE_BREAKS[si];
      for (let b = 0; b < bk; b++) {
        const dt = new Date(cur);
        taskInserts.push({
          user_id: user.id,
          date: fmt(dt),
          title: 'BREAK DAY',
          description: 'Rest, reflect, and recharge. Review weak areas or simply take a well-earned break.',
          stage,
          stage_key: 'break',
          difficulty: 'easy',
          is_break: true,
          coins_reward: 1,
        });
        cur.setDate(cur.getDate() + 1);
      }
    });

    // Insert in batches of 50
    for (let i = 0; i < taskInserts.length; i += 50) {
      await supabase.from('tasks').insert(taskInserts.slice(i, i + 50));
    }

    await fetchAll(false);
  }, [user, updateProfile, fetchAll]);

  const resetPlan = useCallback(async () => {
    if (!user) return;
    await supabase.from('tasks').delete().eq('user_id', user.id);
    await supabase.from('user_badges').delete().eq('user_id', user.id);
    await supabase.from('user_items').delete().eq('user_id', user.id);
    await updateProfile({
      coins: 0, total_earned: 0, streak: 0, last_active: null,
      equipped_item: null, onboarding_complete: false, current_stage: 'Foundations',
    });
    await fetchAll(false);
  }, [user, updateProfile, fetchAll]);

  return {
    profile, tasks, badges, userBadges, shopItems, userItems, loading,
    refetch: () => fetchAll(false), updateProfile, completeTask, purchaseItem, equipItem,
    generatePlan, resetPlan,
  };
}
