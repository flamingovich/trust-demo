
import React, { useState } from 'react';
import { Transaction, Asset, Language } from '../types';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, X, ExternalLink, Repeat, History, Check, Star } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  assets: Asset[];
  onBack: () => void;
  t: any;
  language: Language;
  formatPrice: (usd: number) => string;
}

const formatValue = (val: number, maxDecimals: number = 4) => {
  return val.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
};

// Экспортируемый компонент элемента списка для повторного использования
export const TransactionItem: React.FC<{
  tx: Transaction;
  assets: Asset[];
  language: Language;
  formatPrice: (usd: number) => string;
  onClick: (tx: Transaction) => void;
}> = ({ tx, assets, language, formatPrice, onClick }) => {
  const getSymbolById = (id: string) => {
    const found = assets.find(a => a.id === id);
    return found ? found.symbol : id.split('-')[0].toUpperCase();
  };

  const isSend = tx.type === 'send';
  const isReceive = tx.type === 'receive';
  const isSwap = tx.type === 'swap';
  
  const fromSymbol = getSymbolById(tx.assetId);
  const toSymbol = isSwap ? getSymbolById(tx.toAssetId || '') : '';

  let subtitle = '';
  if (isSwap) {
    subtitle = `${fromSymbol} → ${toSymbol}`;
  } else if (tx.address) {
    subtitle = `${tx.address.slice(0, 8)}...${tx.address.slice(-4)}`;
  } else {
    subtitle = language === 'ru' ? 'Завершено' : 'Confirmed';
  }

  return (
    <div 
      className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900/40 rounded-[24px] border border-zinc-100 dark:border-white/5 active:bg-zinc-50 dark:active:bg-zinc-800/60 transition-all cursor-pointer btn-press"
      onClick={() => onClick(tx)}
    >
      <div className="flex items-center space-x-4 min-w-0">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm border transition-transform group-hover:scale-105 ${isSwap ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-white/5 text-zinc-500'}`}>
          {isSwap ? <Repeat size={20} strokeWidth={2.5} /> : isSend ? <ArrowUpRight size={22} strokeWidth={2.5} /> : <ArrowDownLeft size={22} strokeWidth={2.5} />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5">
            <h4 className="font-bold text-[15px] text-[#1A1C1E] dark:text-white leading-none">
              {isSwap ? (language === 'ru' ? 'Обмен' : 'Swap') : isSend ? (language === 'ru' ? 'Отправлено' : 'Sent') : (language === 'ru' ? 'Получено' : 'Received')}
            </h4>
            <div className="w-3.5 h-3.5 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check size={10} strokeWidth={4} className="text-green-500" />
            </div>
          </div>
          <p className="text-[12px] text-zinc-400 font-bold truncate max-w-[140px] tracking-tight mt-1">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-extrabold text-[16px] tracking-tight ${isReceive ? 'text-green-500' : 'text-[#1A1C1E] dark:text-white'}`}>
          {isReceive ? '+' : '-'}{formatValue(tx.amount)} {fromSymbol}
        </p>
        <p className="text-[12px] text-zinc-400 font-bold mt-0.5 opacity-60">
          {formatPrice(tx.amount * (assets.find(a => a.id === tx.assetId)?.priceUsd || 0))}
        </p>
      </div>
    </div>
  );
};

const HistoryView: React.FC<Props> = ({ transactions, assets, onBack, t, language, formatPrice }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const formatDateLabel = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return language === 'ru' ? 'Сегодня' : 'Today';
    return d.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' });
  };

  const groupedTransactions = transactions.reduce((groups: any, tx) => {
    const dateLabel = formatDateLabel(tx.timestamp);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(tx);
    return groups;
  }, {});

  const getSymbol = (id: string) => assets.find(a => a.id === id)?.symbol || '';

  return (
    <div className="h-full bg-white dark:bg-black text-[#1A1C1E] dark:text-white flex flex-col animate-ios-slide-in relative transition-colors duration-300 md:items-center">
      <div className="w-full max-w-2xl px-5 md:px-8 pt-6 pb-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="p-2.5 text-[#1A1C1E] dark:text-white bg-zinc-100 dark:bg-zinc-900 rounded-full btn-press">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <div className="text-center">
          <h2 className="text-[17px] font-bold leading-tight">{t.history}</h2>
          <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5 opacity-50">{t.mainWallet}</p>
        </div>
        <button className="p-2.5 text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-full">
          <Star size={20} />
        </button>
      </div>

      <div className="flex-1 w-full max-w-2xl overflow-y-auto no-scrollbar pb-20 px-5">
        {transactions.length === 0 ? (
          <div className="py-24 text-center opacity-40">
             <History className="mx-auto mb-4" size={48} />
             <p className="font-bold">{language === 'ru' ? 'История пуста' : 'History is empty'}</p>
          </div>
        ) : (
          Object.keys(groupedTransactions).map((dateLabel) => (
            <div key={dateLabel} className="mb-8">
              <h3 className="py-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                {dateLabel}
              </h3>
              <div className="space-y-2">
                {groupedTransactions[dateLabel].map((tx: Transaction) => (
                  <TransactionItem 
                    key={tx.id} 
                    tx={tx} 
                    assets={assets} 
                    language={language} 
                    formatPrice={formatPrice} 
                    onClick={setSelectedTx} 
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTx && (
        <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center animate-fade-in p-0 md:p-6">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" onClick={() => setSelectedTx(null)}></div>
          <div className="w-full max-w-[440px] bg-white dark:bg-zinc-950 rounded-t-[40px] md:rounded-[40px] p-8 pb-10 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
            <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8 md:hidden"></div>
            <button 
              onClick={() => setSelectedTx(null)}
              className="absolute right-6 top-8 w-10 h-10 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400"
            >
              <X size={18} strokeWidth={3} />
            </button>
            
            <div className="text-center mb-8 pt-4">
              <div className={`w-20 h-20 rounded-[28px] mx-auto mb-6 flex items-center justify-center shadow-lg ${
                selectedTx.type === 'swap' ? 'bg-blue-600/10 text-blue-600' : 
                selectedTx.type === 'send' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500' : 
                'bg-green-500/10 text-green-500'
              }`}>
                {selectedTx.type === 'swap' ? <Repeat size={36} strokeWidth={2.5} /> :
                 selectedTx.type === 'send' ? <ArrowUpRight size={36} strokeWidth={2.5} /> : 
                 <ArrowDownLeft size={36} strokeWidth={2.5} />}
              </div>
              <h3 className="text-2xl font-bold text-[#1A1C1E] dark:text-white leading-tight">
                {selectedTx.type === 'swap' ? (
                   <span>{formatValue(selectedTx.amount)} {getSymbol(selectedTx.assetId)} → {formatValue(selectedTx.toAmount || 0)} {getSymbol(selectedTx.toAssetId!)}</span>
                ) : (
                  <>{selectedTx.type === 'receive' ? '+' : '-'}{formatValue(selectedTx.amount)} {getSymbol(selectedTx.assetId)}</>
                )}
              </h3>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Check size={14} strokeWidth={4} className="text-green-500" />
                <span className="text-green-500 text-[11px] font-bold uppercase tracking-widest">{t.done}</span>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] p-6 space-y-5 border border-zinc-100 dark:border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{t.date}</span>
                <span className="font-bold text-[14px] text-[#1A1C1E] dark:text-zinc-200">{new Date(selectedTx.timestamp).toLocaleString()}</span>
              </div>

              {selectedTx.type === 'swap' ? (
                <>
                  <div className="flex justify-between items-center pt-5 border-t border-zinc-200/20">
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{language === 'ru' ? 'Курс обмена' : 'Rate'}</span>
                    <span className="font-bold text-[14px] text-[#1A1C1E] dark:text-zinc-200">1 {getSymbol(selectedTx.assetId)} ≈ {((selectedTx.toAmount || 0) / selectedTx.amount).toFixed(4)} {getSymbol(selectedTx.toAssetId!)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-start pt-5 border-t border-zinc-200/20">
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mt-1">{language === 'ru' ? 'Отправитель' : 'From'}</span>
                    <div className="text-right pl-8">
                       <p className="font-bold text-[14px] text-[#1A1C1E] dark:text-zinc-200">{selectedTx.type === 'send' ? t.mainWallet : (selectedTx.address?.slice(0, 10) + '...')}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start pt-5 border-t border-zinc-200/20">
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mt-1">{language === 'ru' ? 'Получатель' : 'To'}</span>
                    <div className="text-right pl-8">
                       <p className="font-bold text-[14px] text-[#1A1C1E] dark:text-zinc-200">{selectedTx.type === 'receive' ? t.mainWallet : (selectedTx.address?.slice(0, 10) + '...')}</p>
                       <p className="font-mono text-[10px] text-zinc-400 break-all">{selectedTx.address}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between items-start pt-5 border-t border-zinc-200/20">
                <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mt-1">{t.txHash}</span>
                <span className="text-[#3262F1] font-mono text-[10px] break-all text-right pl-12 font-bold">{selectedTx.hash || '0x' + Math.random().toString(16).slice(2, 20)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-5 border-t border-zinc-200/20">
                <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{t.networkFee}</span>
                <span className="font-bold text-[14px] text-[#1A1C1E] dark:text-zinc-200">{selectedTx.networkFee || formatPrice(1.24)}</span>
              </div>
            </div>
            
            <button className="w-full py-5 bg-blue-600 text-white rounded-[24px] mt-6 flex items-center justify-center space-x-3 font-bold text-[14px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-transform">
              <ExternalLink size={18} strokeWidth={2.5} />
              <span>Explorer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
