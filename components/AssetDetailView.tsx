
import React, { useState, useEffect } from 'react';
import { Asset, Transaction, Language, View } from '../types';
import { ChevronLeft, ArrowUpRight, Plus, Repeat, Info, ArrowDownLeft, X, ShieldCheck, ExternalLink, Check } from 'lucide-react';

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

  const getSymbolById = (id: string) => {
    if (id === 'usdt-tron') return 'USDT';
    const found = allAssets.find(a => a.id === id);
    return found ? found.symbol : id.toUpperCase();
  };

  const balance = asset?.balance || 0;
  const price = asset?.priceUsd || 0;
  const priceChange = asset?.change24h || 0;

  return (
    <div className="h-full bg-white dark:bg-dark-bg text-black dark:text-zinc-100 flex flex-col animate-ios-slide-in relative transition-colors duration-300">
      <div className="px-6 pt-4 pb-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="w-10 h-10 bg-zinc-100 dark:bg-dark-surface rounded-full flex items-center justify-center btn-press">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h2 className="text-[18px] font-bold">{asset?.name}</h2>
        <button className="w-10 h-10 bg-zinc-100 dark:bg-dark-surface rounded-full flex items-center justify-center text-zinc-500">
          <Info size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center py-10 px-6">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-zinc-50 dark:bg-dark-surface flex items-center justify-center shadow-lg border border-zinc-100 dark:border-dark-border">
              <img 
                src={asset?.logoUrl} 
                alt="" 
                className="w-14 h-14 object-contain rounded-[22%]"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 px-4 py-1.5 rounded-full bg-zinc-100 dark:bg-dark-elevated border-2 border-white dark:border-dark-bg text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 shadow-sm">
              {asset?.network}
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-center text-[#1A1C1E] dark:text-white">
            {balance.toLocaleString('ru-RU', {maximumFractionDigits: 4})} {asset?.symbol}
          </h1>
          <p className="text-[#A2ABB8] font-bold text-lg">
            ≈ {formatPrice(balance * price)}
          </p>
          <div className={`mt-4 px-3.5 py-1.5 rounded-full text-[11px] font-bold ${priceChange >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}% (24h)
          </div>
        </div>

        <div className="flex justify-center space-x-6 px-6 mb-12">
          {[
            { id: 'send', label: t.send, icon: <ArrowUpRight size={28} strokeWidth={2.5} />, bg: 'bg-[#3262F1] text-white shadow-xl shadow-[#3262F1]/30' },
            { id: 'receive', label: t.receive, icon: <Plus size={28} strokeWidth={2.5} />, bg: 'bg-zinc-100 dark:bg-dark-surface' },
            { id: 'swap', label: t.swap, icon: <Repeat size={28} strokeWidth={2.5} />, bg: 'bg-zinc-100 dark:bg-dark-surface' }
          ].map((action) => (
            <div key={action.id} className="flex flex-col items-center space-y-2">
              <button onClick={() => onAction(action.id as View)} className={`w-[68px] h-[68px] ${action.bg} rounded-[26px] flex items-center justify-center btn-press transition-all`}>
                {action.icon}
              </button>
              <span className="text-[12px] font-bold text-zinc-900 dark:text-zinc-300 uppercase tracking-tighter">{action.label}</span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-20">
          <h3 className="text-[#A2ABB8] text-[10px] font-bold uppercase tracking-[0.2em] mb-5">
            {t.history}
          </h3>
          {(!transactions || transactions.length === 0) ? (
            <div className="py-12 text-center">
              <p className="text-[#A2ABB8] font-bold opacity-50 italic">
                {language === 'ru' ? 'Транзакций нет' : 'No transactions'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div 
                  key={tx.id} 
                  onClick={() => setSelectedTx(tx)}
                  className="flex items-center justify-between p-4 bg-white dark:bg-dark-surface/50 rounded-[32px] border border-zinc-100/50 dark:border-white/5 active:bg-zinc-50 transition-all cursor-pointer btn-press"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#F8FAFC] dark:bg-dark-elevated flex items-center justify-center shadow-sm">
                      {tx.type === 'receive' ? <ArrowDownLeft size={22} className="text-green-500" strokeWidth={2.5} /> : tx.type === 'swap' ? <Repeat size={22} className="text-[#3262F1]" strokeWidth={2.5} /> : <ArrowUpRight size={22} className="text-zinc-400" strokeWidth={2.5} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <p className="font-bold text-[15px] text-[#1A1C1E] dark:text-white">
                          {tx.type === 'receive' ? t.receive : tx.type === 'swap' ? t.swap : t.send}
                        </p>
                        <Check size={12} strokeWidth={4} className="text-green-500" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[12px] text-[#A2ABB8] font-bold tracking-tight uppercase leading-none mt-0.5">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {tx.type === 'swap' ? (
                      <div className="flex flex-col items-end">
                        <p className="font-bold text-[14px] tracking-tight text-[#1A1C1E] dark:text-white">
                          {formatVal(tx.amount)} {getSymbolById(tx.assetId)}
                        </p>
                        <p className="text-[11px] text-[#A2ABB8] font-bold tracking-tighter">→ {formatVal(tx.toAmount || 0)} {getSymbolById(tx.toAssetId || '')}</p>
                      </div>
                    ) : (
                      <>
                        <p className={`font-bold text-[17px] tracking-tight ${tx.type === 'receive' ? 'text-green-600' : 'text-[#1A1C1E] dark:text-white'}`}>
                          {tx.type === 'receive' ? '+' : '-'}{formatVal(tx.amount)} {asset.symbol}
                        </p>
                        <p className="text-[13px] text-[#A2ABB8] font-bold tracking-tighter">{formatPrice(tx.amount * price)}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTx && (
        <div className="absolute inset-0 z-[120] flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60 glass-panel" onClick={() => setSelectedTx(null)}></div>
          <div className="w-full bg-white dark:bg-dark-surface rounded-t-[44px] p-8 pb-12 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-dark-elevated rounded-full mx-auto mb-8"></div>
            <button 
              onClick={() => setSelectedTx(null)}
              className="absolute right-6 top-8 w-10 h-10 bg-zinc-50 dark:bg-dark-bg rounded-full flex items-center justify-center text-zinc-400 btn-press"
            >
              <X size={18} strokeWidth={3} />
            </button>
            <div className="text-center mb-10 pt-4">
              <h3 className="text-2xl font-bold tracking-tight text-[#1A1C1E] dark:text-white">
                {selectedTx.type === 'swap' ? (
                   <span className="text-[20px]">{formatVal(selectedTx.amount)} {getSymbolById(selectedTx.assetId)} → {formatVal(selectedTx.toAmount || 0)} {getSymbolById(selectedTx.toAssetId || '')}</span>
                ) : (
                  <>{selectedTx.type === 'receive' ? '+' : '-'}{selectedTx.amount.toLocaleString('ru-RU', {maximumFractionDigits: 4})} {asset?.symbol}</>
                )}
              </h3>
              <div className="flex items-center justify-center space-x-1.5 mt-4">
                <Check size={14} strokeWidth={4} className="text-green-500" />
                <span className="text-green-500 text-[11px] font-bold uppercase tracking-[0.2em]">{t.done}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] dark:bg-dark-bg rounded-[36px] p-7 space-y-5 border border-zinc-100 dark:border-dark-border">
                <div className="flex justify-between items-center">
                  <span className="text-[#A2ABB8] font-bold uppercase text-[10px] tracking-widest">{t.date}</span>
                  <span className="font-bold text-[14px] text-[#1A1C1E] dark:text-white">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                </div>
                {selectedTx.address && (
                  <div className="flex justify-between items-start pt-5 border-t border-zinc-200/30 dark:border-dark-border">
                    <span className="text-[#A2ABB8] font-bold uppercase text-[10px] tracking-widest mt-1">
                      {selectedTx.type === 'send' ? (language === 'ru' ? 'КОМУ' : 'TO') : (language === 'ru' ? 'ОТ' : 'FROM')}
                    </span>
                    <span className="text-[#1A1C1E] dark:text-zinc-200 font-mono text-[11px] break-all text-right pl-12 font-bold leading-relaxed">
                      {selectedTx.address}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-5 border-t border-zinc-200/30 dark:border-dark-border">
                  <span className="text-[#A2ABB8] font-bold uppercase text-[10px] tracking-widest">{t.networkFee}</span>
                  <span className="font-bold text-[14px] text-[#1A1C1E] dark:text-white">{selectedTx.networkFee || formatPrice(0.85)}</span>
                </div>
              </div>
              <button className="w-full py-5 bg-[#3262F1]/5 dark:bg-[#3262F1]/10 text-[#3262F1] rounded-[24px] flex items-center justify-center space-x-3 font-bold text-[13px] uppercase tracking-widest btn-press">
                <ExternalLink size={16} strokeWidth={2.5} />
                <span>Explorer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetailView;
