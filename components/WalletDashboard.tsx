
import React, { useState, useRef } from 'react';
import { Asset, View, SortOrder } from '../types';
import { ArrowUpRight, Plus, Repeat, Landmark, Sprout, Settings, ScanLine, Copy, Search, ChevronDown, History, SlidersHorizontal, Loader2 } from 'lucide-react';

interface Props {
  assets: Asset[];
  totalBalance: number;
  walletName: string;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  onAction: (view: View, assetId?: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  t: any;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const formatToken = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(val);
};

const WalletDashboard: React.FC<Props> = ({ assets, totalBalance, walletName, sortOrder, onSortChange, onAction, onRefresh, isRefreshing, t }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef(0);
  const isPulling = useRef(false);

  const toggleSort = () => {
    if (sortOrder === 'default') onSortChange('desc');
    else if (sortOrder === 'desc') onSortChange('asc');
    else onSortChange('default');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      touchStartRef.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartRef.current;
    if (distance > 0) {
      const dampedDistance = Math.min(distance * 0.4, 80);
      setPullDistance(dampedDistance);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) onRefresh();
    setPullDistance(0);
    isPulling.current = false;
  };

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col h-full bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 relative animate-fade-in"
      style={{ transform: `translateY(${pullDistance}px)`, transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none' }}
    >
      <div className="absolute left-0 right-0 flex justify-center pointer-events-none" style={{ top: -40, opacity: Math.min(pullDistance / 40, 1) }}>
        <Loader2 className={`text-blue-600 ${isRefreshing || pullDistance > 60 ? 'animate-spin' : ''}`} size={24} />
      </div>

      <div className="px-6 pt-12 flex justify-between items-center shrink-0">
        <button onClick={() => onAction('settings')} className="p-2 text-zinc-500 dark:text-zinc-400 btn-press">
          <Settings size={22} strokeWidth={1.5} />
        </button>
        <button className="p-2 text-zinc-500 dark:text-zinc-400 btn-press">
          <ScanLine size={22} strokeWidth={1.5} />
        </button>
        <button onClick={() => onAction('wallet-manager')} className="flex items-center space-x-1 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 btn-press transition-all">
          <span className="text-[14px] font-medium tracking-tight">{walletName}</span>
          <ChevronDown size={14} strokeWidth={2} />
        </button>
        <button className="p-2 text-zinc-500 dark:text-zinc-400 btn-press">
          <Copy size={20} strokeWidth={1.5} />
        </button>
        <button className="p-2 text-zinc-500 dark:text-zinc-400 btn-press">
          <Search size={22} strokeWidth={1.5} />
        </button>
      </div>

      <div className="text-center mt-8 mb-8 shrink-0">
        <h1 className="text-[44px] font-medium tracking-tight leading-none mb-2">
          {formatCurrency(totalBalance)} $
        </h1>
        <div className="flex items-center justify-center space-x-1.5 text-green-600 dark:text-green-500 font-medium text-sm bg-green-500/5 py-1 px-3 rounded-full w-fit mx-auto">
          <Plus size={14} strokeWidth={2} />
          <span>1.17 $ (+0.08%)</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1 px-4 mb-10 shrink-0">
        {[
          { icon: ArrowUpRight, label: t.send, view: 'send' as View, bg: 'bg-zinc-100 dark:bg-zinc-900' },
          { icon: Plus, label: t.topup, view: 'top-up' as View, bg: 'bg-zinc-100 dark:bg-zinc-900' },
          { icon: Repeat, label: t.swap, view: 'swap' as View, bg: 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' },
          { icon: Landmark, label: t.sell, view: null, bg: 'bg-zinc-100 dark:bg-zinc-900' },
          { icon: Sprout, label: t.earn, view: null, bg: 'bg-zinc-100 dark:bg-zinc-900' }
        ].map((action, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <button 
              onClick={() => action.view && onAction(action.view)} 
              className={`w-[56px] h-[56px] ${action.bg} rounded-[22px] flex items-center justify-center transition-all active:scale-90 shadow-sm`}
            >
              <action.icon size={22} strokeWidth={2} />
            </button>
            <span className="text-[12px] font-medium text-zinc-900 dark:text-zinc-200">{action.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-6 border-b border-zinc-100 dark:border-white/5 mb-2 shrink-0">
        <div className="flex space-x-6">
          <button className="pb-3 border-b-2 border-blue-600 font-medium text-[16px] text-zinc-900 dark:text-white">{t.crypto}</button>
          <button className="pb-3 text-zinc-400 font-medium text-[16px]">Prediction</button>
          <button className="pb-3 text-zinc-400 font-medium text-[16px]">{t.nfts}</button>
        </div>
        <div className="flex items-center space-x-4 pb-3">
          <button onClick={() => onAction('history')} className="text-zinc-500 dark:text-zinc-400 btn-press">
            <History size={22} strokeWidth={1.5} />
          </button>
          <button onClick={toggleSort} className="text-zinc-500 dark:text-zinc-400 btn-press">
            <SlidersHorizontal size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-20">
        {assets.map((asset) => (
          <div 
            key={asset.id} 
            className="flex items-center justify-between py-4 active:bg-zinc-50 dark:active:bg-zinc-900 transition-all cursor-pointer border-b border-zinc-50 dark:border-white/5 last:border-0 rounded-2xl px-2 -mx-2"
            onClick={() => onAction('asset-detail', asset.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-[48px] h-[48px] rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                  <img src={asset.logoUrl} alt="" className="w-8 h-8 object-contain" />
                </div>
                {asset.networkIcon && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-zinc-900 p-0.5 border-2 border-white dark:border-black shadow-sm">
                    <img src={asset.networkIcon} alt="" className="w-full h-full rounded-full object-contain" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-[16px] leading-tight">{asset.symbol}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-medium uppercase tracking-wider">
                    {asset.network}
                  </span>
                </div>
                <p className="text-[13px] text-zinc-500 font-normal">
                  {formatCurrency(asset.priceUsd)} $ 
                  <span className={`ml-1.5 ${asset.change24h >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-500'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-[17px] leading-tight tracking-tight">
                {formatToken(asset.balance)}
              </p>
              <p className="text-[13px] text-zinc-500 font-normal">
                {formatCurrency(asset.balance * asset.priceUsd)} $
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletDashboard;
