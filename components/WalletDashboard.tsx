
import React, { useState, useRef } from 'react';
import { Asset, View, SortOrder } from '../types';
import { ArrowUpRight, Plus, Repeat, Landmark, Settings, ScanLine, Copy, ChevronDown, History, SlidersHorizontal, Loader2, X, Check, Triangle } from 'lucide-react';
import { USER_ADDRESSES } from '../constants';

interface Props {
  assets: Asset[];
  totalBalance: number;
  walletName: string;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  onAction: (view: View, assetId?: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  formatPrice: (usd: number) => string;
  t: any;
}

const formatToken = (val: number) => {
  return val.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
};

const WalletDashboard: React.FC<Props> = ({ assets, totalBalance, walletName, sortOrder, onSortChange, onAction, onRefresh, isRefreshing, formatPrice, t }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [copiedNetwork, setCopiedNetwork] = useState<string | null>(null);
  const touchStartRef = useRef(0);
  const isPulling = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  const balanceChangeUsd = totalBalance * 0.0008;
  const isPositive = balanceChangeUsd >= 0;

  const toggleSort = () => {
    if (sortOrder === 'default') onSortChange('desc');
    else if (sortOrder === 'desc') onSortChange('asc');
    else onSortChange('default');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (listRef.current?.scrollTop === 0) {
      touchStartRef.current = e.touches[0].clientY;
      isPulling.current = true;
    } else {
      isPulling.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartRef.current;
    
    if (distance > 0) {
      setPullDistance(Math.min(distance * 0.4, 80));
    } else {
      isPulling.current = false;
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) onRefresh();
    setPullDistance(0);
    isPulling.current = false;
  };

  const handleCopy = (type: 'bitcoin' | 'evm' | 'tron') => {
    const addr = USER_ADDRESSES[type];
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(addr).then(() => {
        setCopiedNetwork(type);
        setTimeout(() => {
          setCopiedNetwork(null);
          setShowCopyMenu(false);
        }, 1200);
      });
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-[#FFFFFF] dark:bg-black text-black dark:text-white transition-colors duration-300 relative animate-fade-in overflow-hidden"
      style={{ transform: `translateY(${pullDistance}px)`, transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none' }}
    >
      {/* Pull to refresh indicator */}
      <div className="absolute left-0 right-0 flex justify-center pointer-events-none" style={{ top: 20, opacity: Math.min(pullDistance / 40, 1) }}>
        <Loader2 className={`text-zinc-400 ${isRefreshing || pullDistance > 60 ? 'animate-spin' : ''}`} size={24} />
      </div>

      {/* Header matching Screenshot 1 */}
      <header className="px-5 pt-safe pb-2 flex justify-between items-center shrink-0 mt-4">
        <button 
          onClick={() => onAction('wallet-manager')}
          className="flex items-center space-x-2 bg-zinc-50 dark:bg-dark-surface p-1.5 pr-3 rounded-full border border-zinc-100 dark:border-dark-border btn-press"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-dark-elevated flex items-center justify-center overflow-hidden">
             <img src="https://api.dicebear.com/7.x/shapes/svg?seed=Main" alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[15px] font-bold tracking-tight">{walletName}</span>
            <ChevronDown size={14} className="text-zinc-400" />
          </div>
        {/* Fixed: Close button tag and remove premature </header> closure */}
        </button>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-dark-surface rounded-full border border-zinc-100 dark:border-dark-border btn-press">
            <ScanLine size={20} />
          </button>
          <button 
            onClick={() => onAction('settings')}
            className="p-2 text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-dark-surface rounded-full border border-zinc-100 dark:border-dark-border btn-press"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Balance Section matching Screenshot 1 */}
      <section className="px-5 mt-6 mb-8 text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-1.5 mb-1">
            <p className="text-[#8E8E93] dark:text-zinc-500 font-bold text-[12px] uppercase tracking-widest">{t.totalBalance}</p>
            <button onClick={() => setShowCopyMenu(true)} className="p-1 text-zinc-300">
              <Copy size={14} />
            </button>
          </div>
          <h1 className="text-[40px] font-extrabold tracking-tight leading-tight text-black dark:text-white">
            {formatPrice(totalBalance)}
          </h1>
          <div className={`mt-1 flex items-center space-x-1.5 font-bold text-[15px] ${isPositive ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
            <Triangle size={10} fill="currentColor" className={`${!isPositive ? 'rotate-180' : ''}`} />
            <span>{formatPrice(Math.abs(balanceChangeUsd))} (+0,08%)</span>
          </div>
        </div>
      </section>

      {/* Action Buttons matching Screenshot 1 */}
      <section className="px-5 mb-8">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: ArrowUpRight, label: t.send, view: 'send' as View, bg: 'bg-[#0500FF] text-white' },
            { icon: Plus, label: t.topup, view: 'receive' as View, bg: 'bg-zinc-50 dark:bg-dark-surface text-black dark:text-white border border-zinc-100 dark:border-dark-border' },
            { icon: Repeat, label: t.swap, view: 'swap' as View, bg: 'bg-zinc-50 dark:bg-dark-surface text-black dark:text-white border border-zinc-100 dark:border-dark-border' },
            { icon: Landmark, label: t.sell, view: null, bg: 'bg-zinc-50 dark:bg-dark-surface text-black dark:text-white border border-zinc-100 dark:border-dark-border' }
          ].map((action, i) => (
            <div key={i} className="flex flex-col items-center">
              <button 
                onClick={() => action.view && onAction(action.view)}
                className={`w-[54px] h-[54px] ${action.bg} rounded-full flex items-center justify-center btn-press shadow-sm mb-2 transition-transform active:scale-90`}
              >
                <action.icon size={24} strokeWidth={2.5} />
              </button>
              <span className="text-[12px] font-bold text-[#8E8E93] dark:text-zinc-500 lowercase">{action.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Assets Tab Section matching Screenshot 1 */}
      <section className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-5 mb-2 shrink-0">
          <div className="flex space-x-6">
            <button className="text-[17px] font-extrabold text-black dark:text-white border-b-2 border-black dark:border-white pb-2">
              {t.crypto}
            </button>
            <button className="text-[17px] font-bold text-[#8E8E93] dark:text-zinc-500 pb-2">NFTs</button>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => onAction('history')} className="text-zinc-400">
              <History size={20} />
            </button>
            <button onClick={toggleSort} className="text-zinc-400">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Assets List */}
        <div 
          ref={listRef}
          onScroll={(e) => {
            const target = e.target as HTMLDivElement;
            if (target.scrollTop > 0) isPulling.current = false;
          }}
          className="flex-1 overflow-y-auto no-scrollbar pt-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="px-2 space-y-1">
            {assets.map((asset) => (
              <div 
                key={asset.id} 
                className="flex items-center justify-between py-3.5 px-4 bg-transparent active:bg-zinc-100 dark:active:bg-dark-elevated transition-colors cursor-pointer rounded-2xl"
                onClick={() => onAction('asset-detail', asset.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center bg-zinc-50 dark:bg-dark-surface p-0">
                    <img src={asset.logoUrl} alt="" className="w-full h-full object-contain rounded-full" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-bold text-[16px] text-black dark:text-white uppercase">{asset.symbol}</h3>
                      <span className="text-[10px] font-bold text-[#0500FF] bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded uppercase tracking-wider">{asset.network}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[13px] font-bold text-[#8E8E93] dark:text-zinc-500 tracking-tight">{formatPrice(asset.priceUsd)}</span>
                      <span className={`text-[13px] font-bold ${asset.change24h >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[17px] text-black dark:text-white tracking-tight leading-none">
                    {formatToken(asset.balance)}
                  </p>
                  <p className="text-[13px] text-[#8E8E93] dark:text-zinc-500 font-bold mt-1">
                    {formatPrice(asset.balance * asset.priceUsd)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Manage Button matching Screenshot 1 */}
          <div className="px-5 mt-4 mb-10">
            <button className="w-full py-4 border-2 border-dashed border-zinc-100 dark:border-dark-border rounded-2xl flex items-center justify-center space-x-2 text-[#8E8E93] dark:text-zinc-500 font-bold text-[14px] hover:bg-zinc-50 dark:hover:bg-dark-surface transition-colors uppercase tracking-widest">
              <Plus size={16} />
              <span>{t.manage}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Address Selection Overlay */}
      {showCopyMenu && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCopyMenu(false)}></div>
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[32px] p-6 pb-12 relative animate-ios-bottom-up shadow-2xl">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6"></div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-extrabold tracking-tight">Copy Address</h3>
                <button onClick={() => setShowCopyMenu(false)} className="p-2 text-zinc-400">
                    <X size={20} />
                </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'BITCOIN', type: 'bitcoin' as const, logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', network: 'SegWit' },
                { label: 'EVM', type: 'evm' as const, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', network: 'Multi-chain' },
                { label: 'TRON', type: 'tron' as const, logo: 'https://cryptologos.cc/logos/tron-trx-logo.png', network: 'TRC-20' },
              ].map((item) => (
                <button key={item.type} onClick={() => handleCopy(item.type)} className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-dark-surface border border-zinc-100 dark:border-dark-border btn-press">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-dark-bg p-1.5 shadow-sm"><img src={item.logo} className="w-full h-full object-contain" alt="" /></div>
                    <div className="text-left"><span className="font-extrabold text-[15px] block">{item.label}</span><span className="text-[11px] text-zinc-400 font-bold">{item.network}</span></div>
                  </div>
                  {copiedNetwork === item.type ? (<Check size={20} className="text-[#34C759]" strokeWidth={3} />) : (<Copy size={18} className="text-zinc-300" />)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDashboard;
