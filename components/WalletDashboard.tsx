
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

      {/* Header Section */}
      <div className="px-5 pt-4 flex justify-between items-center shrink-0 mb-3">
        <button 
          onClick={() => onAction('wallet-manager')}
          className="flex items-center space-x-2 bg-zinc-100/80 dark:bg-dark-surface p-1 pr-3.5 rounded-full border border-zinc-200/50 dark:border-dark-border btn-press"
        >
          <div className="w-6 h-6 rounded-full bg-zinc-300 dark:bg-dark-elevated flex items-center justify-center overflow-hidden border border-white/20">
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

      {/* IMPROVED Balance Card - Taller, better spacing, decorative icons moved right */}
      <div className="px-5 mb-5 shrink-0">
        <div className="relative overflow-hidden bg-white dark:bg-dark-surface rounded-[32px] p-7 border border-zinc-200/50 dark:border-dark-border shadow-[0_10px_40px_rgba(0,0,0,0.03)] dark:shadow-none transition-all">
          
          {/* Main Content Area */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-1.5 mb-1.5">
                <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em]">{t.totalBalance}</p>
                <button onClick={() => setShowCopyMenu(true)} className="p-1 text-zinc-300 hover:text-blue-600 transition-colors">
                  <Copy size={12} />
                </button>
              </div>
              <h1 className="text-[34px] font-extrabold tracking-tighter leading-none mb-2 text-black dark:text-white">
                {formatPrice(totalBalance)}
              </h1>
              <div className={`inline-flex items-center space-x-1.5 font-bold text-[11px] ${balanceChangeUsd >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <span>{formatPrice(balanceChangeUsd)} (+0,08%)</span>
              </div>
            </div>

            {/* Decorative Coins positioned further right to avoid overlap with numbers */}
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 flex items-center space-x-[-15px] opacity-[0.07] dark:opacity-[0.12] pointer-events-none">
                <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" className="w-12 h-12 grayscale rotate-[-12deg]" alt="" />
                <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" className="w-16 h-16 grayscale rotate-[10deg]" alt="" />
                <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" className="w-14 h-14 grayscale rotate-[-8deg]" alt="" />
            </div>
          </div>
          
          {/* Decorative radial glow purely within the card */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="px-8 mb-6 shrink-0">
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: ArrowUpRight, label: t.send, view: 'send' as View, bg: 'bg-blue-600 text-white' },
            { icon: Plus, label: t.topup, view: 'receive' as View, bg: 'bg-zinc-100 dark:bg-dark-surface text-zinc-700 dark:text-zinc-200 border border-zinc-200/30 dark:border-dark-border' },
            { icon: Repeat, label: t.swap, view: 'swap' as View, bg: 'bg-zinc-100 dark:bg-dark-surface text-zinc-700 dark:text-zinc-200 border border-zinc-200/30 dark:border-dark-border' },
            { icon: Landmark, label: t.sell, view: null, bg: 'bg-zinc-100 dark:bg-dark-surface text-zinc-700 dark:text-zinc-200 border border-zinc-200/30 dark:border-dark-border' }
          ].map((action, i) => (
            <div key={i} className="flex flex-col items-center space-y-1.5">
              <button 
                onClick={() => action.view && onAction(action.view)}
                className={`w-[52px] h-[52px] ${action.bg} rounded-[20px] flex items-center justify-center btn-press shadow-sm transition-transform active:scale-90`}
              >
                <action.icon size={20} strokeWidth={2.5} />
              </button>
              <span className="text-[10px] font-normal text-zinc-500 dark:text-zinc-400 lowercase leading-tight">{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assets Section */}
      <div className="flex-1 bg-white dark:bg-dark-surface/30 rounded-t-[36px] border-t border-zinc-100 dark:border-dark-border shadow-[0_-8px_30px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <div className="flex space-x-6">
            <button className="text-[14px] font-extrabold text-zinc-900 dark:text-zinc-100 border-b-2 border-blue-600 pb-1">
              {t.crypto}
            </button>
            <button className="text-[14px] font-bold text-zinc-400 opacity-50 pb-1">NFTs</button>
          </div>
          <div className="flex items-center space-x-1.5">
            <button onClick={() => onAction('history')} className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors">
              <History size={17} />
            </button>
            <button 
              onClick={toggleSort} 
              className={`p-1.5 rounded-lg transition-colors ${sortOrder !== 'default' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-400'}`}
            >
              <SlidersHorizontal size={17} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-20 space-y-2">
          {assets.map((asset) => (
            <div 
              key={asset.id} 
              className="flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-dark-surface/50 rounded-[24px] border border-transparent dark:border-dark-border/40 active:bg-zinc-100 dark:active:bg-dark-elevated transition-all cursor-pointer"
              onClick={() => onAction('asset-detail', asset.id)}
            >
              <div className="flex items-center space-x-4">
                <div className="relative shrink-0">
                  <div className="w-[44px] h-[44px] rounded-[14px] bg-white dark:bg-dark-bg flex items-center justify-center p-1.5 shadow-sm border border-zinc-100 dark:border-dark-border/50 group-hover:scale-105 transition-transform">
                    <img src={asset.logoUrl} alt="" className="w-full h-full object-contain" />
                  </div>
                  {asset.networkIcon && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-dark-bg p-0.5 shadow-sm border border-zinc-50 dark:border-dark-bg flex items-center justify-center">
                      <img src={asset.networkIcon} alt="" className="w-full h-full object-contain rounded-full" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[15px] leading-tight text-zinc-900 dark:text-zinc-100">{asset.symbol}</h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-[11px] font-medium text-zinc-400 tracking-tight">{formatPrice(asset.priceUsd)}</span>
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
                <p className="text-[12px] text-zinc-400 font-medium opacity-60">
                  {formatPrice(asset.balance * asset.priceUsd)}
                </p>
              </div>
            </div>
          ))}
          
          <button className="w-full py-4 bg-zinc-100/30 dark:bg-dark-surface/30 rounded-[24px] flex items-center justify-center space-x-2 text-zinc-400 font-bold text-[11px] hover:bg-zinc-100 transition-colors uppercase tracking-widest mt-2 border border-dashed border-zinc-200 dark:border-dark-border">
            <Plus size={13} />
            <span>{t.manage}</span>
          </button>
        </div>
      </div>

      {/* Copy Modal Overlay */}
      {showCopyMenu && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-fade-in p-0 m-0">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCopyMenu(false)}></div>
          <div className="w-full max-w-[430px] bg-white dark:bg-zinc-950 rounded-t-[40px] p-6 pb-10 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
            <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6"></div>
            <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-xl font-extrabold tracking-tight">Copy Address</h3>
                <button onClick={() => setShowCopyMenu(false)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 btn-press">
                    <X size={16} strokeWidth={2.5} />
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
                  className="w-full flex items-center justify-between p-4.5 rounded-[24px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 btn-press"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-surface p-1.5 shadow-sm">
                      <img src={item.logo} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="text-left">
                      <span className="font-extrabold text-[15px] block leading-none mb-1">{item.label}</span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{item.network}</span>
                    </div>
                  </div>
                  {copiedNetwork === item.type ? (
                    <div className="flex items-center space-x-1.5 text-green-500 font-bold text-[11px] uppercase animate-pop-in">
                        <Check size={16} strokeWidth={3} />
                        <span>Copied</span>
                    </div>
                  ) : (
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-300">
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
