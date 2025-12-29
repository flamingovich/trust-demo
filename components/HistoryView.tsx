
import React, { useState } from 'react';
import { Transaction, Asset, Language } from '../types';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, X, ShieldCheck, ExternalLink, Repeat, History, Check, Star } from 'lucide-react';

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

const HistoryView: React.FC<Props> = ({ transactions, assets, onBack, t, language, formatPrice }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  const getSymbolById = (id: string) => {
    if (id === 'usdt-tron') return 'USDT';
    const found = assets.find(a => a.id === id);
    return found ? found.symbol : id.toUpperCase();
  };

  const getPriceById = (id: string) => {
    if (id === 'usdt-tron') return 1;
    const found = assets.find(a => a.id === id);
    return found ? found.priceUsd : 0;
  };

  const formatDateLabel = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return language === 'ru' ? 'СЕГОДНЯ' : 'TODAY';
    return d.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
  };

  const groupedTransactions = transactions.reduce((groups: any, tx) => {
    const dateLabel = formatDateLabel(tx.timestamp);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(tx);
    return groups;
  }, {});

  return (
    <div className="h-full bg-white dark:bg-black text-black dark:text-white flex flex-col animate-ios-slide-in relative transition-colors duration-300">
      <div className="px-4 pt-4 pb-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="p-3 text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 rounded-full btn-press">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-[17px] font-bold leading-tight">{t.history}</h2>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5 opacity-60">{t.mainWallet}</p>
        </div>
        <button className="p-3 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-full btn-press">
          <Star size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-6">
        {transactions.length === 0 ? (
          <div className="py-24 text-center">
             <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
                <History className="text-zinc-400" size={32} />
             </div>
             <p className="text-zinc-400 font-bold opacity-60">
               {language === 'ru' ? 'Транзакций пока нет' : 'No transactions yet'}
             </p>
          </div>
        ) : (
          Object.keys(groupedTransactions).map((dateLabel) => (
            <div key={dateLabel} className="mb-8">
              <h3 className="py-3 text-[10px] font-bold text-[#A2ABB8] uppercase tracking-[0.2em]">
                {dateLabel}
              </h3>
              <div className="space-y-3">
                {groupedTransactions[dateLabel].map((tx: Transaction) => {
                  const isSend = tx.type === 'send';
                  const isReceive = tx.type === 'receive';
                  const isSwap = tx.type === 'swap';
                  const fromSymbol = getSymbolById(tx.assetId);
                  const toSymbol = isSwap ? getSymbolById(tx.toAssetId || '') : '';
                  
                  return (
                    <div 
                      key={tx.id} 
                      className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900/40 rounded-[28px] border border-zinc-100/50 dark:border-white/5 active:bg-zinc-50 transition-all cursor-pointer btn-press shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                      onClick={() => setSelectedTx(tx)}
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm border ${isSwap ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-white/5 text-zinc-500'}`}>
                          {isSwap ? (
                            <Repeat size={18} strokeWidth={2.5} />
                          ) : isSend ? (
                            <ArrowUpRight size={20} strokeWidth={2.5} />
                          ) : (
                            <ArrowDownLeft size={20} strokeWidth={2.5} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="font-bold text-[15px] text-[#1A1C1E] dark:text-zinc-100">
                              {isSwap ? (language === 'ru' ? 'Обмен' : 'Swap') : isSend ? (language === 'ru' ? 'Отправлено' : 'Sent') : (language === 'ru' ? 'Получено' : 'Received')}
                            </h4>
                            <Check size={12} strokeWidth={4} className="text-green-500" />
                          </div>
                          <p className="text-[12px] text-[#A2ABB8] font-bold truncate max-w-[160px] tracking-tight uppercase">
                            {isSwap 
                              ? `${fromSymbol} → ${toSymbol}`
                              : (language === 'ru' ? 'Завершено' : 'Confirmed')
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {isSwap ? (
                           <div className="flex flex-col items-end">
                              <p className="font-bold text-[14px] tracking-tight text-[#1A1C1E] dark:text-zinc-100">
                                {formatValue(tx.amount)} {fromSymbol}
                              </p>
                              <p className="text-[11px] text-[#A2ABB8] font-bold">
                                → {formatValue(tx.toAmount || 0)} {toSymbol}
                              </p>
                           </div>
                        ) : (
                          <>
                            <p className={`font-bold text-[16px] tracking-tight ${isReceive ? 'text-green-500' : 'text-[#1A1C1E] dark:text-zinc-100'}`}>
                              {isReceive ? '+' : '-'}{formatValue(tx.amount)} {fromSymbol}
                            </p>
                            <p className="text-[12px] text-[#A2ABB8] font-bold">
                              ≈ {formatPrice(tx.amount * getPriceById(tx.assetId))}
                            </p>
                          </>
                        )}
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
        <div className="absolute inset-0 z-[120] flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60 glass-panel" onClick={() => setSelectedTx(null)}></div>
          <div className="w-full bg-white dark:bg-zinc-950 rounded-t-[44px] p-8 pb-12 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8"></div>
            <button 
              onClick={() => setSelectedTx(null)}
              className="absolute right-6 top-8 w-10 h-10 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 btn-press"
            >
              <X size={18} strokeWidth={3} />
            </button>
            
            <div className="text-center mb-10 pt-4">
              <div className={`w-20 h-20 rounded-[28px] mx-auto mb-6 flex items-center justify-center shadow-lg ${
                selectedTx.type === 'swap' ? 'bg-blue-600/10 text-blue-600' : 
                selectedTx.type === 'send' ? 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400' : 
                'bg-green-500/10 text-green-500'
              }`}>
                {selectedTx.type === 'swap' ? <Repeat size={36} strokeWidth={2.5} /> :
                 selectedTx.type === 'send' ? <ArrowUpRight size={36} strokeWidth={2.5} /> : 
                 <ArrowDownLeft size={36} strokeWidth={2.5} />}
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-[#1A1C1E] dark:text-white">
                {selectedTx.type === 'swap' ? (
                   <span className="text-[20px]">{formatValue(selectedTx.amount)} {getSymbolById(selectedTx.assetId)} → {formatValue(selectedTx.toAmount || 0)} {getSymbolById(selectedTx.toAssetId!)}</span>
                ) : (
                  <>{selectedTx.type === 'receive' ? '+' : '-'}{formatValue(selectedTx.amount)} {getSymbolById(selectedTx.assetId)}</>
                )}
              </h3>
              <div className="flex items-center justify-center space-x-1.5 mt-4">
                <Check size={14} strokeWidth={4} className="text-green-500" />
                <span className="text-green-500 text-[11px] font-bold uppercase tracking-[0.2em]">{t.done}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F8FAFC] dark:bg-zinc-900/50 rounded-[36px] p-7 space-y-6 border border-zinc-100 dark:border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[#A2ABB8] font-bold uppercase text-[10px] tracking-widest">{t.date}</span>
                  <span className="font-bold text-[14px] text-[#1A1C1E] dark:text-white">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                </div>
                {selectedTx.address && (
                  <div className="flex justify-between items-start pt-6 border-t border-zinc-200/30 dark:border-white/5">
                    <span className="text-[#A2ABB8] font-bold uppercase text-[10px] tracking-widest mt-1">
                      {selectedTx.type === 'send' ? (language === 'ru' ? 'КОМУ' : 'TO') : (language === 'ru' ? 'ОТ' : 'FROM')}
                    </span>
                    <span className="text-[#1A1C1E] dark:text-zinc-200 font-mono text-[11px] break-all text-right pl-12 font-bold leading-relaxed">
                      {selectedTx.address}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-start pt-6 border-t border-zinc-200/30 dark:border-white/5">
                  <span className="text-[#A2ABB8] font-bold uppercase text-[10px] tracking-widest mt-1">{t.txHash}</span>
                  <span className="text-[#3262F1] font-mono text-[10px] break-all text-right pl-12 leading-relaxed font-bold">{selectedTx.hash}</span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-zinc-200/30 dark:border-white/5">
                  <span className="text-[#A2ABB8] font-bold uppercase text-[10px] tracking-widest">{t.networkFee}</span>
                  <span className="font-bold text-[14px] text-[#1A1C1E] dark:text-white">{selectedTx.networkFee || formatPrice(1.24)}</span>
                </div>
              </div>
              
              <button className="w-full py-5 bg-[#3262F1]/5 dark:bg-[#3262F1]/10 text-[#3262F1] rounded-[24px] flex items-center justify-center space-x-3 font-bold text-[13px] uppercase tracking-widest btn-press">
                <ExternalLink size={16} strokeWidth={2.5} />
                <span>View in Explorer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;
