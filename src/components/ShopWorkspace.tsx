import React from 'react';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ShopItemRow = Database['public']['Tables']['shop_items']['Row'];
type UserItemRow = Database['public']['Tables']['user_items']['Row'];

interface ShopWorkspaceProps {
  profile: Profile;
  shopItems: ShopItemRow[];
  userItems: UserItemRow[];
  onBuy: (id: string, price: number) => void;
  onEquip: (id: string | null) => void;
}

const currencyWordToGems = (text: string) =>
  text
    .replace(/\bCOINS\b/g, 'GEMS')
    .replace(/\bCOIN\b/g, 'GEM')
    .replace(/\bcoins\b/g, 'gems')
    .replace(/\bcoin\b/g, 'gem');

const companionImageCandidates = (itemId: string) => [
  `/${itemId}_display.png`,
  `/shop-items/${itemId}_display.png`,
  `/${itemId}.png`,
  `/shop-items/${itemId}.png`,
];

const ShopWorkspace: React.FC<ShopWorkspaceProps> = ({ profile, shopItems, userItems, onBuy, onEquip }) => {
  const ownedIds = new Set(userItems.map(i => i.item_id));
  const gems = Number(((profile as Profile & { gems?: number }).gems ?? profile.coins ?? 0));

  return (
    <div>
      <div className="space-y-[12px]">
        <div className="font-pixel text-[10px] mb-[18px] pb-[10px] bg-[#152337] text-[#f9d362] border-b-2 border-border p-2 flex items-center gap-2">
          <img src="/shop.svg" alt="shop" className="w-[22px] h-[22px]" /> SHOP
        </div>
        <div className="flex items-center gap-[10px] mb-[18px] p-[10px_14px] bg-surface border-[1.5px] border-border">
          <img
            src="/diamond.png"
            alt="gem"
            className="w-[20px] h-[20px] shrink-0"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="font-pixel text-[9px] text-coin tabular-nums">{gems} GEMS</span>
          <span className="text-[10px] text-muted-foreground ml-auto">spend wisely, warrior</span>
        </div>
        <div className="grid grid-cols-3 gap-[10px] max-md:grid-cols-2">
          {shopItems.map(item => {
            const owned = ownedIds.has(item.id);
            const equipped = profile.equipped_item === item.id;
            const imageCandidates = companionImageCandidates(item.id);
            let cls = 'bg-surface border-[1.5px] p-[14px] text-center cursor-pointer transition-all hover:border-primary';
            if (equipped) cls = 'bg-primary text-primary-foreground border-[1.5px] border-primary p-[14px] text-center cursor-pointer';
            else if (owned) cls += ' border-nemo-green';
            else cls += ' border-border';

            const handleClick = () => {
              if (owned) onEquip(equipped ? null : item.id);
              else onBuy(item.id, item.price);
            };

            return (
              <div key={item.id} className={cls} onClick={handleClick}>
                <img
                  src={imageCandidates[0]}
                  alt={item.name}
                  className="w-[48px] h-[48px] mx-auto mb-[7px] block"
                  data-fallback-step="0"
                  onError={(event) => {
                    const currentStep = Number(event.currentTarget.dataset.fallbackStep || '0');
                    const nextStep = currentStep + 1;

                    if (nextStep < imageCandidates.length) {
                      event.currentTarget.dataset.fallbackStep = String(nextStep);
                      event.currentTarget.src = imageCandidates[nextStep];
                      return;
                    }

                    event.currentTarget.onerror = null;
                  }}
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="font-pixel text-[6px] mb-[5px] leading-[1.5]">{currencyWordToGems(item.name)}</div>
                <div className={`text-[10px] mb-[7px] leading-[1.4] ${equipped ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{currencyWordToGems(item.description)}</div>
                {equipped ? (
                  <div className="font-pixel text-[8px] text-primary-foreground">✓ EQUIPPED</div>
                ) : owned ? (
                  <div className="font-pixel text-[8px] text-nemo-green">✓ OWNED — EQUIP</div>
                ) : (
                  <div className="font-pixel text-[8px] text-coin flex items-center justify-center gap-1">
                    <img
                      src="/diamond.png"
                      alt="gem"
                      className="w-[16px] h-[16px] shrink-0"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    {item.price}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShopWorkspace;
