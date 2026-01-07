
import React, { useState, useRef } from 'react';
import { Asset, View, SortOrder } from '../types';
import { ArrowUpRight, Plus, Repeat, Landmark, Settings, ScanLine, Copy, ChevronDown, History, SlidersHorizontal, Loader2, X, Check, Triangle, Eye, EyeOff } from 'lucide-react';
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
  const [isBalanceVisible, setIsBalanceVisible] = useState(() => {
    return localStorage.getItem('demo_balance_visible') !== 'false';
  });
  
  const touchStartRef = useRef(0);
  const isPulling = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  const balanceChangeUsd = totalBalance * 0.0008;
  const isPositive = balanceChangeUsd >= 0;

  const toggleBalanceVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isBalanceVisible;
    setIsBalanceVisible(next);
    localStorage.setItem('demo_balance_visible', String(next));
  };

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
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = addr;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedNetwork(type);
      setTimeout(() => {
        setCopiedNetwork(null);
        setShowCopyMenu(false);
      }, 1200);
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-transparent text-black dark:text-zinc-100 transition-colors duration-300 relative animate-fade-in md:px-0 md:py-8"
      style={{ transform: `translateY(${pullDistance}px)`, transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none' }}
    >
      <div className="absolute left-0 right-0 flex justify-center pointer-events-none" style={{ top: -40, opacity: Math.min(pullDistance / 40, 1) }}>
        <Loader2 className={`text-blue-600 ${isRefreshing || pullDistance > 60 ? 'animate-spin' : ''}`} size={24} />
      </div>

      <div className="px-0 pt-4 flex justify-between items-center shrink-0 mb-2 md:mb-10">
        <button 
          onClick={() => onAction('wallet-manager')}
          className="flex items-center space-x-2 bg-zinc-100/80 dark:bg-dark-surface/80 backdrop-blur-md p-1 pr-3.5 rounded-full border border-zinc-200/50 dark:border-dark-border btn-press ml-1"
        >
          <div className="w-7 h-7 rounded-full bg-zinc-300 dark:bg-dark-elevated flex items-center justify-center overflow-hidden border border-white/20">
             <img src="https://api.dicebear.com/7.x/shapes/svg?seed=Lucky" alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-[14px] md:text-[16px] font-bold tracking-tight">{walletName}</span>
            <ChevronDown size={13} className="text-zinc-400" />
          </div>
        </button>
        
        <div className="flex items-center space-x-1.5 md:hidden mr-1">
          <button className="p-2 text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md rounded-full shadow-sm border border-zinc-100 dark:border-dark-border btn-press">
            <ScanLine size={18} />
          </button>
          <button 
            onClick={() => onAction('settings')}
            className="p-2 text-zinc-500 dark:text-zinc-400 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md rounded-full shadow-sm border border-zinc-100 dark:border-dark-border btn-press"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row md:space-x-4 min-h-0">
        <div className="md:w-[400px] shrink-0">
            <div className="px-0 md:px-0 mb-4 shrink-0">
                <div className="relative overflow-hidden bg-white/80 dark:bg-dark-surface/80 backdrop-blur-lg rounded-[28px] md:rounded-[36px] p-6 md:p-10 border border-zinc-200/50 dark:border-dark-border shadow-[0_10px_40px_rgba(0,0,0,0.02)] dark:shadow-none transition-all group">
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <p className="text-zinc-400 font-bold text-[10px] md:text-[12px] uppercase tracking-[0.2em]">{t.totalBalance}</p>
                            <button onClick={toggleBalanceVisibility} className="text-zinc-300 hover:text-blue-600 transition-colors">
                                {isBalanceVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                        </div>
                        <button onClick={() => setShowCopyMenu(true)} className="p-1 text-zinc-300 hover:text-blue-600 transition-colors">
                            <Copy size={13} />
                        </button>
                    </div>
                    
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className={`text-[34px] md:text-[48px] font-extrabold tracking-tighter leading-none text-black dark:text-white transition-all duration-300 ${!isBalanceVisible ? 'blur-balance' : ''}`}>
                                {formatPrice(totalBalance)}
                            </h1>
                            <div className={`mt-3 md:mt-6 flex items-center space-x-1.5 font-bold text-[13px] md:text-[16px] transition-all duration-300 ${!isBalanceVisible ? 'blur-balance opacity-50' : ''} ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                <Triangle size={10} fill="currentColor" className={`${!isPositive ? 'rotate-180' : ''}`} />
                                <span>{isPositive ? '+' : '-'}{formatPrice(Math.abs(balanceChangeUsd))} (+0,08%)</span>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <div className="px-2 md:px-0 mb-5 md:mb-10 shrink-0">
                <div className="grid grid-cols-4 md:grid-cols-2 gap-3 md:gap-5">
                {[
                    { icon: ArrowUpRight, label: t.send, view: 'send' as View, bg: 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' },
                    { icon: Plus, label: t.topup, view: 'receive' as View, bg: 'bg-zinc-100/80 dark:bg-dark-surface/80 backdrop-blur-md text-zinc-700 dark:text-zinc-200 border border-zinc-200/30 dark:border-dark-border' },
                    { icon: Repeat, label: t.swap, view: 'swap' as View, bg: 'bg-zinc-100/80 dark:bg-dark-surface/80 backdrop-blur-md text-zinc-700 dark:text-zinc-200 border border-zinc-200/30 dark:border-dark-border' },
                    { icon: Landmark, label: t.sell, view: null, bg: 'bg-zinc-100/80 dark:bg-dark-surface/80 backdrop-blur-md text-zinc-700 dark:text-zinc-200 border border-zinc-200/30 dark:border-dark-border' }
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

        <div className="px-0 md:px-0 flex-1 min-h-0 flex flex-col mb-4 md:mb-0">
            <div 
                className="flex-1 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl rounded-[28px] md:rounded-[36px] border border-zinc-200/50 dark:border-dark-border shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 shrink-0 border-b border-zinc-50/50 dark:border-dark-border/30">
                    <div className="flex space-x-6 md:space-x-10">
                        <button className="text-[14px] md:text-[16px] font-extrabold text-zinc-900 dark:text-zinc-100 border-b-2 md:border-b-3 border-blue-600 pb-1">
                            {t.crypto}
                        </button>
                        <button className="text-[14px] md:text-[16px] font-bold text-zinc-400 opacity-50 pb-1">NFTs</button>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button onClick={() => onAction('history')} className="p-1.5 text-zinc-400 hover:text-blue-600 transition-colors bg-zinc-50/50 dark:bg-dark-bg rounded-xl">
                            <History size={16} className="md:w-4 md:h-4" />
                        </button>
                        <button 
                            onClick={toggleSort} 
                            className={`p-1.5 rounded-xl transition-colors ${sortOrder !== 'default' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-400 bg-zinc-50/50 dark:bg-dark-bg'}`}
                        >
                            <SlidersHorizontal size={16} className="md:w-4 md:h-4" />
                        </button>
                    </div>
                </div>

                <div ref={listRef} className="flex-1 overflow-y-auto no-scrollbar px-0 md:px-4 pb-6 pt-1 space-y-0.5">
                    {assets.map((asset) => (
                    <div 
                        key={asset.id} 
                        className="flex items-center justify-between py-2 px-2 md:p-4 bg-transparent dark:bg-transparent rounded-[18px] md:rounded-[24px] hover:bg-zinc-50 dark:hover:bg-dark-elevated/20 active:bg-zinc-100 transition-all cursor-pointer group"
                        onClick={() => onAction('asset-detail', asset.id)}
                    >
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <div className="relative shrink-0">
                                <div className="w-[38px] h-[38px] md:w-[48px] md:h-[48px] rounded-full bg-zinc-50/80 dark:bg-dark-bg/80 flex items-center justify-center p-2 md:p-2 border border-zinc-100 dark:border-dark-border/50 shadow-sm group-hover:scale-105 transition-transform">
                                    <img src={asset.logoUrl} alt="" className="w-full h-full object-contain rounded-[22%]" />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center space-x-2">
                                    <h3 className="font-bold text-[16px] md:text-[18px] leading-tight text-zinc-900 dark:text-zinc-100">{asset.symbol}</h3>
                                    <span className="text-[10px] md:text-[11px] font-bold text-blue-500 bg-blue-500/5 px-1.5 py-0.5 rounded-md uppercase tracking-wider">{asset.network}</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-0.5">
                                    <span className="text-[12px] md:text-[14px] font-bold text-zinc-400 tracking-tight">{formatPrice(asset.priceUsd)}</span>
                                    <span className={`text-[11px] md:text-[13px] font-extrabold ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <p className={`font-extrabold text-[17px] md:text-[19px] leading-tight text-zinc-900 dark:text-zinc-100 tracking-tight transition-all duration-300 ${!isBalanceVisible ? 'blur-balance opacity-70' : ''}`}>
                                {formatToken(asset.balance)}
                            </p>
                            <p className={`text-[13px] md:text-[15px] text-zinc-400 font-bold opacity-60 mt-0.5 transition-all duration-300 ${!isBalanceVisible ? 'blur-balance opacity-30' : ''}`}>
                                {formatPrice(asset.balance * asset.priceUsd)}
                            </p>
                        </div>
                    </div>
                    ))}
                    
                    <div className="px-2">
                      <button className="w-full py-3 md:py-4 bg-zinc-50/50 dark:bg-dark-surface/50 rounded-[18px] md:rounded-[24px] flex items-center justify-center space-x-2.5 text-zinc-400 font-bold text-[10px] md:text-[11px] hover:bg-zinc-100 transition-colors uppercase tracking-widest mt-2 border border-dashed border-zinc-200 dark:border-dark-border">
                          <Plus size={12} className="md:w-4 md:h-4" />
                          <span>{t.manage}</span>
                      </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

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
                <button key={item.type} onClick={() => handleCopy(item.type)} className="w-full flex items-center justify-between p-5 rounded-[26px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 btn-press">
                  <div className="flex items-center space-x-5">
                    <div className="w-11 h-11 rounded-2xl bg-white dark:bg-dark-surface p-2 shadow-sm"><img src={item.logo} className="w-full h-full object-contain" alt="" /></div>
                    <div className="text-left"><span className="font-extrabold text-[15px] block leading-none mb-1">{item.label}</span><span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">{item.network}</span></div>
                  </div>
                  {copiedNetwork === item.type ? (<div className="flex items-center space-x-1.5 text-green-500 font-bold text-[12px] uppercase animate-pop-in"><Check size={18} strokeWidth={3} /><span>Copied</span></div>) : (<div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-300"><Copy size={18} /></div>)}
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
