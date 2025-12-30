
import React, { useState, useRef } from 'react';
import { Asset, View, SortOrder } from '../types';
import { ArrowUpRight, Plus, Repeat, Landmark, Settings, ScanLine, Copy, ChevronDown, History, SlidersHorizontal, Loader2, X, Check, Triangle, ShieldCheck } from 'lucide-react';
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
    const orders: SortOrder[] = ['default', 'desc', 'asc'];
    const currentIndex = orders.indexOf(sortOrder);
    const nextIndex = (currentIndex + 1) % orders.length;
    onSortChange(orders[nextIndex]);
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
      setPullDistance(Math.min(distance * 0.3, 60));
    } else {
      isPulling.current = false;
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 50) onRefresh();
    setPullDistance(0);
    isPulling.current = false;
  };

  const handleCopy = (type: 'bitcoin' | 'evm' | 'tron') => {
    const addr = USER_ADDRESSES[type];
    navigator.clipboard.writeText(addr).then(() => {
      setCopiedNetwork(type);
      setTimeout(() => {
        setCopiedNetwork(null);
        setShowCopyMenu(false);
      }, 1200);
    });
  };

  return (
    <div 
      className="flex flex-col h-full bg-[#F9FAFB] dark:bg-dark-bg text-[#1A1C1E] dark:text-zinc-100 transition-colors duration-300 relative animate-fade-in md:px-12 md:py-4"
      style={{ transform: `translateY(${pullDistance}px)`, transition: pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)' : 'none' }}
    >
      <div className="absolute left-0 right-0 flex justify-center pointer-events-none" style={{ top: -30, opacity: Math.min(pullDistance / 30, 1) }}>
        <Loader2 className={`text-blue-600 ${isRefreshing || pullDistance > 40 ? 'animate-spin' : ''}`} size={20} />
      </div>

      {/* Header */}
      <div className="px-5 pt-2 flex justify-between items-center shrink-0 mb-4">
        <button 
          onClick={() => onAction('wallet-manager')}
          className="flex items-center space-x-2 bg-white dark:bg-dark-surface py-1.5 pl-1.5 pr-3 rounded-full border border-zinc-200/40 dark:border-dark-border shadow-sm btn-press"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
             <ShieldCheck size={16} className="text-white" />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[14px] font-bold tracking-tight">{walletName}</span>
            <ChevronDown size={12} className="text-zinc-400" />
          </div>
        </button>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-zinc-400 hover:text-blue-600 transition-colors">
            <ScanLine size={22} />
          </button>
          <button onClick={() => onAction('settings')} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors">
            <Settings size={22} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row md:space-x-8 min-h-0 overflow-hidden">
        <div className="md:w-[340px] shrink-0 flex flex-col">
            {/* Balance Card */}
            <div className="px-4 md:px-0 mb-4 shrink-0">
                <div className="relative bg-white dark:bg-[#121216] rounded-[32px] p-7 border border-zinc-200/40 dark:border-white/5 overflow-hidden">
                    {/* Background Decor - Peripheral & Low Opacity */}
                    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                        <div className="absolute -top-4 -right-4 opacity-[0.03] dark:opacity-[0.02]">
                            <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" className="w-32 h-32 grayscale rotate-12" alt="" />
                        </div>
                        <div className="absolute bottom-2 right-8 opacity-[0.03] dark:opacity-[0.02]">
                            <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" className="w-24 h-24 grayscale -rotate-12" alt="" />
                        </div>
                    </div>

                    <div className="relative z-10">
                      <p className="text-zinc-400 dark:text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-2">{t.totalBalance}</p>
                      <h1 className="text-[36px] md:text-[40px] font-bold tracking-tight text-[#1A1C1E] dark:text-white leading-tight">
                          {formatPrice(totalBalance)}
                      </h1>

                      <div className="mt-4 flex items-center space-x-2">
                          <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[12px] font-bold ${isPositive ? 'text-emerald-600 bg-emerald-500/5' : 'text-red-500 bg-red-500/5'}`}>
                              <Triangle size={6} fill="currentColor" className={`${!isPositive ? 'rotate-180' : ''}`} />
                              <span>{isPositive ? '+' : '-'}{formatPrice(Math.abs(balanceChangeUsd))}</span>
                          </div>
                          <span className="text-zinc-200 dark:text-zinc-800 font-light">|</span>
                          <span className={`text-[12px] font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            0,08%
                          </span>
                      </div>
                      
                      <button onClick={() => setShowCopyMenu(true)} className="absolute top-0 right-0 p-2 text-zinc-300 dark:text-zinc-700 hover:text-blue-600 transition-colors">
                          <Copy size={18} />
                      </button>
                    </div>
                </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="px-4 md:px-0 mb-6 shrink-0">
                <div className="flex items-center justify-between">
                    {[
                        { icon: ArrowUpRight, label: t.send, view: 'send' as View },
                        { icon: Plus, label: t.topup, view: 'receive' as View },
                        { icon: Repeat, label: t.swap, view: 'swap' as View },
                        { icon: Landmark, label: t.sell, view: 'discover' as View }
                    ].map((action, i) => (
                        <button 
                            key={i}
                            onClick={() => action.view && onAction(action.view)}
                            className="flex-1 flex flex-col items-center space-y-2 btn-press"
                        >
                            <div className="w-[56px] h-[56px] rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center transition-transform">
                                <action.icon size={24} strokeWidth={2.5} />
                            </div>
                            <span className="text-[12px] font-bold text-[#1A1C1E] dark:text-zinc-200 tracking-tight">
                              {action.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Assets List Section */}
        <div className="px-4 md:px-0 flex-1 min-h-0 flex flex-col mb-4">
            <div className="flex-1 bg-white dark:bg-dark-surface rounded-[32px] border border-zinc-200/40 dark:border-white/5 flex flex-col overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-zinc-50 dark:border-white/5">
                    <div className="flex space-x-6">
                        <button className="text-[14px] font-bold text-blue-600 border-b-2 border-blue-600 pb-2">
                            {t.crypto}
                        </button>
                        <button className="text-[14px] font-semibold text-zinc-400 pb-2">NFTs</button>
                        <button className="text-[14px] font-semibold text-zinc-400 pb-2">Yield</button>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => onAction('history')} className="p-1.5 text-zinc-300 hover:text-blue-600">
                            <History size={20} />
                        </button>
                        <button onClick={toggleSort} className={`p-1.5 rounded-lg ${sortOrder !== 'default' ? 'text-blue-600' : 'text-zinc-300'}`}>
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>
                </div>

                <div 
                  ref={listRef} 
                  className="flex-1 overflow-y-auto no-scrollbar px-2 pt-2 pb-6"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                    {assets.map((asset) => (
                    <div 
                        key={asset.id} 
                        className="flex items-center justify-between py-3 px-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all cursor-pointer group"
                        onClick={() => onAction('asset-detail', asset.id)}
                    >
                        <div className="flex items-center space-x-4 min-w-0">
                            <div className="w-[40px] h-[40px] rounded-xl bg-zinc-50 dark:bg-dark-bg flex items-center justify-center p-2 border border-zinc-100 dark:border-white/5">
                                <img src={asset.logoUrl} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center space-x-1.5 mb-0.5">
                                    <h3 className="font-bold text-[15px] text-[#1A1C1E] dark:text-zinc-100 uppercase tracking-tight">{asset.symbol}</h3>
                                    <span className="text-[8px] font-bold text-blue-500/80 bg-blue-500/10 px-1 rounded-[4px] uppercase border border-blue-500/10">{asset.network}</span>
                                </div>
                                <p className="text-[12px] font-medium text-zinc-400 tracking-tight">{formatPrice(asset.priceUsd)}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="font-bold text-[16px] text-[#1A1C1E] dark:text-zinc-100 tracking-tight">
                                {formatToken(asset.balance)}
                            </p>
                            <p className={`text-[12px] font-medium mt-0.5 ${asset.change24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                            </p>
                        </div>
                    </div>
                    ))}
                    
                    <button className="w-[calc(100%-24px)] mx-3 mt-4 py-3.5 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center space-x-2 text-zinc-300 font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-50 transition-colors">
                        <Plus size={14} strokeWidth={3} />
                        <span>{t.manage}</span>
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Copy Address Modal */}
      {showCopyMenu && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setShowCopyMenu(false)}></div>
          <div className="w-full max-w-[400px] bg-white dark:bg-zinc-950 rounded-t-[32px] md:rounded-[32px] p-6 pb-10 relative animate-ios-bottom-up shadow-2xl">
            <div className="w-10 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6 md:hidden"></div>
            <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-lg font-bold tracking-tight">Адрес кошелька</h3>
                <button onClick={() => setShowCopyMenu(false)} className="text-zinc-400">
                    <X size={20} />
                </button>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'BITCOIN', type: 'bitcoin' as const, logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', network: 'SegWit' },
                { label: 'EVM', type: 'evm' as const, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', network: 'Multi-chain' },
                { label: 'TRON', type: 'tron' as const, logo: 'https://cryptologos.cc/logos/tron-trx-logo.png', network: 'TRC-20' },
              ].map((item) => (
                <button 
                  key={item.type}
                  onClick={() => handleCopy(item.type)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 btn-press"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-dark-bg p-1.5 shadow-sm">
                      <img src={item.logo} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-[13px] block leading-none mb-1">{item.label}</span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{item.network}</span>
                    </div>
                  </div>
                  {copiedNetwork === item.type ? (
                    <div className="text-emerald-600 pr-2">
                        <Check size={18} strokeWidth={3} />
                    </div>
                  ) : (
                    <Copy size={16} className="text-zinc-300" />
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
