
import React, { useState, useEffect } from 'react';
import { Asset, Transaction, Language, View } from '../types';
import { ChevronLeft, ArrowUpRight, Plus, Repeat, Info, X, ExternalLink, Check, ArrowDownLeft } from 'lucide-react';
import { TransactionItem } from './HistoryView';

interface Props {
  asset: Asset | undefined;
  transactions: Transaction[];
  onBack: () => void;
  onAction: (view: View) => void;
  formatPrice: (usd: number) => string;
  t: any;
  language: Language;
  allAssets?: Asset[];
}

const formatVal = (val: number) => {
  return val.toLocaleString('ru-RU', { maximumFractionDigits: 6 });
};

const AssetDetailView: React.FC<Props> = ({ asset, transactions = [], onBack, onAction, formatPrice, t, language, allAssets = [] }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!asset) onBack();
  }, [asset, onBack]);

  if (!asset) return <div className="h-full bg-white dark:bg-dark-bg" />;

  const price = asset?.priceUsd || 0;
  const priceChange = asset?.change24h || 0;

  const getSymbol = (id: string) => allAssets.find(a => a.id === id)?.symbol || '';

  return (
    <div className="h-full bg-white dark:bg-black text-black dark:text-white flex flex-col animate-ios-slide-in relative transition-colors duration-300">
      {/* Header */}
      <div className="px-5 pt-safe pb-4 flex items-center justify-between shrink-0 mt-2">
        <button onClick={onBack} className="p-2.5 bg-zinc-50 dark:bg-dark-surface rounded-full flex items-center justify-center btn-press">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h2 className="text-[18px] font-bold">{asset?.name}</h2>
        <button className="p-2.5 bg-zinc-50 dark:bg-dark-surface rounded-full">
          <Info size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center py-10 px-6">
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center bg-zinc-50 dark:bg-dark-surface p-0 mb-6">
            <img src={asset?.logoUrl} alt="" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="text-[36px] font-extrabold tracking-tight mb-2 text-center leading-none">
            {formatVal(asset.balance)} {asset?.symbol}
          </h1>
          <p className="text-[#8E8E93] dark:text-zinc-500 font-bold text-lg">≈ {formatPrice(asset.balance * price)}</p>
          <div className={`mt-4 px-3.5 py-1 rounded-full text-[13px] font-extrabold ${priceChange >= 0 ? 'bg-[#34C759]/10 text-[#34C759]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
        </div>

        <div className="flex justify-center space-x-8 px-6 mb-12">
          {[
            { id: 'send', label: t.send, icon: <ArrowUpRight size={28} />, bg: 'bg-[#0500FF] text-white' },
            { id: 'receive', label: t.receive, icon: <Plus size={28} />, bg: 'bg-zinc-50 dark:bg-dark-surface text-black dark:text-white' },
            { id: 'swap', label: t.swap, icon: <Repeat size={28} />, bg: 'bg-zinc-50 dark:bg-dark-surface text-black dark:text-white' }
          ].map((action) => (
            <div key={action.id} className="flex flex-col items-center space-y-2">
              <button onClick={() => onAction(action.id as View)} className={`w-[64px] h-[64px] ${action.bg} rounded-full flex items-center justify-center btn-press shadow-sm`}>
                {action.icon}
              </button>
              <span className="text-[13px] font-bold text-[#8E8E93] dark:text-zinc-500 lowercase tracking-tight">{action.label}</span>
            </div>
          ))}
        </div>

        <div className="px-5 pb-20">
          <h3 className="text-[#8E8E93] dark:text-zinc-500 text-[12px] font-bold uppercase tracking-widest mb-4">
            {t.history}
          </h3>
          <div className="space-y-1">
            {transactions.length > 0 ? (
              transactions.map(tx => (
                <TransactionItem 
                  key={tx.id} 
                  tx={tx} 
                  assets={allAssets} 
                  language={language} 
                  formatPrice={formatPrice} 
                  onClick={setSelectedTx} 
                />
              ))
            ) : (
              <div className="py-12 text-center opacity-40">
                <p className="font-bold text-sm">Нет транзакций</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/75" onClick={() => setSelectedTx(null)}></div>
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[32px] p-8 pb-12 relative animate-ios-bottom-up shadow-2xl">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8"></div>
            <button onClick={() => setSelectedTx(null)} className="absolute right-6 top-8 text-zinc-400"><X size={24}/></button>
            <div className="text-center pt-4 mb-8">
               <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg ${
                 selectedTx.type === 'swap' ? 'bg-blue-600/10 text-blue-600' : 
                 selectedTx.type === 'send' ? 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500' : 
                 'bg-green-500/10 text-[#34C759]'
               }`}>
                  {selectedTx.type === 'swap' ? <Repeat size={36}/> : selectedTx.type === 'send' ? <ArrowUpRight size={36}/> : <ArrowDownLeft size={36}/>}
               </div>
               <h3 className="text-2xl font-bold tracking-tight">
                {selectedTx.type === 'swap' ? (
                   <span>{formatVal(selectedTx.amount)} {getSymbol(selectedTx.assetId)} → {formatVal(selectedTx.toAmount || 0)} {getSymbol(selectedTx.toAssetId!)}</span>
                ) : (
                  <>{selectedTx.type === 'receive' ? '+' : '-'}{formatVal(selectedTx.amount)} {asset.symbol}</>
                )}
               </h3>
               <div className="flex items-center justify-center space-x-2 mt-4 text-[#34C759] font-bold uppercase tracking-widest text-[12px]">
                  <Check size={14} strokeWidth={4}/> <span>{t.done}</span>
               </div>
            </div>
            
            <div className="bg-zinc-50 dark:bg-dark-surface rounded-[24px] p-6 space-y-5">
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-[#8E8E93] uppercase text-[11px] tracking-widest">{t.date}</span>
                  <span>{new Date(selectedTx.timestamp).toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-start pt-5 border-t border-zinc-100 dark:border-dark-border text-sm font-bold">
                 <span className="text-[#8E8E93] uppercase text-[11px] tracking-widest mt-1">{t.txHash}</span>
                 <span className="text-[#0500FF] font-mono text-[11px] break-all text-right pl-12">{selectedTx.hash || '0x' + Math.random().toString(16).slice(2, 22)}</span>
               </div>
               <div className="flex justify-between items-center pt-5 border-t border-zinc-100 dark:border-dark-border text-sm font-bold">
                  <span className="text-[#8E8E93] uppercase text-[11px] tracking-widest">{t.networkFee}</span>
                  <span>{selectedTx.networkFee || formatPrice(0.85)}</span>
               </div>
            </div>
            
            <button className="w-full py-4.5 bg-[#0500FF] text-white rounded-2xl mt-8 font-bold uppercase tracking-widest text-[15px] btn-press shadow-xl shadow-blue-600/20 transition-all">Explorer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetailView;
