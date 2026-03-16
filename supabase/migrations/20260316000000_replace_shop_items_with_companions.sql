-- Keep only pokemon companion items as valid equipment
UPDATE public.profiles
SET equipped_item = NULL
WHERE equipped_item IS NOT NULL
  AND equipped_item NOT IN ('pikachu', 'starmie', 'staryu');

-- Remove user-owned items that are no longer valid
DELETE FROM public.user_items
WHERE item_id NOT IN ('pikachu', 'starmie', 'staryu');

-- Remove non-pokemon shop items
DELETE FROM public.shop_items
WHERE id NOT IN ('pikachu', 'starmie', 'staryu');

-- Upsert the three supported shop items
INSERT INTO public.shop_items (id, name, description, icon, item_type, price, sort_order) VALUES
  ('pikachu', 'PIKACHU', 'Your electric companion', '⚡', 'companion', 30, 1),
  ('starmie', 'STARMIE', 'Master of the sea', '⭐', 'companion', 45, 2),
  ('staryu', 'STARYU', 'The star shape keeper', '🌟', 'companion', 25, 3)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  item_type = EXCLUDED.item_type,
  price = EXCLUDED.price,
  sort_order = EXCLUDED.sort_order;
