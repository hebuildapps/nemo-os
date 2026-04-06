import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { TASK_TEMPLATES, STAGES, STAGE_KEYS, STAGE_WEIGHTS, STAGE_BREAKS } from '@/lib/nemo-data';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type BadgeRow = Database['public']['Tables']['badges']['Row'];
type UserBadgeRow = Database['public']['Tables']['user_badges']['Row'];
type ShopItemRow = Database['public']['Tables']['shop_items']['Row'];
type UserItemRow = Database['public']['Tables']['user_items']['Row'];
type ProfileWithGems = Profile & {
  gems?: number;
  total_gems_earned?: number;
  earned_gems?: number;
  lifetime_gems?: number;
};

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
  generatePlan: (placementDate: string, goal: string, name: string, gender: 'boy' | 'girl', referredBy?: string) => Promise<void>;
  resetPlan: () => Promise<void>;
}

type DifficultyValue = 'easy' | 'medium' | 'hard';

interface GeneratedPlanTask {
  title: string;
  description: string;
  difficulty: DifficultyValue;
}

interface GeneratedPlanStage {
  id: number;
  name: string;
  days: number;
  tasks: GeneratedPlanTask[];
}

interface GeneratedPlanResponse {
  stages: GeneratedPlanStage[];
}

function fmt(d: Date): string {
  return d.toISOString().split('T')[0];
}

const backendBaseUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '');
const GENERATE_PLAN_ENDPOINT = backendBaseUrl ? `${backendBaseUrl}/api/generate-plan` : '/api/generate-plan';

const isValidDifficulty = (value: unknown): value is DifficultyValue =>
  value === 'easy' || value === 'medium' || value === 'hard';

const stageKeyFromName = (name: string): string => {
  const key = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return key || 'stage';
};

const buildFallbackTaskInserts = (userId: string, placementDate: string): TaskInsert[] => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(placementDate);
  end.setHours(0, 0, 0, 0);
  const totalDays = Math.max(7, Math.round((end.getTime() - start.getTime()) / 864e5));

  let prepDays = totalDays;
  STAGE_BREAKS.forEach(b => (prepDays -= b));
  prepDays = Math.max(5, prepDays);

  const stageDaysArr = STAGE_WEIGHTS.map(w => Math.max(3, Math.round(w * prepDays)));
  const cur = new Date(start);
  const taskInserts: TaskInsert[] = [];

  STAGES.forEach((stage, si) => {
    const key = STAGE_KEYS[si];
    const tpls = TASK_TEMPLATES[key] || [];
    const days = stageDaysArr[si];

    for (let d = 0; d < days; d++) {
      const dt = new Date(cur);
      const tpl = tpls[d % tpls.length];
      taskInserts.push({
        user_id: userId,
        date: fmt(dt),
        title: tpl.t,
        description: tpl.d,
        stage,
        stage_key: key,
        difficulty: tpl.diff,
        is_break: false,
        coins_reward: 5,
        completed: false,
        mcq_verified: false,
      });
      cur.setDate(cur.getDate() + 1);
    }

    const bk = STAGE_BREAKS[si];
    for (let b = 0; b < bk; b++) {
      const dt = new Date(cur);
      taskInserts.push({
        user_id: userId,
        date: fmt(dt),
        title: 'BREAK DAY',
        description: 'Rest, reflect, and recharge. Review weak areas or simply take a well-earned break.',
        stage,
        stage_key: 'break',
        difficulty: 'easy',
        is_break: true,
        coins_reward: 1,
        completed: false,
        mcq_verified: false,
      });
      cur.setDate(cur.getDate() + 1);
    }
  });

  return taskInserts;
};

const isValidGeneratedPlan = (value: unknown): value is GeneratedPlanResponse => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<GeneratedPlanResponse>;
  if (!Array.isArray(candidate.stages) || candidate.stages.length !== 5) return false;

  return candidate.stages.every((stage): stage is GeneratedPlanStage => {
    if (!stage || typeof stage !== 'object') return false;
    if (typeof stage.id !== 'number') return false;
    if (typeof stage.name !== 'string' || !stage.name.trim()) return false;
    if (typeof stage.days !== 'number' || !Number.isFinite(stage.days) || stage.days < 1) return false;
    if (!Array.isArray(stage.tasks) || stage.tasks.length !== 5) return false;

    return stage.tasks.every(task => (
      task &&
      typeof task.title === 'string' &&
      !!task.title.trim() &&
      typeof task.description === 'string' &&
      !!task.description.trim() &&
      isValidDifficulty(task.difficulty)
    ));
  });
};

const fetchGeneratedPlan = async (goal: string, daysAvailable: number): Promise<GeneratedPlanResponse | null> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(GENERATE_PLAN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goal,
        days_available: daysAvailable,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    if (!isValidGeneratedPlan(payload)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const buildGeneratedTaskInserts = (userId: string, stages: GeneratedPlanStage[]): TaskInsert[] => {
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);

  const taskInserts: TaskInsert[] = [];

  stages.forEach((stage, stageIndex) => {
    const stageName = stage.name.trim();
    const stageKey = stageKeyFromName(stageName);
    const stageDays = Math.max(1, Math.round(stage.days));

    for (let day = 0; day < stageDays; day += 1) {
      const dt = new Date(cur);
      const template = stage.tasks[day % stage.tasks.length];

      taskInserts.push({
        user_id: userId,
        date: fmt(dt),
        title: template.title.trim(),
        description: template.description.trim(),
        stage: stageName,
        stage_key: stageKey,
        difficulty: template.difficulty,
        is_break: false,
        coins_reward: 5,
        completed: false,
        mcq_verified: false,
      });

      cur.setDate(cur.getDate() + 1);
    }

    const breakDays = STAGE_BREAKS[stageIndex] ?? 0;
    for (let breakIndex = 0; breakIndex < breakDays; breakIndex += 1) {
      const dt = new Date(cur);
      taskInserts.push({
        user_id: userId,
        date: fmt(dt),
        title: 'BREAK DAY',
        description: 'Rest, reflect, and recharge. Review weak areas or simply take a well-earned break.',
        stage: stageName,
        stage_key: 'break',
        difficulty: 'easy',
        is_break: true,
        coins_reward: 1,
        completed: false,
        mcq_verified: false,
      });
      cur.setDate(cur.getDate() + 1);
    }
  });

  return taskInserts;
};

const readGems = (value: Profile | null): number => {
  const candidate = value as ProfileWithGems | null;
  return Number(candidate?.gems ?? candidate?.coins ?? 0);
};

const readTotalEarned = (value: Profile | null): number => {
  const candidate = value as ProfileWithGems | null;
  return Number(
    candidate?.total_earned
    ?? candidate?.total_gems_earned
    ?? candidate?.earned_gems
    ?? candidate?.lifetime_gems
    ?? readGems(value),
  );
};

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
  const currencyColumnRef = useRef<'coins' | 'gems'>('coins');
  const totalEarnedColumnRef = useRef<'total_earned' | 'total_gems_earned' | null>('total_earned');

  const syncCurrencyColumn = (value: unknown) => {
    if (!value || typeof value !== 'object') return;
    if (Object.prototype.hasOwnProperty.call(value, 'gems')) {
      currencyColumnRef.current = 'gems';
      return;
    }
    if (Object.prototype.hasOwnProperty.call(value, 'coins')) {
      currencyColumnRef.current = 'coins';
    }
  };

  const syncTotalEarnedColumn = (value: unknown) => {
    if (!value || typeof value !== 'object') return;

    if (Object.prototype.hasOwnProperty.call(value, 'total_earned')) {
      totalEarnedColumnRef.current = 'total_earned';
      return;
    }

    if (Object.prototype.hasOwnProperty.call(value, 'total_gems_earned')) {
      totalEarnedColumnRef.current = 'total_gems_earned';
      return;
    }

    totalEarnedColumnRef.current = null;
  };

  const buildTotalEarnedUpdate = (value: number): Record<string, number> => {
    if (totalEarnedColumnRef.current === 'total_gems_earned') {
      return { total_gems_earned: value };
    }
    if (totalEarnedColumnRef.current === 'total_earned') {
      return { total_earned: value };
    }
    return {};
  };

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

    if (profileRes.data) {
      syncCurrencyColumn(profileRes.data);
      syncTotalEarnedColumn(profileRes.data);
    }

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

    const payload = { ...(updates as Record<string, unknown>) };

    if ('total_earned' in payload && totalEarnedColumnRef.current !== 'total_earned') {
      const nextValue = payload.total_earned;
      delete payload.total_earned;
      if (totalEarnedColumnRef.current === 'total_gems_earned') {
        payload.total_gems_earned = nextValue;
      }
    }

    const runUpdate = async (currentPayload: Record<string, unknown>) =>
      supabase.from('profiles').update(currentPayload).eq('user_id', user.id).select().single();

    let { data, error } = await runUpdate(payload);

    if (error && /\btotal_earned\b/i.test(error.message || '') && Object.prototype.hasOwnProperty.call(payload, 'total_earned')) {
      totalEarnedColumnRef.current = null;
      delete payload.total_earned;
      if (Object.keys(payload).length > 0) {
        const retry = await runUpdate(payload);
        data = retry.data;
        error = retry.error;
      } else {
        error = null;
      }
    }

    if (error && /\btotal_gems_earned\b/i.test(error.message || '') && Object.prototype.hasOwnProperty.call(payload, 'total_gems_earned')) {
      totalEarnedColumnRef.current = null;
      delete payload.total_gems_earned;
      if (Object.keys(payload).length > 0) {
        const retry = await runUpdate(payload);
        data = retry.data;
        error = retry.error;
      } else {
        error = null;
      }
    }

    if (error) {
      throw new Error(error.message || 'Failed to update profile');
    }

    if (data) {
      syncCurrencyColumn(data);
      syncTotalEarnedColumn(data);
      setProfile(data);
    }
  }, [user]);

  const completeTask = useCallback(async (taskId: string, mcqVerified: boolean) => {
    if (!user || !profile) return;

    const currentGems = readGems(profile);
    const currentTotalEarned = readTotalEarned(profile);
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
      [currencyColumnRef.current]: currentGems + totalBonus,
      ...buildTotalEarnedUpdate(currentTotalEarned + totalBonus),
      streak: newStreak,
      last_active: today,
    } as Partial<Profile>);

    // Check badges
    const completedCount = tasks.filter(t => t.completed).length + 1;
    const badgeChecks: { id: string; condition: boolean }[] = [
      { id: 'first_task', condition: completedCount >= 1 },
      { id: 'tasks10', condition: completedCount >= 10 },
      { id: 'tasks50', condition: completedCount >= 50 },
      { id: 'streak5', condition: newStreak >= 5 },
      { id: 'streak30', condition: newStreak >= 30 },
      { id: 'coins100', condition: (currentGems + totalBonus) >= 100 },
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
    const currentGems = readGems(profile);
    if (currentGems < price) return;

    const { error: itemInsertError } = await supabase
      .from('user_items')
      .insert({ user_id: user.id, item_id: itemId });

    if (itemInsertError) {
      throw itemInsertError;
    }

    const { data: updatedProfile, error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        [currencyColumnRef.current]: currentGems - price,
        equipped_item: itemId,
      } as Record<string, unknown>)
      .eq('user_id', user.id)
      .select()
      .single();

    if (profileUpdateError) {
      throw profileUpdateError;
    }

    if (updatedProfile) {
      syncCurrencyColumn(updatedProfile);
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

  const generatePlan = useCallback(async (placementDate: string, goal: string, name: string, gender: 'boy' | 'girl', referredBy?: string) => {
    if (!user) return;

    const startGems = referredBy ? 50 : 0;
    const defaultHoursPerDay = 4;

    const baseProfilePayload = {
      user_id: user.id,
      name: name.toUpperCase(),
      placement_date: placementDate,
      target_role: goal,
      hours_per_day: defaultHoursPerDay,
      gender,
      referred_by: referredBy || null,
      onboarding_complete: true,
      current_stage: 'Foundations',
    };

    let activeCurrencyColumn: 'coins' | 'gems' = currencyColumnRef.current;
    let activeTotalColumn: 'total_earned' | 'total_gems_earned' | null = totalEarnedColumnRef.current;
    let profileData: Profile | null = null;
    let profileError: Error | null = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const upsertPayload: Record<string, unknown> = {
        ...baseProfilePayload,
        [activeCurrencyColumn]: startGems,
      };

      if (activeTotalColumn === 'total_earned') {
        upsertPayload.total_earned = startGems;
      } else if (activeTotalColumn === 'total_gems_earned') {
        upsertPayload.total_gems_earned = startGems;
      }

      const result = await supabase
        .from('profiles')
        .upsert(upsertPayload, { onConflict: 'user_id' })
        .select()
        .single();

      if (!result.error) {
        profileData = result.data;
        profileError = null;
        break;
      }

      const message = result.error.message || '';

      if (activeCurrencyColumn === 'coins' && /\bcoins\b/i.test(message)) {
        activeCurrencyColumn = 'gems';
        continue;
      }

      if (activeCurrencyColumn === 'gems' && /\bgems\b/i.test(message)) {
        activeCurrencyColumn = 'coins';
        continue;
      }

      if (activeTotalColumn === 'total_earned' && /\btotal_earned\b/i.test(message)) {
        activeTotalColumn = null;
        continue;
      }

      if (activeTotalColumn === 'total_gems_earned' && /\btotal_gems_earned\b/i.test(message)) {
        activeTotalColumn = null;
        continue;
      }

      profileError = new Error(message || 'Failed to save onboarding profile');
      break;
    }

    if (profileData) {
      currencyColumnRef.current = activeCurrencyColumn;
      totalEarnedColumnRef.current = activeTotalColumn;
    }

    if (profileError) {
      throw new Error(profileError.message || 'Failed to save onboarding profile');
    }

    if (profileData) {
      syncCurrencyColumn(profileData);
      syncTotalEarnedColumn(profileData);
      setProfile(profileData);
    }

    const { error: clearTasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', user.id);

    if (clearTasksError) {
      throw new Error(clearTasksError.message || 'Failed to reset existing tasks');
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(placementDate);
    end.setHours(0, 0, 0, 0);
    const totalDays = Math.max(7, Math.round((end.getTime() - start.getTime()) / 864e5));

    const generatedPlan = await fetchGeneratedPlan(goal, totalDays);
    const taskInserts = generatedPlan
      ? buildGeneratedTaskInserts(user.id, generatedPlan.stages)
      : buildFallbackTaskInserts(user.id, placementDate);

    // Insert in batches of 50
    for (let i = 0; i < taskInserts.length; i += 50) {
      const { error: taskInsertError } = await supabase.from('tasks').insert(taskInserts.slice(i, i + 50));
      if (taskInsertError) {
        throw new Error(taskInsertError.message || 'Failed to generate tasks');
      }
    }

    await fetchAll(false);
  }, [user, fetchAll]);

  const resetPlan = useCallback(async () => {
    if (!user) return;
    await supabase.from('tasks').delete().eq('user_id', user.id);
    await supabase.from('user_badges').delete().eq('user_id', user.id);
    await supabase.from('user_items').delete().eq('user_id', user.id);
    await updateProfile({
      [currencyColumnRef.current]: 0,
      ...buildTotalEarnedUpdate(0),
      streak: 0,
      last_active: null,
      equipped_item: null, onboarding_complete: false, current_stage: 'Foundations',
    } as Partial<Profile>);
    await fetchAll(false);
  }, [user, updateProfile, fetchAll]);

  return {
    profile, tasks, badges, userBadges, shopItems, userItems, loading,
    refetch: () => fetchAll(false), updateProfile, completeTask, purchaseItem, equipItem,
    generatePlan, resetPlan,
  };
}
