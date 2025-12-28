
import React, { useState, useRef } from 'react';
import { Asset, View, SortOrder } from '../types';
import { ArrowUpRight, Plus, Repeat, Landmark, Sprout, Settings, ScanLine, Copy, Search, ChevronDown, History, SlidersHorizontal, Loader2, X, Check } from 'lucide-react';

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
      className="flex flex-col h-full bg-white dark:bg-dark-bg text-black dark:text-zinc-100 transition-colors duration-300 relative animate-fade-in"
      style={{ transform: `translateY(${pullDistance}px)`, transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none' }}
    >
      <div className="absolute left-0 right-0 flex justify-center pointer-events-none" style={{ top: -40, opacity: Math.min(pullDistance / 40, 1) }}>
        <Loader2 className={`text-blue-600 ${isRefreshing || pullDistance > 60 ? 'animate-spin' : ''}`} size={24} />
      </div>

      <div className="px-6 pt-4 flex justify-between items-center shrink-0">
        <button onClick={() => onAction('settings')} className="p-2 text-zinc-500 dark:text-zinc-400 btn-press">
          <Settings size={22} strokeWidth={2} />
        </button>
        <button className="p-2 text-zinc-500 dark:text-zinc-400 btn-press">
          <ScanLine size={22} strokeWidth={2} />
        </button>
        
        {/* Wallet Selection Button */}
        <button 
          onClick={() => onAction('wallet-manager')}
          className="flex items-center space-x-1 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-dark-surface border border-zinc-200 dark:border-dark-border btn-press active:scale-95 transition-transform"
        >
          <span className="text-[13px] font-bold tracking-tight">{walletName}</span>
          <ChevronDown size={14} strokeWidth={3} />
        </button>

        <button onClick={() => setShowCopyMenu(true)} className="p-2 text-zinc-500 dark:text-zinc-400 btn-press">
          <Copy size={20} strokeWidth={2} />
        </button>
        <button className="p-2 text-zinc-500 dark:text-zinc-400 btn-press">
          <Search size={22} strokeWidth={2} />
        </button>
      </div>

      <div className="text-center mt-8 mb-8 shrink-0">
        <h1 className="text-[44px] font-bold tracking-tight leading-none mb-3">
          {formatPrice(totalBalance)}
        </h1>
        <div className="flex items-center justify-center space-x-1.5 text-green-600 dark:text-green-500 font-bold text-[13px] bg-green-500/5 dark:bg-green-500/10 py-1.5 px-3 rounded-full w-fit mx-auto transition-all">
          <Plus size={14} strokeWidth={3} />
          <span>{formatPrice(balanceChangeUsd)} (+0,08%)</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1 px-4 mb-10 shrink-0">
        {[
          { icon: ArrowUpRight, label: t.send, view: 'send' as View, bg: 'bg-zinc-100 dark:bg-dark-surface' },
          { icon: Plus, label: t.topup, view: 'receive' as View, bg: 'bg-zinc-100 dark:bg-dark-surface' },
          { icon: Repeat, label: t.swap, view: 'swap' as View, bg: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' },
          { icon: Landmark, label: t.sell, view: null, bg: 'bg-zinc-100 dark:bg-dark-surface' },
          { icon: Sprout, label: t.earn, view: null, bg: 'bg-zinc-100 dark:bg-dark-surface' }
        ].map((action, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <button 
              onClick={() => action.view && onAction(action.view)} 
              className={`w-[56px] h-[56px] ${action.bg} rounded-[22px] flex items-center justify-center transition-all btn-press shadow-sm`}
            >
              <action.icon size={22} strokeWidth={2.5} />
            </button>
            <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-300 uppercase tracking-tighter">{action.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-6 border-b border-zinc-100 dark:border-dark-border mb-2 shrink-0">
        <div className="flex space-x-6">
          <button className="pb-3 border-b-2 border-blue-600 font-bold text-[15px] text-zinc-900 dark:text-zinc-100">{t.crypto}</button>
          <button className="pb-3 text-zinc-400 font-bold text-[15px] opacity-60">NFTs</button>
        </div>
        <div className="flex items-center space-x-4 pb-3">
          <button onClick={() => onAction('history')} className="text-zinc-500 dark:text-zinc-400 btn-press">
            <History size={20} strokeWidth={2} />
          </button>
          <button 
            onClick={toggleSort} 
            className={`p-1 rounded-md transition-colors ${sortOrder !== 'default' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-500 dark:text-zinc-400'} btn-press`}
          >
            <SlidersHorizontal size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-20">
        {assets.map((asset) => (
          <div 
            key={asset.id} 
            className="flex items-center justify-between py-4 active:bg-zinc-50 dark:active:bg-dark-surface transition-all cursor-pointer border-b border-zinc-50 dark:border-dark-border last:border-0 rounded-2xl px-2 -mx-2"
            onClick={() => onAction('asset-detail', asset.id)}
          >
            <div className="flex items-center space-x-4">
              <div className="relative shrink-0">
                <div className="w-[42px] h-[42px] rounded-full bg-zinc-50 dark:bg-dark-surface flex items-center justify-center shadow-sm border border-zinc-100 dark:border-dark-border/50">
                  <img 
                    src={asset.logoUrl} 
                    alt="" 
                    className="w-7 h-7 object-contain rounded-[22%]" 
                  />
                </div>
                {asset.networkIcon && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-dark-bg p-0.5 border border-zinc-100 dark:border-dark-bg shadow-sm flex items-center justify-center">
                    <img src={asset.networkIcon} alt="" className="w-full h-full object-contain rounded-full" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-[16px] leading-tight">{asset.symbol}</h3>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-dark-elevated text-zinc-500 font-extrabold uppercase tracking-widest leading-none">
                    {asset.network}
                  </span>
                </div>
                <p className="text-[13px] text-zinc-500 font-medium">
                  {formatPrice(asset.priceUsd)} 
                  <span className={`ml-2 font-bold ${asset.change24h >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-500'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-[17px] leading-tight tracking-tight">
                {formatToken(asset.balance)}
              </p>
              <p className="text-[13px] text-zinc-500 font-bold">
                {formatPrice(asset.balance * asset.priceUsd)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showCopyMenu && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-fade-in p-0 m-0">
          <div className="absolute inset-0 bg-black/60 glass-panel" onClick={() => setShowCopyMenu(false)}></div>
          <div className="w-full max-w-[430px] bg-white dark:bg-zinc-950 rounded-t-[32px] p-6 pb-12 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
            <div className="w-10 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6"></div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Copy Address</h3>
                <button onClick={() => setShowCopyMenu(false)} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500">
                    <X size={20} />
                </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'BITCOIN', type: 'bitcoin' as const, logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
                { label: 'EVM (ETH, BNB, SOL)', type: 'evm' as const, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
                { label: 'TRON (TRX, USDT)', type: 'tron' as const, logo: 'https://cryptologos.cc/logos/tron-trx-logo.png' },
              ].map((item) => (
                <button 
                  key={item.type}
                  onClick={() => handleCopy(item.type)}
                  className="w-full flex items-center justify-between p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 btn-press"
                >
                  <div className="flex items-center space-x-4">
                    <img src={item.logo} className="w-6 h-6 object-contain" alt="" />
                    <span className="font-bold text-[15px]">{item.label}</span>
                  </div>
                  {copiedNetwork === item.type ? (
                    <div className="flex items-center space-x-1 text-green-500 font-bold text-xs uppercase animate-pop-in">
                        <Check size={14} strokeWidth={3} />
                        <span>Copied</span>
                    </div>
                  ) : (
                    <Copy size={18} className="text-zinc-400" />
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
