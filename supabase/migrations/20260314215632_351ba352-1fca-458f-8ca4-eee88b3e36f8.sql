
-- Utility: update_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1. PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'NEMO',
  placement_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '90 days')::date,
  target_role TEXT NOT NULL DEFAULT 'Software Engineer',
  hours_per_day INTEGER NOT NULL DEFAULT 4,
  current_stage TEXT NOT NULL DEFAULT 'Foundations',
  coins INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active DATE,
  referral_code TEXT NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 6)),
  referred_by TEXT,
  equipped_item TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. TASKS
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  stage TEXT NOT NULL,
  stage_key TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  is_break BOOLEAN NOT NULL DEFAULT false,
  coins_reward INTEGER NOT NULL DEFAULT 5,
  completed BOOLEAN NOT NULL DEFAULT false,
  mcq_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_tasks_user_date ON public.tasks(user_id, date);

-- 3. BADGES (reference)
CREATE TABLE public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges readable by authenticated" ON public.badges FOR SELECT TO authenticated USING (true);

INSERT INTO public.badges (id, name, description, icon, sort_order) VALUES
  ('first_task', 'FIRST STEP', 'Complete your first task', '⭐', 1),
  ('streak5', 'ON FIRE', 'Achieve a 5-day streak', '🔥', 2),
  ('streak30', 'UNSTOPPABLE', 'Achieve a 30-day streak', '💥', 3),
  ('tasks10', 'STUDIOUS', 'Complete 10 tasks', '📚', 4),
  ('tasks50', 'SCHOLAR', 'Complete 50 tasks', '🎓', 5),
  ('stage_foundations', 'FOUNDATIONS LAID', 'Finish Foundations stage', '🏗️', 6),
  ('stage_coredsa', 'DSA WARRIOR', 'Finish Core DSA stage', '🧮', 7),
  ('coins100', 'MONEYED', 'Hold 100 coins', '💰', 8),
  ('shopper', 'SHOPPER', 'Purchase first shop item', '🛒', 9),
  ('coins_earned_200', 'EARNER', 'Earn 200 coins total', '🏦', 10);

-- 4. USER_BADGES
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. SHOP_ITEMS (reference)
CREATE TABLE public.shop_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  item_type TEXT NOT NULL,
  price INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shop items readable by authenticated" ON public.shop_items FOR SELECT TO authenticated USING (true);

INSERT INTO public.shop_items (id, name, description, icon, item_type, price, sort_order) VALUES
  ('hat', 'COWBOY HAT', 'Classic frontier style', '🤠', 'hat', 30, 1),
  ('glasses', 'COOL GLASSES', 'Stay stylish while grinding', '🕶️', 'glasses', 25, 2),
  ('theme_dark', 'DARK MODE', 'Night owl edition', '🌑', 'theme', 50, 3),
  ('theme_warm', 'WARM THEME', 'Cozy amber tones', '🌅', 'theme', 40, 4),
  ('coin_boost', 'COIN BOOST', '+2 bonus coins per task (7 days)', '⚡', 'boost', 80, 5),
  ('theme_matrix', 'MATRIX THEME', 'Enter the matrix', '💚', 'theme', 65, 6);

-- 6. USER_ITEMS
CREATE TABLE public.user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES public.shop_items(id),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);
ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own items" ON public.user_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON public.user_items FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, placement_date, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'NEMO'),
    (CURRENT_DATE + INTERVAL '90 days')::date,
    upper(substr(md5(random()::text), 1, 6))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
