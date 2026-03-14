import { Task, User, BADGE_DEFS, fmt, generatePlan } from './nemo-data';

export interface NemoState {
  user: User | null;
  tasks: Task[];
  userBadges: Set<string>;
  userItems: Set<string>;
  equippedItem: string | null;
}

const STORAGE_KEY = 'nemo_os';

export function saveState(state: NemoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: state.user,
      tasks: state.tasks,
      userBadges: [...state.userBadges],
      userItems: [...state.userItems],
      equippedItem: state.equippedItem,
    }));
  } catch {}
}

export function loadState(): NemoState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d.user) return null;
    return {
      user: d.user,
      tasks: d.tasks,
      userBadges: new Set(d.userBadges || []),
      userItems: new Set(d.userItems || []),
      equippedItem: d.equippedItem || null,
    };
  } catch {
    return null;
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function createInitialState(name: string, date: string, role: string, hours: number, refCode: string): NemoState {
  const code = Math.random().toString(36).substr(2, 6).toUpperCase();
  const startCoins = refCode ? 50 : 0;

  const user: User = {
    name: name.toUpperCase(),
    placementDate: date,
    targetRole: role,
    hoursPerDay: hours,
    currentStage: 'Foundations',
    coins: startCoins,
    totalEarned: startCoins,
    streak: 0,
    referralCode: code,
    referredBy: refCode || null,
    lastActive: '',
    createdAt: new Date().toISOString().split('T')[0],
  };

  return {
    user,
    tasks: generatePlan(user),
    userBadges: new Set(),
    userItems: new Set(),
    equippedItem: null,
  };
}

export function checkNewBadges(state: NemoState): string[] {
  if (!state.user) return [];
  const newBadges: string[] = [];
  BADGE_DEFS.forEach(b => {
    if (!state.userBadges.has(b.id) && b.chk(state.tasks, state.user!, state.userItems)) {
      newBadges.push(b.id);
    }
  });
  return newBadges;
}

export function updateStreak(state: NemoState): { streakBonus: number; message: string | null } {
  if (!state.user) return { streakBonus: 0, message: null };
  const today = fmt(new Date());
  if (state.user.lastActive === today) return { streakBonus: 0, message: null };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yd = fmt(yesterday);

  if (state.user.lastActive === yd) {
    state.user.streak++;
    if (state.user.streak % 5 === 0) {
      return { streakBonus: 20, message: `🔥 ${state.user.streak}-DAY STREAK! +20 bonus coins!` };
    }
  } else {
    state.user.streak = 1;
  }
  state.user.lastActive = today;
  return { streakBonus: 0, message: null };
}
