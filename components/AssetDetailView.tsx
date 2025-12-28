
import React, { useState, useEffect } from 'react';
import { Asset, Transaction, Language, View } from '../types';
import { ChevronLeft, ArrowUpRight, Plus, Repeat, Info, ArrowDownLeft, X, ShieldCheck, ExternalLink, Check } from 'lucide-react';

interface Props {
  asset: Asset;
  transactions: Transaction[];
  onBack: () => void;
  onAction: (view: View) => void;
  t: any;
  language: Language;
}

const formatValueStr = (val: any, decimals: number = 4) => {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

const AssetDetailView: React.FC<Props> = ({ asset, transactions, onBack, onAction, t, language }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!asset) {
    return <div className="h-full bg-white dark:bg-black" />;
  }

  const formatValue = (val: any) => formatValueStr(val, 4);
  const formatUSD = (val: any) => formatValueStr(val, 2);

  const priceChange = asset.change24h || 0;

  return (
    <div className="h-full bg-white dark:bg-black text-black dark:text-white flex flex-col animate-ios-slide-in relative transition-colors duration-300">
      <div className="px-6 pt-4 pb-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center btn-press">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h2 className="text-[17px] font-semibold">{asset.name || 'Token'}</h2>
        <button className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500">
          <Info size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Balance Section */}
        <div className="flex flex-col items-center py-10 px-6">
          <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-900 p-2 mb-6 shadow-sm border border-zinc-100 dark:border-white/5">
            <img src={asset.logoUrl} alt="" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight mb-2 text-center">
            {formatValue(asset.balance)} {asset.symbol}
          </h1>
          <p className="text-zinc-500 font-semibold text-lg">
            ≈ ${formatUSD((asset.balance || 0) * (asset.priceUsd || 0))}
          </p>
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${priceChange >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {priceChange >= 0 ? '+' : ''}{formatUSD(priceChange)}% {language === 'ru' ? 'за 24ч' : '24h'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 px-6 mb-10">
          <div className="flex flex-col items-center space-y-2">
            <button onClick={() => onAction('send')} className="w-[60px] h-[60px] bg-blue-600 text-white rounded-[22px] flex items-center justify-center btn-press shadow-lg shadow-blue-600/20">
              <ArrowUpRight size={26} strokeWidth={2.5} />
            </button>
            <span className="text-[12px] font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-tight">{t.send}</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <button onClick={() => onAction('receive')} className="w-[60px] h-[60px] bg-zinc-100 dark:bg-zinc-900 rounded-[22px] flex items-center justify-center btn-press">
              <Plus size={26} strokeWidth={2.5} />
            </button>
            <span className="text-[12px] font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-tight">{t.receive}</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <button onClick={() => onAction('swap')} className="w-[60px] h-[60px] bg-zinc-100 dark:bg-zinc-900 rounded-[22px] flex items-center justify-center btn-press">
              <Repeat size={26} strokeWidth={2.5} />
            </button>
            <span className="text-[12px] font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-tight">{t.swap}</span>
          </div>
        </div>

        {/* Transaction History */}
        <div className="px-6 pb-20">
          <h3 className="text-zinc-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-4 opacity-60">
            {t.history}
          </h3>
          {(!transactions || transactions.length === 0) ? (
            <div className="py-10 text-center text-zinc-500 opacity-60 italic font-medium">
              {language === 'ru' ? 'Нет транзакций по этой монете' : 'No transactions for this coin'}
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map(tx => (
                <div 
                  key={tx.id} 
                  onClick={() => setSelectedTx(tx)}
                  className="flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-3xl border border-transparent active:border-zinc-100 dark:active:border-white/5 transition-all cursor-pointer btn-press"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                      {tx.type === 'receive' ? <ArrowDownLeft size={20} className="text-green-500" strokeWidth={2.5} /> : tx.type === 'swap' ? <Repeat size={20} className="text-blue-500" strokeWidth={2.5} /> : <ArrowUpRight size={20} className="text-zinc-400" strokeWidth={2.5} />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <p className="font-bold text-[15px]">{tx.type === 'receive' ? t.receive : tx.type === 'swap' ? t.swap : t.send}</p>
                        <div className="flex items-center justify-center w-3.5 h-3.5 bg-green-500 rounded-full shrink-0">
                          <Check size={9} strokeWidth={4} className="text-white" />
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-semibold uppercase opacity-60">{new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-[16px] tracking-tight ${tx.type === 'receive' ? 'text-green-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {tx.type === 'receive' ? '+' : '-'}{formatValue(tx.amount)} {asset.symbol}
                    </p>
                    <p className="text-[12px] text-zinc-400 font-semibold">
                      ${formatUSD((tx.amount || 0) * (asset.priceUsd || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Overlay */}
      {selectedTx && (
        <div className="absolute inset-0 z-[120] flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60 glass-panel" onClick={() => setSelectedTx(null)}></div>
          <div className="w-full bg-white dark:bg-zinc-950 rounded-t-[44px] p-8 pb-12 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8"></div>
            <button 
              onClick={() => setSelectedTx(null)}
              className="absolute right-6 top-8 w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 btn-press"
            >
              <X size={18} strokeWidth={2} />
            </button>
            
            <div className="text-center mb-10 pt-4">
              <div className={`w-16 h-16 rounded-[24px] mx-auto mb-6 flex items-center justify-center shadow-lg ${
                selectedTx.type === 'receive' ? 'bg-green-500/10 text-green-500' : 
                selectedTx.type === 'swap' ? 'bg-blue-600/10 text-blue-600' :
                'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}>
                {selectedTx.type === 'receive' ? <ArrowDownLeft size={32} strokeWidth={2.5} /> : 
                 selectedTx.type === 'swap' ? <Repeat size={32} strokeWidth={2.5} /> :
                 <ArrowUpRight size={32} strokeWidth={2.5} />}
              </div>
              <h3 className="text-3xl font-bold tracking-tight">
                {selectedTx.type === 'receive' ? '+' : '-'}{formatValue(selectedTx.amount)} {asset.symbol}
              </h3>
              <div className="flex items-center justify-center space-x-1.5 mt-3">
                <ShieldCheck size={14} className="text-green-500" />
                <span className="text-green-500 text-[11px] font-bold uppercase tracking-[0.2em]">{t.done}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] p-6 space-y-4 border border-zinc-100 dark:border-white/5 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{t.date}</span>
                  <span className="font-bold text-[13px]">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                </div>
                {selectedTx.address && (
                  <div className="flex justify-between items-start pt-4 border-t border-zinc-200/50 dark:border-white/5">
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mt-1">{t.recipient}</span>
                    <span className="text-zinc-600 dark:text-zinc-300 font-mono text-[10px] break-all text-right pl-12 leading-relaxed font-bold">{selectedTx.address}</span>
                  </div>
                )}
                <div className="flex justify-between items-start pt-4 border-t border-zinc-200/50 dark:border-white/5">
                  <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mt-1">{t.txHash}</span>
                  <span className="text-blue-500 font-mono text-[10px] break-all text-right pl-12 leading-relaxed font-bold">{selectedTx.hash || '0x...'}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-200/50 dark:border-white/5">
                  <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{t.networkFee}</span>
                  <span className="font-bold text-[13px]">{selectedTx.networkFee || '$0,00'}</span>
                </div>
              </div>
              
              <button className="w-full py-5 bg-zinc-100 dark:bg-zinc-900 text-blue-600 dark:text-blue-500 rounded-[24px] flex items-center justify-center space-x-2.5 font-bold text-[13px] uppercase tracking-widest btn-press">
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

export default AssetDetailView;
