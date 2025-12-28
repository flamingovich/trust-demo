
import React, { useState } from 'react';
import { Transaction, Asset, Language } from '../types';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, CheckCircle2, Star, X, ShieldCheck, Copy, ExternalLink } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  assets: Asset[];
  onBack: () => void;
  t: any;
  language: Language;
}

const HistoryView: React.FC<Props> = ({ transactions, assets, onBack, t, language }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const getAsset = (id: string) => assets.find(a => a.id === id);

  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    }).format(val);
  };

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatDateLabel = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const groupedTransactions = transactions.reduce((groups: any, tx) => {
    const dateLabel = formatDateLabel(tx.timestamp);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(tx);
    return groups;
  }, {});

  return (
    <div className="h-full bg-white dark:bg-black text-black dark:text-white flex flex-col page-enter transition-colors duration-300 relative">
      <div className="px-4 pt-6 pb-2 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="p-2 text-zinc-500 dark:text-zinc-400 btn-press">
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
          <h2 className="text-[17px] font-semibold leading-tight">USDT</h2>
          <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">TRC20 | Tron</p>
        </div>
        <button className="p-2 text-zinc-500 dark:text-zinc-400">
          <Star size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="px-6 py-4 text-center">
          <p className="text-sm text-blue-600 dark:text-blue-500 font-semibold inline-flex items-center">
            {language === 'ru' ? 'Не удается найти транзакцию?' : 'Cannot find transaction?'} <span className="ml-1 underline">{language === 'ru' ? 'Посмотреть обозреватель' : 'View explorer'}</span>
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="px-8 py-20 text-center text-zinc-500 font-medium">
            {language === 'ru' ? 'Нет активных транзакций' : 'No active transactions'}
          </div>
        ) : (
          Object.keys(groupedTransactions).map((dateLabel) => (
            <div key={dateLabel} className="mb-6">
              <h3 className="px-6 py-2 text-[14px] font-semibold text-zinc-800 dark:text-zinc-200">
                {dateLabel}
              </h3>
              <div className="space-y-1">
                {groupedTransactions[dateLabel].map((tx: Transaction) => {
                  const asset = getAsset(tx.assetId);
                  const isSend = tx.type === 'send' || tx.type === 'swap';
                  
                  return (
                    <div 
                      key={tx.id} 
                      className="px-6 py-4 flex items-center justify-between active:bg-zinc-50 dark:active:bg-zinc-900 transition-colors cursor-pointer"
                      onClick={() => setSelectedTx(tx)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative shrink-0 shadow-sm border border-zinc-100 dark:border-zinc-800">
                          {isSend ? (
                            <ArrowUpRight size={22} className="text-zinc-500 dark:text-zinc-400" />
                          ) : (
                            <ArrowDownLeft size={22} className="text-zinc-500 dark:text-zinc-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="font-semibold text-[16px]">{language === 'ru' ? 'Перевод' : 'Transfer'}</h4>
                            <div className="text-green-500 bg-green-500/10 rounded-full p-0.5">
                              <CheckCircle2 size={12} fill="currentColor" className="text-white dark:text-black" />
                            </div>
                          </div>
                          <p className="text-[13px] text-zinc-500 font-medium truncate max-w-[140px]">
                            {isSend ? 'В: ' : 'Из: '}{tx.address ? `${tx.address.slice(0, 7)}...${tx.address.slice(-6)}` : 'TDii6va...8xcqYx'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-[16px] tracking-tight ${!isSend ? 'text-green-600 dark:text-green-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {isSend ? '-' : '+'}{formatAmount(tx.amount)} {asset?.symbol || 'USDT'}
                        </p>
                        <p className="text-[13px] text-zinc-500 font-medium">
                          ≈ ${formatUSD(tx.amount * (asset?.priceUsd || 1))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTx && (
        <div className="absolute inset-0 z-[110] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedTx(null)}></div>
          <div className="w-full bg-white dark:bg-zinc-900 rounded-t-[44px] p-8 pb-12 relative animate-in slide-in-from-bottom duration-400 border-t border-zinc-100 dark:border-white/5 shadow-2xl">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-200 dark:bg-white/10 rounded-full"></div>
            <button 
              onClick={() => setSelectedTx(null)}
              className="absolute right-6 top-7 w-9 h-9 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 btn-press"
            >
              <X size={18} />
            </button>
            
            <div className="text-center mb-10 pt-6">
              <div className={`w-16 h-16 rounded-[22px] mx-auto mb-5 flex items-center justify-center shadow-lg ${
                selectedTx.type === 'send' ? 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300' : 'bg-green-500/10 text-green-500'
              }`}>
                {selectedTx.type === 'send' ? <ArrowUpRight size={32} strokeWidth={2.5} /> : <ArrowDownLeft size={32} strokeWidth={2.5} />}
              </div>
              <h3 className="text-3xl font-semibold tracking-tight">
                {selectedTx.type === 'send' ? '-' : '+'}{formatAmount(selectedTx.amount)} {getAsset(selectedTx.assetId)?.symbol}
              </h3>
              <div className="flex items-center justify-center space-x-1.5 mt-2">
                <ShieldCheck size={14} className="text-green-500" />
                <span className="text-green-500 text-[12px] font-semibold uppercase tracking-widest">{t.done}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-white/[0.02] rounded-[32px] p-6 space-y-4 border border-zinc-100 dark:border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-widest">{t.date}</span>
                  <span className="font-semibold text-xs">{new Date(selectedTx.timestamp).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}</span>
                </div>
                {selectedTx.address && (
                  <div className="flex justify-between items-start pt-3 border-t border-zinc-100 dark:border-white/5">
                    <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-widest mt-1">{selectedTx.type === 'send' ? (language === 'ru' ? 'Куда' : 'To') : (language === 'ru' ? 'Откуда' : 'From')}</span>
                    <div className="flex flex-col items-end flex-1 pl-10">
                      <span className="font-mono text-[11px] break-all text-right leading-tight mb-2 text-zinc-700 dark:text-zinc-300">{selectedTx.address}</span>
                      <button className="text-blue-500 text-[10px] font-semibold uppercase flex items-center space-x-1 active:opacity-50 transition-opacity">
                        <Copy size={12} />
                        <span>{language === 'ru' ? 'Копировать адрес' : 'Copy address'}</span>
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-white/5">
                  <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-widest">{t.networkFee}</span>
                  <span className="font-semibold text-xs">{selectedTx.networkFee}</span>
                </div>
                <div className="flex justify-between items-start pt-3 border-t border-zinc-100 dark:border-white/5">
                  <span className="text-zinc-500 font-semibold uppercase text-[10px] tracking-widest mt-1">{t.txHash}</span>
                  <span className="text-blue-500 font-mono text-[10px] break-all text-right pl-10 leading-relaxed">{selectedTx.hash}</span>
                </div>
              </div>
              
              <button className="w-full py-4.5 bg-zinc-100 dark:bg-white/5 text-blue-600 dark:text-blue-500 rounded-[24px] flex items-center justify-center space-x-2.5 font-semibold text-[12px] uppercase tracking-widest active:scale-95 transition-all">
                <ExternalLink size={16} />
                <span>Explorer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
