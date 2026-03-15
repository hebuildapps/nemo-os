-- Update user-facing currency wording from coins to gems.
-- Keep IDs and numeric logic unchanged.

UPDATE public.badges
SET description = 'Hold 100 gems'
WHERE id = 'coins100';

UPDATE public.badges
SET description = 'Earn 200 gems total'
WHERE id = 'coins_earned_200';

UPDATE public.shop_items
SET name = 'GEM BOOST',
    description = '+2 bonus gems per task (7 days)'
WHERE id = 'coin_boost';
