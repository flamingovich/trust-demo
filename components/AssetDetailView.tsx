
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
  return val.toLocaleString('ru-RU', { maximumFractionDigits: 4 });
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
    <div className="h-full bg-white dark:bg-dark-bg text-[#1A1C1E] dark:text-zinc-100 flex flex-col animate-ios-slide-in relative transition-colors duration-300 md:items-center">
      {/* Header */}
      <div className="w-full max-w-2xl px-5 pt-6 pb-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="p-2.5 bg-zinc-100 dark:bg-dark-surface rounded-full flex items-center justify-center btn-press">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <h2 className="text-[17px] font-bold">{asset?.name}</h2>
        <button className="p-2.5 bg-zinc-100 dark:bg-dark-surface rounded-full">
          <Info size={20} />
        </button>
      </div>

      <div className="flex-1 w-full max-w-2xl overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center py-8 px-6">
          <div className="w-20 h-20 rounded-[28px] bg-white dark:bg-dark-surface flex items-center justify-center shadow-lg border border-zinc-100 dark:border-white/5 mb-6">
            <img src={asset?.logoUrl} alt="" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-[34px] font-bold tracking-tight mb-2 text-center text-[#1A1C1E] dark:text-white leading-none">
            {formatVal(asset.balance)} {asset?.symbol}
          </h1>
          <p className="text-zinc-400 font-bold text-lg mt-1">≈ {formatPrice(asset.balance * price)}</p>
          <div className={`mt-4 px-3 py-1 rounded-full text-[11px] font-extrabold ${priceChange >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
        </div>

        <div className="flex justify-center space-x-6 px-6 mb-10">
          {[
            { id: 'send', label: t.send, icon: <ArrowUpRight size={26} />, bg: 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' },
            { id: 'receive', label: t.receive, icon: <Plus size={26} />, bg: 'bg-zinc-100 dark:bg-dark-surface text-zinc-900 dark:text-zinc-200' },
            { id: 'swap', label: t.swap, icon: <Repeat size={26} />, bg: 'bg-zinc-100 dark:bg-dark-surface text-zinc-900 dark:text-zinc-200' }
          ].map((action) => (
            <div key={action.id} className="flex flex-col items-center space-y-2">
              <button onClick={() => onAction(action.id as View)} className={`w-[60px] h-[60px] ${action.bg} rounded-[22px] flex items-center justify-center btn-press shadow-sm`}>
                {action.icon}
              </button>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tighter">{action.label}</span>
            </div>
          ))}
        </div>

        <div className="px-5 pb-20">
          <h3 className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-4 px-1">
            {t.history}
          </h3>
          <div className="space-y-2">
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
              <div className="py-10 text-center opacity-30">
                <p className="font-bold text-sm">Нет транзакций</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTx && (
        <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center animate-fade-in p-0 md:p-6">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" onClick={() => setSelectedTx(null)}></div>
          <div className="w-full max-w-[440px] bg-white dark:bg-zinc-950 rounded-t-[40px] md:rounded-[40px] p-8 pb-10 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
            <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8 md:hidden"></div>
            <button onClick={() => setSelectedTx(null)} className="absolute right-6 top-8 text-zinc-400"><X size={20}/></button>
            <div className="text-center pt-4 mb-8">
               <div className={`w-20 h-20 rounded-[28px] mx-auto mb-6 flex items-center justify-center shadow-lg ${
                 selectedTx.type === 'swap' ? 'bg-blue-600/10 text-blue-600' : 
                 selectedTx.type === 'send' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500' : 
                 'bg-green-500/10 text-green-500'
               }`}>
                  {selectedTx.type === 'swap' ? <Repeat size={36}/> : selectedTx.type === 'send' ? <ArrowUpRight size={36}/> : <ArrowDownLeft size={36}/>}
               </div>
               <h3 className="text-2xl font-bold text-[#1A1C1E] dark:text-white leading-tight">
                {selectedTx.type === 'swap' ? (
                   <span>{formatVal(selectedTx.amount)} {getSymbol(selectedTx.assetId)} → {formatVal(selectedTx.toAmount || 0)} {getSymbol(selectedTx.toAssetId!)}</span>
                ) : (
                  <>{selectedTx.type === 'receive' ? '+' : '-'}{formatVal(selectedTx.amount)} {asset.symbol}</>
                )}
               </h3>
               <div className="flex items-center justify-center space-x-2 mt-4 text-green-500 font-bold uppercase tracking-widest text-[11px]">
                  <Check size={14} strokeWidth={4}/> <span>{t.done}</span>
               </div>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] p-6 border border-zinc-100 dark:border-white/5 space-y-4">
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-zinc-400 uppercase text-[10px] tracking-widest">{t.date}</span>
                  <span className="text-[#1A1C1E] dark:text-white">{new Date(selectedTx.timestamp).toLocaleString()}</span>
               </div>
               
               {selectedTx.type === 'swap' ? (
                 <div className="flex justify-between items-center pt-4 border-t border-zinc-200/20 text-sm font-bold">
                   <span className="text-zinc-400 uppercase text-[10px] tracking-widest">{language === 'ru' ? 'Курс обмена' : 'Rate'}</span>
                   <span className="text-[#1A1C1E] dark:text-white">1 {getSymbol(selectedTx.assetId)} ≈ {((selectedTx.toAmount || 0) / selectedTx.amount).toFixed(4)} {getSymbol(selectedTx.toAssetId!)}</span>
                 </div>
               ) : (
                 <>
                   <div className="flex justify-between items-start pt-4 border-t border-zinc-200/20 text-sm font-bold">
                     <span className="text-zinc-400 uppercase text-[10px] tracking-widest mt-1">{language === 'ru' ? 'Кому' : 'To'}</span>
                     <div className="text-right pl-8">
                       <p className="text-[#1A1C1E] dark:text-white">{selectedTx.type === 'receive' ? t.mainWallet : (selectedTx.address?.slice(0, 10) + '...')}</p>
                       <p className="font-mono text-[9px] text-zinc-400">{selectedTx.address}</p>
                     </div>
                   </div>
                 </>
               )}

               <div className="flex justify-between items-start pt-4 border-t border-zinc-200/20 text-sm font-bold">
                 <span className="text-zinc-400 uppercase text-[10px] tracking-widest mt-1">{t.txHash}</span>
                 <span className="text-[#3262F1] font-mono text-[9px] break-all text-right pl-12">{selectedTx.hash || '0x' + Math.random().toString(16).slice(2, 22)}</span>
               </div>

               <div className="flex justify-between items-center pt-4 border-t border-zinc-200/20 text-sm font-bold">
                  <span className="text-zinc-400 uppercase text-[10px] tracking-widest">{t.networkFee}</span>
                  <span className="text-[#1A1C1E] dark:text-white">{selectedTx.networkFee || formatPrice(0.85)}</span>
               </div>
            </div>
            
            <button className="w-full py-5 bg-blue-600 text-white rounded-[24px] mt-6 font-bold uppercase tracking-widest text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-transform">Explorer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetailView;
