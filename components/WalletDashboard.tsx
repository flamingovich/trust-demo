
import React, { useState, useRef } from 'react';
import { Asset, View, SortOrder } from '../types';
import { ArrowUpRight, Plus, Repeat, Landmark, Settings, ScanLine, Copy, ChevronDown, History, SlidersHorizontal, Loader2, X, Check, Triangle } from 'lucide-react';

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

  const balanceChangeUsd = totalBalance * 0.0008;
  const isPositive = balanceChangeUsd >= 0;

  const toggleSort = () => {
    if (sortOrder === 'default') onSortChange('desc');
    else if (sortOrder === 'desc') onSortChange('asc');
    else onSortChange('default');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.currentTarget.scrollTop === 0) {
      touchStartRef.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartRef.current;
    if (distance > 0) {
      setPullDistance(Math.min(distance * 0.4, 80));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) onRefresh();
    setPullDistance(0);
    isPulling.current = false;
  };

  const handleCopy = (type: 'bitcoin' | 'evm' | 'tron') => {
    // Demo Logic
    setCopiedNetwork(type);
    setTimeout(() => {
      setCopiedNetwork(null);
      setShowCopyMenu(false);
    }, 1200);
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex flex-col h-full bg-[#fcfcfd] dark:bg-dark-bg text-black dark:text-zinc-100 transition-colors duration-300 relative animate-fade-in md:px-12 md:py-8"
      style={{ transform: `translateY(${pullDistance}px)`, transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none' }}
    >
      <div className="absolute left-0 right-0 flex justify-center pointer-events-none" style={{ top: -40, opacity: Math.min(pullDistance / 40, 1) }}>
        <Loader2 className={`text-blue-600 ${isRefreshing || pullDistance > 60 ? 'animate-spin' : ''}`} size={24} />
      </div>

      {/* Header - Mobile Only or PC Adaptive */}
      <div className="px-5 pt-4 flex justify-between items-center shrink-0 mb-2 md:mb-10">
        <button 
          onClick={() => onAction('wallet-manager')}
          className="flex items-center space-x-2 bg-zinc-100/80 dark:bg-dark-surface p-1 pr-3.5 rounded-full border border-zinc-200/50 dark:border-dark-border btn-press"
        >
          <div className="w-7 h-7 rounded-full bg-zinc-300 dark:bg-dark-elevated flex items-center justify-center overflow-hidden border border-white/20">
             <img src="https://api.dicebear.com/7.x/shapes/svg?seed=Lucky" alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[14px] md:text-[16px] font-bold tracking-tight">{walletName}</span>
            <ChevronDown size={13} className="text-zinc-400" />
          </div>
        </button>
        
        <div className="flex items-center space-x-1.5 md:hidden">
          <button className="p-2 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-dark-surface rounded-full shadow-sm border border-zinc-100 dark:border-dark-border btn-press">
            <ScanLine size={18} />
          </button>
          <button 
            onClick={() => onAction('settings')}
            className="p-2 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-dark-surface rounded-full shadow-sm border border-zinc-100 dark:border-dark-border btn-press"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className="flex-1 flex flex-col md:flex-row md:space-x-12 min-h-0">
        
        {/* Left Column: Balance & Actions */}
        <div className="md:w-[400px] shrink-0">
            {/* Balance Card */}
            <div className="px-3 md:px-0 mb-4 shrink-0">
                <div className="relative overflow-hidden bg-white dark:bg-dark-surface rounded-[28px] md:rounded-[36px] p-6 md:p-10 border border-zinc-200/50 dark:border-dark-border shadow-[0_10px_40px_rgba(0,0,0,0.02)] dark:shadow-none transition-all">
                <div className="relative z-10">
                    <div className="flex items-center space-x-1.5 mb-2">
                        <p className="text-zinc-400 font-bold text-[10px] md:text-[12px] uppercase tracking-[0.2em]">{t.totalBalance}</p>
                        <button onClick={() => setShowCopyMenu(true)} className="p-1 text-zinc-300 hover:text-blue-600 transition-colors">
                            <Copy size={13} />
                        </button>
                    </div>
                    <h1 className="text-[34px] md:text-[48px] font-extrabold tracking-tighter leading-none mb-3 md:mb-6 text-black dark:text-white">
                        {formatPrice(totalBalance)}
                    </h1>
                    <div className={`flex items-center space-x-1.5 font-bold text-[13px] md:text-[16px] ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        <Triangle size={10} fill="currentColor" className={`${!isPositive ? 'rotate-180' : ''}`} />
                        <span>{isPositive ? '+' : '-'}{formatPrice(Math.abs(balanceChangeUsd))} (+0,08%)</span>
                    </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none"></div>
                </div>
            </div>

            {/* Actions Grid */}
            <div className="px-6 md:px-0 mb-5 md:mb-10 shrink-0">
                <div className="grid grid-cols-4 md:grid-cols-2 gap-3 md:gap-5">
                {[
                    { icon: ArrowUpRight, label: t.send, view: 'send' as View, bg: 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' },
                    { icon: Plus, label: t.topup, view: 'receive' as View, bg: 'bg-zinc-100 dark:bg-dark-surface text-zinc-700 dark:text-zinc-200 border border-zinc-200/30 dark:border-dark-border' },
                    { icon: Repeat, label: t.swap, view: 'swap' as View, bg: 'bg-zinc-100 dark:bg-dark-surface text-zinc-700 dark:text-zinc-200 border border-zinc-200/30 dark:border-dark-border' },
                    { icon: Landmark, label: t.sell, view: null, bg: 'bg-zinc-100 dark:bg-dark-surface text-zinc-700 dark:text-zinc-200 border border-zinc-200/30 dark:border-dark-border' }
                ].map((action, i) => (
                    <div key={i} className="flex flex-col items-center space-y-1.5">
                        <button 
                            onClick={() => action.view && onAction(action.view)}
                            className={`w-[52px] h-[52px] md:w-full md:h-[70px] ${action.bg} rounded-[20px] md:rounded-[24px] flex items-center justify-center btn-press shadow-sm transition-transform active:scale-90 md:space-x-4`}
                        >
                            <action.icon size={22} className="md:w-6 md:h-6" strokeWidth={2.5} />
                            <span className="hidden md:block font-bold text-[16px]">{action.label}</span>
                        </button>
                        <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 lowercase tracking-tight md:hidden">{action.label}</span>
                    </div>
                ))}
                </div>
            </div>
        </div>

        {/* Right Column: Assets List */}
        <div className="px-3 md:px-0 flex-1 min-h-0 flex flex-col mb-4 md:mb-0">
            <div className="flex-1 bg-white dark:bg-dark-surface rounded-[28px] md:rounded-[36px] border border-zinc-200/50 dark:border-dark-border shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-6 shrink-0 border-b border-zinc-50/50 dark:border-dark-border/30">
                    <div className="flex space-x-6 md:space-x-10">
                        <button className="text-[15px] md:text-[18px] font-extrabold text-zinc-900 dark:text-zinc-100 border-b-2 md:border-b-3 border-blue-600 pb-1">
                            {t.crypto}
                        </button>
                        <button className="text-[15px] md:text-[18px] font-bold text-zinc-400 opacity-50 pb-1">NFTs</button>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button onClick={() => onAction('history')} className="p-1.5 md:p-2 text-zinc-400 hover:text-blue-600 transition-colors bg-zinc-50 dark:bg-dark-bg rounded-xl">
                            <History size={18} className="md:w-5 md:h-5" />
                        </button>
                        <button 
                            onClick={toggleSort} 
                            className={`p-1.5 md:p-2 rounded-xl transition-colors ${sortOrder !== 'default' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-400 bg-zinc-50 dark:bg-dark-bg'}`}
                        >
                            <SlidersHorizontal size={18} className="md:w-5 md:h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-3 md:px-6 pb-6 pt-2 space-y-1 md:space-y-2">
                    {assets.map((asset) => (
                    <div 
                        key={asset.id} 
                        className="flex items-center justify-between p-3 md:p-4 bg-transparent dark:bg-transparent rounded-[22px] md:rounded-[28px] hover:bg-zinc-50 dark:hover:bg-dark-elevated/20 active:bg-zinc-100 transition-all cursor-pointer group"
                        onClick={() => onAction('asset-detail', asset.id)}
                    >
                        <div className="flex items-center space-x-3.5 md:space-x-5">
                            <div className="relative shrink-0">
                                <div className="w-[44px] h-[44px] md:w-[54px] md:h-[54px] rounded-[14px] md:rounded-[18px] bg-zinc-50 dark:bg-dark-bg flex items-center justify-center p-2 md:p-2.5 border border-zinc-100 dark:border-dark-border/50 shadow-sm group-hover:scale-105 transition-transform">
                                    <img src={asset.logoUrl} alt="" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-[15px] md:text-[18px] leading-tight text-zinc-900 dark:text-zinc-100">{asset.symbol}</h3>
                                <div className="flex items-center space-x-2 mt-0.5 md:mt-1">
                                    <span className="text-[11px] md:text-[13px] font-bold text-zinc-400 tracking-tight">{formatPrice(asset.priceUsd)}</span>
                                    <span className={`text-[10px] md:text-[12px] font-extrabold ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                        <p className="font-extrabold text-[16px] md:text-[19px] leading-tight text-zinc-900 dark:text-zinc-100 tracking-tight">
                            {formatToken(asset.balance)}
                        </p>
                        <p className="text-[12px] md:text-[14px] text-zinc-400 font-bold opacity-60 mt-0.5">
                            {formatPrice(asset.balance * asset.priceUsd)}
                        </p>
                        </div>
                    </div>
                    ))}
                    
                    <button className="w-full py-4.5 md:py-6 bg-zinc-50/50 dark:bg-dark-surface/50 rounded-[22px] md:rounded-[32px] flex items-center justify-center space-x-2.5 text-zinc-400 font-bold text-[11px] md:text-[13px] hover:bg-zinc-100 transition-colors uppercase tracking-widest mt-2 border border-dashed border-zinc-200 dark:border-dark-border">
                        <Plus size={14} className="md:w-5 md:h-5" />
                        <span>{t.manage}</span>
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Copy Modal */}
      {showCopyMenu && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center animate-fade-in p-0 m-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setShowCopyMenu(false)}></div>
          <div className="w-full max-w-[430px] bg-white dark:bg-zinc-950 rounded-t-[40px] md:rounded-[44px] p-6 md:p-10 pb-10 relative animate-ios-bottom-up md:animate-scale-in shadow-2xl border-t md:border border-white/5">
            <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8 md:hidden"></div>
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Copy Address</h3>
                <button onClick={() => setShowCopyMenu(false)} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 btn-press">
                    <X size={20} strokeWidth={2.5} />
                </button>
            </div>
            <div className="space-y-3.5">
              {[
                { label: 'BITCOIN', type: 'bitcoin' as const, logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', network: 'SegWit' },
                { label: 'EVM', type: 'evm' as const, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', network: 'Multi-chain' },
                { label: 'TRON', type: 'tron' as const, logo: 'https://cryptologos.cc/logos/tron-trx-logo.png', network: 'TRC-20' },
              ].map((item) => (
                <button 
                  key={item.type}
                  onClick={() => handleCopy(item.type)}
                  className="w-full flex items-center justify-between p-5 rounded-[26px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 btn-press"
                >
                  <div className="flex items-center space-x-5">
                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-dark-surface p-2 shadow-sm">
                      <img src={item.logo} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="text-left">
                      <span className="font-extrabold text-[15px] block leading-none mb-1">{item.label}</span>
                      <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">{item.network}</span>
                    </div>
                  </div>
                  {copiedNetwork === item.type ? (
                    <div className="flex items-center space-x-1.5 text-green-500 font-bold text-[12px] uppercase animate-pop-in">
                        <Check size={18} strokeWidth={3} />
                        <span>Copied</span>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-300">
                      <Copy size={18} />
                    </div>
                  )}
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
