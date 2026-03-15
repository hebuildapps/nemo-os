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

const ShopWorkspace: React.FC<ShopWorkspaceProps> = ({ profile, shopItems, userItems, onBuy, onEquip }) => {
  const ownedIds = new Set(userItems.map(i => i.item_id));

  return (
    <div className="relative">
      <div className="space-y-[12px] blur-[2px] saturate-75">
        <div className="font-pixel text-[10px] text-foreground mb-[18px] pb-[10px] border-b-2 border-border">🛒 SHOP</div>
        <div className="flex items-center gap-[10px] mb-[18px] p-[10px_14px] bg-surface border-[1.5px] border-border">
          <img
            src="/public/diamond.png"
            alt="gem"
            className="w-[20px] h-[20px] shrink-0"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="font-pixel text-[9px] text-coin tabular-nums">{profile.coins} GEMS</span>
          <span className="text-[10px] text-muted-foreground ml-auto">spend wisely, warrior</span>
        </div>
        <div className="grid grid-cols-3 gap-[10px] max-md:grid-cols-2">
          {shopItems.map(item => {
            const owned = ownedIds.has(item.id);
            const equipped = profile.equipped_item === item.id;
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
                <span className="text-[30px] block mb-[7px]">{item.icon}</span>
                <div className="font-pixel text-[6px] mb-[5px] leading-[1.5]">{currencyWordToGems(item.name)}</div>
                <div className={`text-[10px] mb-[7px] leading-[1.4] ${equipped ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{currencyWordToGems(item.description)}</div>
                {equipped ? (
                  <div className="font-pixel text-[8px] text-primary-foreground">✓ EQUIPPED</div>
                ) : owned ? (
                  <div className="font-pixel text-[8px] text-nemo-green">✓ OWNED — EQUIP</div>
                ) : (
                  <div className="font-pixel text-[8px] text-coin flex items-center justify-center gap-1">
                    <img
                      src="/public/diamond.png"
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

      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/42 backdrop-blur-[6px]">
        <div className="text-center px-[18px]">
          <div className="font-pixel text-[15px] tracking-[1px] text-foreground">COMING SOON</div>
          <div className="text-[12px] mt-[8px] text-muted-foreground">Good things take time.</div>
        </div>
      </div>
    </div>
  );
};

export default ShopWorkspace;
