
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
            <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-dark-surface flex items-center justify-center shadow-lg border border-zinc-100 dark:border-dark-border">
              <img 
                src={asset?.logoUrl} 
                alt="" 
                className="w-12 h-12 object-contain rounded-[22%]"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 px-3 py-1 rounded-full bg-zinc-100 dark:bg-dark-elevated border-2 border-white dark:border-dark-bg text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 shadow-sm">
              {asset?.network}
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-center">
            {balance.toLocaleString('ru-RU', {maximumFractionDigits: 4})} {asset?.symbol}
          </h1>
          <p className="text-zinc-500 font-bold text-lg">
            ≈ {formatPrice(balance * price)}
          </p>
          <div className={`mt-3 px-3 py-1 rounded-full text-[11px] font-bold ${priceChange >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}% (24h)
          </div>
        </div>

        <div className="flex justify-center space-x-6 px-6 mb-12">
          <div className="flex flex-col items-center space-y-2">
            <button onClick={() => onAction('send')} className="w-[64px] h-[64px] bg-blue-600 text-white rounded-[24px] flex items-center justify-center btn-press shadow-xl shadow-blue-600/20">
              <ArrowUpRight size={28} strokeWidth={2.5} />
            </button>
            <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-300 uppercase tracking-tighter">{t.send}</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <button onClick={() => onAction('receive')} className="w-[64px] h-[64px] bg-zinc-100 dark:bg-dark-surface rounded-[24px] flex items-center justify-center btn-press">
              <Plus size={28} strokeWidth={2.5} />
            </button>
            <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-300 uppercase tracking-tighter">{t.receive}</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <button onClick={() => onAction('swap')} className="w-[64px] h-[64px] bg-zinc-100 dark:bg-dark-surface rounded-[24px] flex items-center justify-center btn-press">
              <Repeat size={28} strokeWidth={2.5} />
            </button>
            <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-300 uppercase tracking-tighter">{t.swap}</span>
          </div>
        </div>

        <div className="px-6 pb-20">
          <h3 className="text-zinc-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-4 opacity-50">
            {t.history}
          </h3>
          {(!transactions || transactions.length === 0) ? (
            <div className="py-12 text-center text-zinc-500 opacity-40 italic font-bold">
              {language === 'ru' ? 'Транзакций нет' : 'No transactions'}
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(tx => (
                <div 
                  key={tx.id} 
                  onClick={() => setSelectedTx(tx)}
                  className="flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-dark-surface/50 rounded-3xl border border-transparent active:bg-zinc-100 dark:active:bg-dark-surface transition-all cursor-pointer btn-press"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-dark-elevated flex items-center justify-center shadow-sm">
                      {tx.type === 'receive' ? <ArrowDownLeft size={20} className="text-green-500" strokeWidth={2.5} /> : tx.type === 'swap' ? <Repeat size={20} className="text-blue-500" strokeWidth={2.5} /> : <ArrowUpRight size={20} className="text-zinc-400" strokeWidth={2.5} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <p className="font-bold text-[15px]">{tx.type === 'receive' ? t.receive : tx.type === 'swap' ? t.swap : t.send}</p>
                        <div className="flex items-center justify-center w-3.5 h-3.5 bg-green-500 rounded-full shrink-0">
                          <Check size={9} strokeWidth={4} className="text-white" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[11px] text-zinc-500 font-bold opacity-60 uppercase leading-tight">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </p>
                        {tx.address && (tx.type === 'send' || tx.type === 'receive') && (
                          <p className="text-[10px] text-zinc-400 font-bold truncate max-w-[120px] mt-0.5">
                            {tx.type === 'send' ? (language === 'ru' ? 'Кому: ' : 'To: ') : (language === 'ru' ? 'От: ' : 'From: ')}
                            {tx.address.slice(0, 6)}...{tx.address.slice(-4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {tx.type === 'swap' ? (
                      <div className="flex flex-col items-end">
                        <p className="font-bold text-[13px] tracking-tight">
                          {formatVal(tx.amount)} {getSymbolById(tx.assetId)} → {formatVal(tx.toAmount || 0)} {getSymbolById(tx.toAssetId || '')}
                        </p>
                        <p className="text-[11px] text-zinc-400 font-bold">{formatPrice(tx.amount * (tx.assetId === 'usdt-tron' ? 1 : (allAssets.find(a => a.id === tx.assetId)?.priceUsd || 0)))}</p>
                      </div>
                    ) : (
                      <>
                        <p className={`font-bold text-[16px] tracking-tight ${tx.type === 'receive' ? 'text-green-600' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {tx.type === 'receive' ? '+' : '-'}{formatVal(tx.amount)} {asset.symbol}
                        </p>
                        <p className="text-[12px] text-zinc-400 font-bold">{formatPrice(tx.amount * price)}</p>
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
              className="absolute right-6 top-8 w-10 h-10 bg-zinc-100 dark:bg-dark-bg rounded-full flex items-center justify-center text-zinc-500 btn-press"
            >
              <X size={18} strokeWidth={3} />
            </button>
            <div className="text-center mb-10 pt-4">
              <h3 className="text-2xl font-extrabold tracking-tight">
                {selectedTx.type === 'swap' ? (
                   <span className="text-[20px]">{formatVal(selectedTx.amount)} {getSymbolById(selectedTx.assetId)} → {formatVal(selectedTx.toAmount || 0)} {getSymbolById(selectedTx.toAssetId || '')}</span>
                ) : (
                  <>{selectedTx.type === 'receive' ? '+' : '-'}{selectedTx.amount.toLocaleString('ru-RU', {maximumFractionDigits: 4})} {asset?.symbol}</>
                )}
              </h3>
              <div className="flex items-center justify-center space-x-1.5 mt-3">
                <ShieldCheck size={14} className="text-green-500" />
                <span className="text-green-500 text-[11px] font-bold uppercase tracking-[0.2em]">{t.done}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-dark-bg rounded-[32px] p-6 space-y-4 border border-zinc-100 dark:border-dark-border">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{t.date}</span>
                  <span className="font-bold text-[13px]">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                </div>
                {selectedTx.address && (
                  <div className="flex justify-between items-start pt-4 border-t border-zinc-200/50 dark:border-dark-border">
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                      {selectedTx.type === 'send' ? (language === 'ru' ? 'КОМУ' : 'TO') : (language === 'ru' ? 'ОТ' : 'FROM')}
                    </span>
                    <span className="text-zinc-900 dark:text-zinc-100 font-mono text-[11px] break-all text-right pl-12 font-bold">
                      {selectedTx.address}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-zinc-200/50 dark:border-dark-border">
                  <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{t.networkFee}</span>
                  <span className="font-bold text-[13px]">{selectedTx.networkFee || formatPrice(0.85)}</span>
                </div>
              </div>
              <button className="w-full py-5 bg-zinc-100 dark:bg-dark-bg text-blue-600 dark:text-blue-500 rounded-[24px] flex items-center justify-center space-x-2.5 font-bold text-[13px] uppercase tracking-widest btn-press">
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
