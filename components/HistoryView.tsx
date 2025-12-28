
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
    <div className="h-full bg-white dark:bg-black text-black dark:text-white flex flex-col animate-ios-slide-in relative transition-colors duration-300">
      <div className="px-4 pt-4 pb-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="p-3 text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 rounded-full btn-press">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="text-[17px] font-semibold leading-tight">{t.history}</h2>
          <p className="text-[10px] text-zinc-500 font-normal uppercase tracking-widest mt-0.5">{t.mainWallet}</p>
        </div>
        <button className="p-3 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-full btn-press">
          <Star size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-6">
        {transactions.length === 0 ? (
          <div className="py-24 text-center">
             <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                <History className="text-zinc-400" size={32} />
             </div>
             <p className="text-zinc-500 font-medium opacity-60">
               {language === 'ru' ? 'Транзакций пока нет' : 'No transactions yet'}
             </p>
          </div>
        ) : (
          Object.keys(groupedTransactions).map((dateLabel) => (
            <div key={dateLabel} className="mb-8">
              <h3 className="py-3 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                {dateLabel}
              </h3>
              <div className="space-y-2">
                {groupedTransactions[dateLabel].map((tx: Transaction) => {
                  const isSend = tx.type === 'send';
                  const isReceive = tx.type === 'receive';
                  const isSwap = tx.type === 'swap';
                  const fromSymbol = getSymbolById(tx.assetId);
                  const toSymbol = isSwap ? getSymbolById(tx.toAssetId || '') : '';
                  
                  return (
                    <div 
                      key={tx.id} 
                      className="flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-[24px] border border-transparent active:border-zinc-200 dark:active:border-white/10 active:bg-white dark:active:bg-zinc-900 transition-all cursor-pointer btn-press"
                      onClick={() => setSelectedTx(tx)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center shadow-sm border ${isSwap ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-white/5 text-zinc-500'}`}>
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
                            <h4 className="font-semibold text-[15px]">
                              {isSwap ? (language === 'ru' ? 'Обмен' : 'Swap') : isSend ? (language === 'ru' ? 'Отправлено' : 'Sent') : (language === 'ru' ? 'Получено' : 'Received')}
                            </h4>
                            <div className="flex items-center justify-center w-3.5 h-3.5 bg-green-500 rounded-full shrink-0">
                              <Check size={9} strokeWidth={4} className="text-white" />
                            </div>
                          </div>
                          <p className="text-[12px] text-zinc-500 font-normal truncate max-w-[140px]">
                            {isSwap 
                              ? `${fromSymbol} → ${toSymbol}`
                              : (tx.address ? (isSend ? (language === 'ru' ? `Кому: ${tx.address.slice(0, 6)}...${tx.address.slice(-4)}` : `To: ${tx.address.slice(0, 6)}...${tx.address.slice(-4)}`) : (language === 'ru' ? `От: ${tx.address.slice(0, 6)}...${tx.address.slice(-4)}` : `From: ${tx.address.slice(0, 6)}...${tx.address.slice(-4)}`)) : 'TDii6va...8xcqYx')
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {isSwap ? (
                           <div className="flex flex-col items-end">
                              <p className="font-bold text-[13px] tracking-tight text-zinc-900 dark:text-zinc-100">
                                {formatValue(tx.amount)} {fromSymbol} → {formatValue(tx.toAmount || 0)} {toSymbol}
                              </p>
                              <p className="text-[11px] text-zinc-400 font-normal">
                                ≈ {formatPrice(tx.amount * getPriceById(tx.assetId))}
                              </p>
                           </div>
                        ) : (
                          <>
                            <p className={`font-semibold text-[16px] tracking-tight ${isReceive ? 'text-green-600 dark:text-green-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                              {isReceive ? '+' : '-'}{formatValue(tx.amount)} {fromSymbol}
                            </p>
                            <p className="text-[12px] text-zinc-400 font-normal">
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
              className="absolute right-6 top-8 w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 btn-press"
            >
              <X size={18} />
            </button>
            
            <div className="text-center mb-10 pt-4">
              <div className={`w-16 h-16 rounded-[24px] mx-auto mb-6 flex items-center justify-center shadow-lg ${
                selectedTx.type === 'swap' ? 'bg-blue-600/10 text-blue-600' : 
                selectedTx.type === 'send' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500' : 
                'bg-green-500/10 text-green-500'
              }`}>
                {selectedTx.type === 'swap' ? <Repeat size={32} strokeWidth={2.5} /> :
                 selectedTx.type === 'send' ? <ArrowUpRight size={32} strokeWidth={2.5} /> : 
                 <ArrowDownLeft size={32} strokeWidth={2.5} />}
              </div>
              <h3 className="text-2xl font-bold tracking-tight">
                {selectedTx.type === 'swap' ? (
                   <span className="text-[18px]">{formatValue(selectedTx.amount)} {getSymbolById(selectedTx.assetId)} → {formatValue(selectedTx.toAmount || 0)} {getSymbolById(selectedTx.toAssetId!)}</span>
                ) : (
                  <>{selectedTx.type === 'receive' ? '+' : '-'}{formatValue(selectedTx.amount)} {getSymbolById(selectedTx.assetId)}</>
                )}
              </h3>
              <div className="flex items-center justify-center space-x-1.5 mt-3">
                <ShieldCheck size={14} className="text-green-500" />
                <span className="text-green-500 text-[11px] font-semibold uppercase tracking-[0.2em]">{t.done}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] p-6 space-y-4 border border-zinc-100 dark:border-white/5 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-widest">{t.date}</span>
                  <span className="font-semibold text-[13px]">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                </div>
                {selectedTx.address && (
                  <div className="flex justify-between items-start pt-4 border-t border-zinc-200/50 dark:border-white/5">
                    <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-widest mt-1">
                      {selectedTx.type === 'send' ? (language === 'ru' ? 'КОМУ' : 'TO') : (language === 'ru' ? 'ОТ' : 'FROM')}
                    </span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-mono text-[11px] break-all text-right pl-12 font-semibold">
                      {selectedTx.address}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-start pt-4 border-t border-zinc-200/50 dark:border-white/5">
                  <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-widest mt-1">{t.txHash}</span>
                  <span className="text-blue-500 font-mono text-[10px] break-all text-right pl-12 leading-relaxed font-semibold">{selectedTx.hash}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-200/50 dark:border-white/5">
                  <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-widest">{t.networkFee}</span>
                  <span className="font-semibold text-[13px]">{selectedTx.networkFee || formatPrice(1.24)}</span>
                </div>
              </div>
              
              <button className="w-full py-5 bg-zinc-100 dark:bg-zinc-900 text-blue-600 dark:text-blue-500 rounded-[24px] flex items-center justify-center space-x-2.5 font-semibold text-[13px] uppercase tracking-widest btn-press">
                <ExternalLink size={16} />
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
