// ===================== TYPES =====================
export type Difficulty = 'easy' | 'medium' | 'hard';
export type WorkspaceId = 'calendar' | 'tasks' | 'badges' | 'shop' | 'profile';

export interface Task {
  id: string;
  date: string;
  title: string;
  desc: string;
  stage: string;
  stageKey: string;
  diff: Difficulty;
  isBreak: boolean;
  coins: number;
  completed: boolean;
  mcqVerified: boolean;
}

export interface User {
  name: string;
  placementDate: string;
  targetRole: string;
  hoursPerDay: number;
  currentStage: string;
  coins: number;
  totalEarned: number;
  streak: number;
  referralCode: string;
  referredBy: string | null;
  lastActive: string;
  createdAt: string;
}

export interface BadgeDef {
  id: string;
  ico: string;
  name: string;
  desc: string;
  chk: (tasks: Task[], user: User, ownedItems: Set<string>) => boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  ico: string;
  type: string;
  desc: string;
}

// ===================== CONSTANTS =====================
export const STAGES = ['Foundations', 'Core DSA', 'Advanced DSA', 'CS Fundamentals', 'Mock & Revision'];
export const STAGE_KEYS = ['foundations', 'coredsa', 'advanceddsa', 'csfundamentals', 'mockrevision'];
export const STAGE_BREAKS = [2, 2, 3, 2, 0];
export const STAGE_WEIGHTS = [0.15, 0.25, 0.20, 0.20, 0.20];

export const TIERS = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ASCENDANT', 'IMMORTAL', 'RADIANT'];

export const TASK_TEMPLATES: Record<string, { t: string; d: string; diff: Difficulty }[]> = {
  foundations: [
    { t: 'Big-O Notation Basics', d: 'Study time and space complexity. Practice identifying O(n), O(n²), O(log n) patterns.', diff: 'easy' },
    { t: 'Arrays & Strings', d: 'Master sliding window and two-pointer techniques. Practice in-place array manipulation.', diff: 'easy' },
    { t: 'Linked Lists', d: "Implement singly and doubly linked lists. Practice reversal, cycle detection (Floyd's), and merging.", diff: 'medium' },
    { t: 'Stacks & Queues', d: 'Implement using arrays and linked lists. Solve monotonic stack problems and bracket matching.', diff: 'medium' },
    { t: 'Recursion & Backtracking', d: 'Visualize recursion trees. Solve N-Queens, permutations, and combination sum problems.', diff: 'medium' },
    { t: 'Sorting Algorithms', d: 'Implement bubble, insertion, merge, quicksort. Understand in-place vs. stable sort trade-offs.', diff: 'medium' },
  ],
  coredsa: [
    { t: 'Binary Search', d: 'Master the standard template. Solve rotated sorted array, find peak element, and search range.', diff: 'medium' },
    { t: 'Hash Maps & Sets', d: 'Practice frequency maps, two-sum patterns, group anagrams, and sliding window with hash.', diff: 'medium' },
    { t: 'Trees — Traversal', d: 'BFS, DFS, level-order. Solve tree height, diameter, lowest common ancestor.', diff: 'medium' },
    { t: 'Binary Search Trees', d: 'Insert, delete, search operations. Validate BST property, find kth smallest element.', diff: 'medium' },
    { t: 'Heaps & Priority Queues', d: 'Min/max heap operations. Top K elements, merge K sorted lists, median finder.', diff: 'hard' },
    { t: 'Graphs — BFS & DFS', d: 'Adjacency list representation. Number of islands, course schedule, clone graph.', diff: 'medium' },
  ],
  advanceddsa: [
    { t: 'DP — 1D Problems', d: 'Fibonacci variants, climbing stairs, house robber, coin change. Master memoization and tabulation.', diff: 'hard' },
    { t: 'DP — 2D Problems', d: 'LCS, LIS, unique paths, knapsack. Grid-based DP patterns and state optimization.', diff: 'hard' },
    { t: 'Shortest Path Algorithms', d: "Dijkstra's, Bellman-Ford, Floyd-Warshall. Solve network delay time, cheap flights.", diff: 'hard' },
    { t: 'Advanced Graph Algorithms', d: "Topological sort (Kahn's), Union-Find, Kruskal's and Prim's MST algorithms.", diff: 'hard' },
    { t: 'Trie Data Structure', d: 'Implement trie with insert, search, startsWith. Solve word search II and autocomplete.', diff: 'hard' },
    { t: 'Sliding Window Advanced', d: 'Minimum window substring, longest subarray with k distinct, maximum fruits in baskets.', diff: 'hard' },
  ],
  csfundamentals: [
    { t: 'Operating Systems', d: 'Processes vs threads, scheduling algorithms, deadlock conditions, memory management, paging.', diff: 'medium' },
    { t: 'Computer Networks', d: 'TCP/UDP, HTTP/HTTPS, DNS resolution, REST vs GraphQL, websockets, OSI model layers.', diff: 'medium' },
    { t: 'Databases & SQL', d: 'ACID properties, indexing strategies, JOIN types, normalization, query optimization, transactions.', diff: 'medium' },
    { t: 'System Design Basics', d: 'Horizontal/vertical scaling, load balancing, caching (Redis), CDNs, CAP theorem fundamentals.', diff: 'hard' },
    { t: 'OOP & Design Patterns', d: 'SOLID principles, singleton, factory, observer, strategy, decorator patterns with examples.', diff: 'medium' },
    { t: 'Concurrency Concepts', d: 'Mutex, semaphores, race conditions, deadlock prevention, thread-safe data structures.', diff: 'hard' },
  ],
  mockrevision: [
    { t: 'Mock Interview — Coding', d: 'Solve 2 LeetCode problems under 45-min time limit. Verbalize thought process throughout.', diff: 'hard' },
    { t: 'Mock Interview — System Design', d: 'Design a scalable system (URL shortener, chat app, or feed). Full 45-minute drill.', diff: 'hard' },
    { t: 'Weak Area Revision', d: 'Review topics where MCQ scores were lowest. Re-solve 3 previously failed problems from scratch.', diff: 'medium' },
    { t: 'Behavioral Interview Prep', d: 'STAR method practice. Prepare 5 stories: leadership, conflict, achievement, failure, teamwork.', diff: 'easy' },
    { t: 'Company Research', d: 'Study target companies — tech stack, engineering culture, recent engineering blogs, interview format.', diff: 'easy' },
    { t: 'Final Revision Sprint', d: 'Quick scan all major topic areas. Ensure no critical gaps. Review your own notes.', diff: 'medium' },
  ],
};

function completedCount(tasks: Task[]) {
  return tasks.filter(t => t.completed).length;
}

function stageAllDone(tasks: Task[], stage: string) {
  const t = tasks.filter(x => x.stage === stage && !x.isBreak);
  return t.length > 0 && t.every(x => x.completed);
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: 'first_task', ico: '⭐', name: 'FIRST STEP', desc: 'Complete your first task', chk: (t) => completedCount(t) >= 1 },
  { id: 'streak5', ico: '🔥', name: 'ON FIRE', desc: 'Achieve a 5-day streak', chk: (_, u) => u.streak >= 5 },
  { id: 'streak30', ico: '💥', name: 'UNSTOPPABLE', desc: 'Achieve a 30-day streak', chk: (_, u) => u.streak >= 30 },
  { id: 'tasks10', ico: '📚', name: 'STUDIOUS', desc: 'Complete 10 tasks', chk: (t) => completedCount(t) >= 10 },
  { id: 'tasks50', ico: '🎓', name: 'SCHOLAR', desc: 'Complete 50 tasks', chk: (t) => completedCount(t) >= 50 },
  { id: 'stage_foundations', ico: '🏗️', name: 'FOUNDATIONS LAID', desc: 'Finish Foundations stage', chk: (t) => stageAllDone(t, 'Foundations') },
  { id: 'stage_coredsa', ico: '🧮', name: 'DSA WARRIOR', desc: 'Finish Core DSA stage', chk: (t) => stageAllDone(t, 'Core DSA') },
  { id: 'coins100', ico: '💰', name: 'RICH', desc: 'Hold 100 gems', chk: (_, u) => u.coins >= 100 },
  { id: 'shopper', ico: '🛒', name: 'SHOPPER', desc: 'Purchase first shop item', chk: (_, __, items) => items.size >= 1 },
  { id: 'coins_earned_200', ico: '🏦', name: 'EARNER', desc: 'Earn 200 gems total', chk: (_, u) => (u.totalEarned || 0) >= 200 },
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'pikachu', name: 'PIKACHU', price: 30, ico: '⚡', type: 'companion', desc: 'Your electric companion' },
  { id: 'starmie', name: 'STARMIE', price: 45, ico: '⭐', type: 'companion', desc: 'Master of the sea' },
  { id: 'staryu', name: 'STARYU', price: 25, ico: '🌟', type: 'companion', desc: 'The star shape keeper' },
];

// ===================== PLAN GENERATION =====================
export function fmt(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function generatePlan(user: User): Task[] {
  const tasks: Task[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(user.placementDate);
  end.setHours(0, 0, 0, 0);
  const totalDays = Math.max(7, Math.round((end.getTime() - start.getTime()) / 864e5));

  let prepDays = totalDays;
  STAGE_BREAKS.forEach(b => (prepDays -= b));
  prepDays = Math.max(5, prepDays);

  const stageDaysArr = STAGE_WEIGHTS.map(w => Math.max(3, Math.round(w * prepDays)));

  const cur = new Date(start);

  STAGES.forEach((stage, si) => {
    const key = STAGE_KEYS[si];
    const tpls = TASK_TEMPLATES[key] || [];
    const days = stageDaysArr[si];

    for (let d = 0; d < days; d++) {
      const dt = new Date(cur);
      const tpl = tpls[d % tpls.length];
      tasks.push({
        id: `${key}_${d}_${dt.getTime()}`,
        date: fmt(dt),
        title: tpl.t,
        desc: tpl.d,
        stage,
        stageKey: key,
        diff: tpl.diff,
        isBreak: false,
        coins: 5,
        completed: false,
        mcqVerified: false,
      });
      cur.setDate(cur.getDate() + 1);
    }

    const bk = STAGE_BREAKS[si];
    for (let b = 0; b < bk; b++) {
      const dt = new Date(cur);
      tasks.push({
        id: `break_${si}_${b}_${dt.getTime()}`,
        date: fmt(dt),
        title: 'BREAK DAY',
        desc: 'Rest, reflect, and recharge. Review weak areas or simply take a well-earned break.',
        stage,
        stageKey: 'break',
        diff: 'easy',
        isBreak: true,
        coins: 1,
        completed: false,
        mcqVerified: false,
      });
      cur.setDate(cur.getDate() + 1);
    }
  });

  return tasks;
}

// Stage color helpers
export function stageColor(k: string) {
  const m: Record<string, string> = {
    foundations: '#e8f0e8', coredsa: '#e8eef5', advanceddsa: '#f0e8f5',
    csfundamentals: '#f5ede8', mockrevision: '#fdf8e8', break: '#fdf3e8',
  };
  return m[k] || 'hsl(var(--surface2))';
}
export function stageBorderColor(k: string) {
  const m: Record<string, string> = {
    foundations: '#4a7c59', coredsa: '#3a6a9c', advanceddsa: '#7a3a9c',
    csfundamentals: '#9c5a3a', mockrevision: '#9c843a', break: '#c9933a',
  };
  return m[k] || 'hsl(var(--border))';
}
export function stageTextColor(k: string) {
  const m: Record<string, string> = {
    foundations: '#2a5a2a', coredsa: '#1a3a5c', advanceddsa: '#3a1a5c',
    csfundamentals: '#5c2a1a', mockrevision: '#5c4a1a', break: '#5c3a1a',
  };
  return m[k] || 'hsl(var(--foreground))';
}
