import React from 'react';
import { SHOP_ITEMS, User } from '@/lib/nemo-data';

interface ShopWorkspaceProps {
  user: User;
  userItems: Set<string>;
  equippedItem: string | null;
  onBuy: (id: string) => void;
}

const ShopWorkspace: React.FC<ShopWorkspaceProps> = ({ user, userItems, equippedItem, onBuy }) => (
  <div>
    <div className="font-pixel text-[10px] text-foreground mb-[18px] pb-[10px] border-b-2 border-border">
      🛒 SHOP
    </div>
    <div className="flex items-center gap-[10px] mb-[18px] p-[10px_14px] bg-surface border-[1.5px] border-border">
      <span className="text-[18px]">🪙</span>
      <span className="font-pixel text-[9px] text-coin tabular-nums">{user.coins} COINS</span>
      <span className="text-[10px] text-muted-foreground ml-auto">spend wisely, warrior</span>
    </div>
    <div className="grid grid-cols-3 gap-[10px] max-md:grid-cols-2">
      {SHOP_ITEMS.map(item => {
        const owned = userItems.has(item.id);
        const equipped = equippedItem === item.id;
        let cls = 'bg-surface border-[1.5px] p-[14px] text-center cursor-pointer transition-all hover:border-primary';
        if (equipped) cls = 'bg-primary text-primary-foreground border-[1.5px] border-primary p-[14px] text-center cursor-pointer';
        else if (owned) cls += ' border-nemo-green';
        else cls += ' border-border';

        return (
          <div key={item.id} className={cls} onClick={() => onBuy(item.id)}>
            <span className="text-[30px] block mb-[7px]">{item.ico}</span>
            <div className="font-pixel text-[6px] mb-[5px] leading-[1.5]">{item.name}</div>
            <div className={`text-[10px] mb-[7px] leading-[1.4] ${equipped ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{item.desc}</div>
            {equipped ? (
              <div className="font-pixel text-[8px] text-primary-foreground">✓ EQUIPPED</div>
            ) : owned ? (
              <div className="font-pixel text-[8px] text-nemo-green">✓ OWNED — EQUIP</div>
            ) : (
              <div className="font-pixel text-[8px] text-coin flex items-center justify-center gap-1">🪙 {item.price}</div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default ShopWorkspace;
