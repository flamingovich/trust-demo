
import React, { useState, useRef } from 'react';
import { Asset, View, SortOrder } from '../types';
import { ArrowUpRight, Plus, Repeat, Landmark, Settings, ScanLine, Copy, ChevronDown, History, SlidersHorizontal, Loader2, X, Check, BellRing } from 'lucide-react';

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

  const generateRandomAddress = (type: 'bitcoin' | 'evm' | 'tron') => {
    const chars = '0123456789abcdef';
    let res = '';
    if (type === 'evm') {
      res = '0x';
      for (let i = 0; i < 40; i++) res += chars[Math.floor(Math.random() * chars.length)];
    } else if (type === 'tron') {
      res = 'T';
      const trChars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      for (let i = 0; i < 33; i++) res += trChars[Math.floor(Math.random() * trChars.length)];
    } else {
      res = 'bc1q';
      const btcChars = '0123456789abcdefghijklmnopqrstuvwxyz';
      for (let i = 0; i < 38; i++) res += btcChars[Math.floor(Math.random() * btcChars.length)];
    }
    return res;
  };

  const handleCopy = (type: 'bitcoin' | 'evm' | 'tron') => {
    const addr = generateRandomAddress(type);
    navigator.clipboard.writeText(addr);
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
      className="flex flex-col h-full bg-[#fcfcfd] dark:bg-dark-bg text-black dark:text-zinc-100 transition-colors duration-300 relative animate-fade-in"
      style={{ transform: `translateY(${pullDistance}px)`, transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none' }}
    >
      {/* Pull-to-refresh Indicator */}
      <div className="absolute left-0 right-0 flex justify-center pointer-events-none" style={{ top: -40, opacity: Math.min(pullDistance / 40, 1) }}>
        <Loader2 className={`text-blue-600 ${isRefreshing || pullDistance > 60 ? 'animate-spin' : ''}`} size={24} />
      </div>

      {/* COMPACT Header Section */}
      <div className="px-5 pt-4 flex justify-between items-center shrink-0 mb-2">
        <button 
          onClick={() => onAction('wallet-manager')}
          className="flex items-center space-x-2 bg-zinc-100/80 dark:bg-dark-surface p-1 pr-3.5 rounded-full border border-zinc-200/50 dark:border-dark-border btn-press"
        >
          <div className="w-6 h-6 rounded-full bg-zinc-300 dark:bg-dark-elevated flex items-center justify-center overflow-hidden">
             <img src="https://api.dicebear.com/7.x/shapes/svg?seed=Lucky" alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center space-x-0.5">
            <span className="text-[12px] font-bold tracking-tight">{walletName}</span>
            <ChevronDown size={11} className="text-zinc-400" />
          </div>
        </button>
        
        <div className="flex items-center space-x-1">
          <button className="p-1.5 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-dark-surface rounded-full shadow-sm border border-zinc-100 dark:border-dark-border btn-press">
            <ScanLine size={15} />
          </button>
          <button 
            onClick={() => onAction('settings')}
            className="p-1.5 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-dark-surface rounded-full shadow-sm border border-zinc-100 dark:border-dark-border btn-press"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {/* FEATURED Balance Card - Redesigned to stand out */}
      <div className="px-5 mb-4 shrink-0">
        <div className="relative overflow-hidden bg-white dark:bg-dark-surface rounded-[28px] p-5 border border-zinc-200/50 dark:border-dark-border shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-none group transition-all">
          <div className="flex justify-between items-start mb-0.5">
            <p className="text-zinc-400 font-bold text-[9px] uppercase tracking-widest">{t.totalBalance}</p>
            <button onClick={() => setShowCopyMenu(true)} className="p-1 text-zinc-300 hover:text-blue-600 transition-colors">
              <Copy size={13} />
            </button>
          </div>
          <div className="flex items-baseline space-x-2">
            <h1 className="text-[32px] font-extrabold tracking-tighter leading-none mb-1">
              {formatPrice(totalBalance)}
            </h1>
          </div>
          <div className={`flex items-center space-x-1.5 font-bold text-[10px] ${balanceChangeUsd >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <Plus size={10} strokeWidth={3} />
            <span>{formatPrice(balanceChangeUsd)} (+0,08%)</span>
          </div>
          
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </div>

      {/* COMPACT Actions - Grid Style */}
      <div className="px-8 mb-5 shrink-0">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: ArrowUpRight, label: t.send, view: 'send' as View, bg: 'bg-blue-600 text-white' },
            { icon: Plus, label: t.topup, view: 'receive' as View, bg: 'bg-zinc-100 dark:bg-dark-surface text-zinc-700 dark:text-zinc-200' },
            { icon: Repeat, label: t.swap, view: 'swap' as View, bg: 'bg-zinc-100 dark:bg-dark-surface text-zinc-700 dark:text-zinc-200' },
            { icon: Landmark, label: t.sell, view: null, bg: 'bg-zinc-100 dark:bg-dark-surface text-zinc-700 dark:text-zinc-200' }
          ].map((action, i) => (
            <div key={i} className="flex flex-col items-center space-y-1">
              <button 
                onClick={() => action.view && onAction(action.view)}
                className={`w-[48px] h-[48px] ${action.bg} rounded-[16px] flex items-center justify-center btn-press shadow-sm transition-transform active:scale-90`}
              >
                <action.icon size={18} strokeWidth={2.5} />
              </button>
              <span className="text-[9px] font-normal text-zinc-500 dark:text-zinc-400 lowercase leading-tight">{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* EXPANDED Assets Section */}
      <div className="flex-1 bg-white dark:bg-dark-surface/30 rounded-t-[28px] border-t border-zinc-100 dark:border-dark-border shadow-[0_-8px_30px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden">
        {/* Tabs / Filter Row */}
        <div className="flex items-center justify-between px-6 py-3 shrink-0">
          <div className="flex space-x-6">
            <button className="text-[13px] font-extrabold text-zinc-900 dark:text-zinc-100 border-b-2 border-blue-600 pb-0.5">
              {t.crypto}
            </button>
            <button className="text-[13px] font-bold text-zinc-400 opacity-50 pb-0.5">NFTs</button>
          </div>
          <div className="flex items-center space-x-1">
            <button onClick={() => onAction('history')} className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors">
              <History size={16} />
            </button>
            <button 
              onClick={toggleSort} 
              className={`p-1.5 rounded-lg transition-colors ${sortOrder !== 'default' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-400'}`}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Assets List */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-20 space-y-1.5">
          {assets.map((asset) => (
            <div 
              key={asset.id} 
              className="flex items-center justify-between p-2.5 bg-zinc-50/50 dark:bg-dark-surface/50 rounded-[20px] border border-transparent dark:border-dark-border/40 active:bg-zinc-100 dark:active:bg-dark-elevated transition-all cursor-pointer"
              onClick={() => onAction('asset-detail', asset.id)}
            >
              <div className="flex items-center space-x-3.5">
                <div className="relative shrink-0">
                  <div className="w-[42px] h-[42px] rounded-[12px] bg-white dark:bg-dark-bg flex items-center justify-center p-1.5 shadow-sm border border-zinc-100 dark:border-dark-border/50">
                    <img src={asset.logoUrl} alt="" className="w-full h-full object-contain" />
                  </div>
                  {asset.networkIcon && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-dark-bg p-0.5 shadow-sm border border-zinc-50 dark:border-dark-bg flex items-center justify-center">
                      <img src={asset.networkIcon} alt="" className="w-full h-full object-contain rounded-full" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[14px] leading-tight text-zinc-900 dark:text-zinc-100">{asset.symbol}</h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-[10px] font-medium text-zinc-400 tracking-tight">{formatPrice(asset.priceUsd)}</span>
                    <span className={`text-[9px] font-bold ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-[14px] leading-tight text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {formatToken(asset.balance)}
                </p>
                <p className="text-[10px] text-zinc-400 font-medium opacity-60">
                  {formatPrice(asset.balance * asset.priceUsd)}
                </p>
              </div>
            </div>
          ))}
          
          <button className="w-full py-3 bg-zinc-100/30 dark:bg-dark-surface/30 rounded-[20px] flex items-center justify-center space-x-2 text-zinc-400 font-bold text-[10px] hover:bg-zinc-100 transition-colors uppercase tracking-widest mt-2">
            <Plus size={12} />
            <span>{t.manage}</span>
          </button>
        </div>
      </div>

      {/* Copy Modal Overlay */}
      {showCopyMenu && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-fade-in p-0 m-0">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCopyMenu(false)}></div>
          <div className="w-full max-w-[430px] bg-white dark:bg-zinc-950 rounded-t-[32px] p-6 pb-10 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
            <div className="w-10 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6"></div>
            <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-lg font-extrabold tracking-tight">Copy Address</h3>
                <button onClick={() => setShowCopyMenu(false)} className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 btn-press">
                    <X size={14} strokeWidth={2.5} />
                </button>
            </div>
            <div className="space-y-2">
              {[
                { label: 'BITCOIN', type: 'bitcoin' as const, logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', network: 'SegWit' },
                { label: 'EVM', type: 'evm' as const, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', network: 'Multi-chain' },
                { label: 'TRON', type: 'tron' as const, logo: 'https://cryptologos.cc/logos/tron-trx-logo.png', network: 'TRC-20' },
              ].map((item) => (
                <button 
                  key={item.type}
                  onClick={() => handleCopy(item.type)}
                  className="w-full flex items-center justify-between p-3.5 rounded-[18px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 btn-press"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-dark-surface p-1.5 shadow-sm">
                      <img src={item.logo} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="text-left">
                      <span className="font-extrabold text-[13px] block leading-none mb-0.5">{item.label}</span>
                      <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">{item.network}</span>
                    </div>
                  </div>
                  {copiedNetwork === item.type ? (
                    <div className="flex items-center space-x-1 text-green-500 font-bold text-[9px] uppercase animate-pop-in">
                        <Check size={12} strokeWidth={3} />
                        <span>Copied</span>
                    </div>
                  ) : (
                    <div className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-300">
                      <Copy size={12} />
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
