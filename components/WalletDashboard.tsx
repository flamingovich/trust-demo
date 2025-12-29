
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
      className="flex flex-col h-full bg-[#f8f9fa] dark:bg-dark-bg text-black dark:text-zinc-100 transition-colors duration-300 relative animate-fade-in"
      style={{ transform: `translateY(${pullDistance}px)`, transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none' }}
    >
      {/* Pull-to-refresh Indicator */}
      <div className="absolute left-0 right-0 flex justify-center pointer-events-none" style={{ top: -40, opacity: Math.min(pullDistance / 40, 1) }}>
        <Loader2 className={`text-blue-600 ${isRefreshing || pullDistance > 60 ? 'animate-spin' : ''}`} size={24} />
      </div>

      {/* Header with Settings Access */}
      <div className="px-6 pt-10 flex justify-between items-center shrink-0 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-dark-surface border border-zinc-300 dark:border-dark-border flex items-center justify-center overflow-hidden">
             <img src="https://api.dicebear.com/7.x/shapes/svg?seed=Lucky" alt="avatar" className="w-full h-full object-cover" />
          </div>
          <button 
            onClick={() => onAction('wallet-manager')}
            className="flex flex-col items-start btn-press"
          >
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-0.5">{t.wallet}</span>
            <div className="flex items-center space-x-1">
              <span className="text-[15px] font-bold tracking-tight">{walletName}</span>
              <ChevronDown size={14} className="text-zinc-400" />
            </div>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2.5 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-dark-surface rounded-full shadow-sm border border-zinc-100 dark:border-dark-border btn-press">
            <ScanLine size={18} />
          </button>
          <button 
            onClick={() => onAction('settings')}
            className="p-2.5 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-dark-surface rounded-full shadow-sm border border-zinc-100 dark:border-dark-border btn-press"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Modern Balance Area */}
      <div className="px-6 mb-8 shrink-0">
        <div className="bg-white dark:bg-dark-surface rounded-[36px] p-8 border border-zinc-100 dark:border-dark-border shadow-[0_12px_40px_rgb(0,0,0,0.03)] dark:shadow-none transition-all">
          <div className="flex justify-between items-start mb-1">
            <p className="text-zinc-400 font-bold text-[11px] uppercase tracking-widest">{t.totalBalance}</p>
            <button onClick={() => setShowCopyMenu(true)} className="p-1 text-zinc-300 hover:text-blue-600 transition-colors">
               <Copy size={16} />
            </button>
          </div>
          <h1 className="text-[42px] font-extrabold tracking-tighter leading-none mb-3">
            {formatPrice(totalBalance)}
          </h1>
          <div className={`inline-flex items-center space-x-1.5 font-bold text-[12px] px-3 py-1 rounded-full ${balanceChangeUsd >= 0 ? 'bg-green-500/5 text-green-500' : 'bg-red-500/5 text-red-500'}`}>
            <Plus size={12} strokeWidth={3} />
            <span>{formatPrice(balanceChangeUsd)} (+0,08%)</span>
          </div>
        </div>
      </div>

      {/* Quick Actions - Updated Labels (Smaller, Regular Font) */}
      <div className="px-6 mb-10 shrink-0">
        <div className="flex justify-between items-center px-4">
          {[
            { icon: ArrowUpRight, label: t.send, view: 'send' as View, color: 'text-blue-600 bg-blue-50 dark:bg-blue-600/10' },
            { icon: Plus, label: t.topup, view: 'receive' as View, color: 'text-zinc-600 dark:text-zinc-200 bg-white dark:bg-dark-surface border border-zinc-100 dark:border-dark-border' },
            { icon: Repeat, label: t.swap, view: 'swap' as View, color: 'text-zinc-600 dark:text-zinc-200 bg-white dark:bg-dark-surface border border-zinc-100 dark:border-dark-border' },
            { icon: Landmark, label: t.sell, view: null, color: 'text-zinc-600 dark:text-zinc-200 bg-white dark:bg-dark-surface border border-zinc-100 dark:border-dark-border' }
          ].map((action, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <button 
                onClick={() => action.view && onAction(action.view)}
                className={`w-[58px] h-[58px] ${action.color} rounded-full flex items-center justify-center btn-press shadow-sm group`}
              >
                <action.icon size={22} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
              </button>
              <span className="text-[10px] font-normal text-zinc-500 dark:text-zinc-400 lowercase tracking-tight">{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Asset List Tabs */}
      <div className="flex items-center justify-between px-6 mb-5 shrink-0">
        <div className="flex space-x-5">
          <button className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 relative group">
            {t.crypto}
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
          </button>
          <button className="text-[15px] font-bold text-zinc-400 opacity-50">NFTs</button>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => onAction('history')} className="w-9 h-9 flex items-center justify-center text-zinc-400 bg-white dark:bg-dark-surface rounded-full border border-zinc-100 dark:border-dark-border shadow-sm btn-press">
            <History size={18} />
          </button>
          <button 
            onClick={toggleSort} 
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors border border-zinc-100 dark:border-dark-border shadow-sm ${sortOrder !== 'default' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-400 bg-white dark:bg-dark-surface'} btn-press`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Assets - Redesigned Card List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 space-y-4">
        {assets.map((asset) => (
          <div 
            key={asset.id} 
            className="group flex items-center justify-between p-4 bg-white dark:bg-dark-surface rounded-[28px] border border-transparent dark:border-dark-border shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
            onClick={() => onAction('asset-detail', asset.id)}
          >
            <div className="flex items-center space-x-4">
              <div className="relative shrink-0">
                <div className="w-[48px] h-[48px] rounded-2xl bg-zinc-50 dark:bg-dark-elevated flex items-center justify-center p-2 border border-zinc-100 dark:border-dark-border/50 group-hover:scale-105 transition-transform">
                  <img src={asset.logoUrl} alt="" className="w-full h-full object-contain rounded-[22%]" />
                </div>
                {asset.networkIcon && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-dark-bg p-0.5 shadow-sm border border-zinc-100 dark:border-dark-bg flex items-center justify-center">
                    <img src={asset.networkIcon} alt="" className="w-full h-full object-contain rounded-full" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[16px] leading-tight text-zinc-900 dark:text-zinc-100">{asset.symbol}</h3>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{formatPrice(asset.priceUsd)}</span>
                  <span className={`text-[10px] font-bold ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-[16px] leading-tight text-zinc-900 dark:text-zinc-100 tracking-tight">
                {formatToken(asset.balance)}
              </p>
              <p className="text-[12px] text-zinc-400 font-bold opacity-60">
                {formatPrice(asset.balance * asset.priceUsd)}
              </p>
            </div>
          </div>
        ))}
        
        <button className="w-full py-4 bg-zinc-100/50 dark:bg-dark-surface/30 rounded-[28px] flex items-center justify-center space-x-2 text-zinc-400 font-bold text-sm hover:bg-zinc-100 transition-colors">
          <Plus size={16} />
          <span>{t.manage}</span>
        </button>
      </div>

      {/* Copy Modal Overlay */}
      {showCopyMenu && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-fade-in p-0 m-0">
          <div className="absolute inset-0 bg-black/60 glass-panel" onClick={() => setShowCopyMenu(false)}></div>
          <div className="w-full max-w-[430px] bg-white dark:bg-zinc-950 rounded-t-[44px] p-8 pb-12 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8"></div>
            <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-2xl font-extrabold tracking-tight">Copy Address</h3>
                <button onClick={() => setShowCopyMenu(false)} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 btn-press">
                    <X size={20} strokeWidth={2.5} />
                </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'BITCOIN', type: 'bitcoin' as const, logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', network: 'SegWit' },
                { label: 'EVM', type: 'evm' as const, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', network: 'Multi-chain' },
                { label: 'TRON', type: 'tron' as const, logo: 'https://cryptologos.cc/logos/tron-trx-logo.png', network: 'TRC-20' },
              ].map((item) => (
                <button 
                  key={item.type}
                  onClick={() => handleCopy(item.type)}
                  className="w-full flex items-center justify-between p-5 rounded-[28px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 btn-press"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-surface p-2 shadow-sm">
                      <img src={item.logo} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="text-left">
                      <span className="font-extrabold text-[15px] block leading-none mb-1">{item.label}</span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{item.network}</span>
                    </div>
                  </div>
                  {copiedNetwork === item.type ? (
                    <div className="flex items-center space-x-1 text-green-500 font-bold text-xs uppercase animate-pop-in">
                        <Check size={14} strokeWidth={3} />
                        <span>Copied</span>
                    </div>
                  ) : (
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-300">
                      <Copy size={16} />
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
