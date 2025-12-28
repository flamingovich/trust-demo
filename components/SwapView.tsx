
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, Transaction, Language } from '../types';
import { ChevronLeft, ArrowDownUp, Info, ChevronDown, CheckCircle2, X, Search, Loader2 } from 'lucide-react';

interface Props {
  assets: Asset[];
  onBack: () => void;
  onSwap: (tx: Transaction) => void;
  t: any;
  language: Language;
}

const formatValue = (val: number, maxDecimals: number = 4) => {
  return val.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
};

const SwapView: React.FC<Props> = ({ assets, onBack, onSwap, t, language }) => {
  const [fromAsset, setFromAsset] = useState<Asset>(assets[0]);
  const [toAsset, setToAsset] = useState<Asset>(assets[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCalculating, setIsCalculating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Dynamic exchange rate calculation based on current prices
  const exchangeRate = useMemo(() => {
    if (!fromAsset || !toAsset) return 0;
    return fromAsset.priceUsd / toAsset.priceUsd;
  }, [fromAsset.priceUsd, toAsset.priceUsd, fromAsset.id, toAsset.id]);

  const toAmount = useMemo(() => {
    const amount = parseFloat(fromAmount);
    if (isNaN(amount) || !exchangeRate) return '';
    return (amount * exchangeRate).toFixed(4);
  }, [fromAmount, exchangeRate]);

  // Simulate "calculating" feedback when user stops typing
  useEffect(() => {
    if (fromAmount) {
      setIsCalculating(true);
      const timer = setTimeout(() => setIsCalculating(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsCalculating(false);
    }
  }, [fromAmount, fromAsset.id, toAsset.id]);

  const handleSwapClick = () => {
    const amount = parseFloat(fromAmount);
    if (!fromAmount || isNaN(amount) || amount <= 0 || amount > fromAsset.balance) return;
    setShowConfirmation(true);
  };

  const confirmSwap = () => {
    setShowConfirmation(false);
    setIsProcessing(true);
    
    // Simulate DEX processing
    setTimeout(() => {
      const amount = parseFloat(fromAmount);
      const targetAmount = parseFloat(toAmount);
      
      onSwap({
        id: Math.random().toString(36).substr(2, 9),
        assetId: fromAsset.id,
        toAssetId: toAsset.id,
        type: 'swap',
        amount: amount,
        toAmount: targetAmount,
        timestamp: Date.now(),
        status: 'confirmed'
      });
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onBack();
      }, 1800);
    }, 2800);
  };

  const switchAssets = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    if (toAmount) {
        setFromAmount(toAmount);
    }
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectAsset = (asset: Asset) => {
    if (isAssetPickerOpen === 'from') {
      if (asset.id === toAsset.id) setToAsset(fromAsset);
      setFromAsset(asset);
    } else {
      if (asset.id === fromAsset.id) setFromAsset(toAsset);
      setToAsset(asset);
    }
    setIsAssetPickerOpen(null);
    setSearchQuery('');
  };

  if (isSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white p-10 animate-fade-in">
        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-8 animate-scale-in shadow-sm">
          <CheckCircle2 size={60} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">{t.done}!</h2>
        <p className="text-zinc-500 mt-3 font-semibold text-center opacity-80">{t.swap} {language === 'ru' ? 'завершен' : 'completed'}</p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white p-10 animate-fade-in">
        <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">{t.processing}</h2>
        <p className="text-zinc-500 mt-3 text-center text-[15px] font-semibold opacity-70">Securing best route across DEXs...</p>
      </div>
    );
  }

  const isInsufficient = parseFloat(fromAmount) > fromAsset.balance;

  return (
    <div className="h-full bg-white dark:bg-black text-black dark:text-white flex flex-col animate-ios-slide-in relative overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-12 pb-4 shrink-0">
        <button onClick={onBack} className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-900 dark:text-zinc-100 btn-press">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight">{t.swap}</h2>
        <button className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 btn-press">
          <Info size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="px-6 mt-4 space-y-3 relative flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[32px] p-6 transition-all shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-[0.2em]">{language === 'ru' ? 'ВЫ ОТДАЕТЕ' : 'YOU PAY'}</span>
            <button 
                onClick={() => setFromAmount(fromAsset.balance.toString())}
                className="text-blue-600 dark:text-blue-500 text-[11px] font-semibold bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/10 active:scale-95 transition-all"
            >
                {language === 'ru' ? 'МАКС' : 'MAX'}: {formatValue(fromAsset.balance)}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsAssetPickerOpen('from')}
              className="flex items-center space-x-2 bg-white dark:bg-zinc-800 p-2 pr-4 rounded-[20px] border border-zinc-100 dark:border-white/5 shadow-sm active:scale-95 transition-all"
            >
              <img src={fromAsset.logoUrl} className="w-8 h-8 object-contain rounded-full shadow-sm" alt="" />
              <span className="font-semibold text-base">{fromAsset.symbol}</span>
              <ChevronDown size={14} className="text-zinc-400" />
            </button>
            <input 
              type="number"
              inputMode="decimal"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0"
              className="bg-transparent text-right text-3xl font-semibold w-1/2 focus:outline-none placeholder-zinc-200 dark:placeholder-zinc-800 tracking-tight"
            />
          </div>
          <p className="text-right text-[13px] text-zinc-400 font-semibold mt-2 opacity-80">
            ≈ {formatValue(parseFloat(fromAmount || '0') * fromAsset.priceUsd)} $
          </p>
        </div>

        <div className="flex justify-center -my-6 relative z-10">
          <button 
            onClick={switchAssets}
            className="w-12 h-12 bg-white dark:bg-zinc-950 border-4 border-white dark:border-black rounded-[20px] flex items-center justify-center text-blue-600 dark:text-blue-500 shadow-xl active:rotate-180 transition-all duration-500 group"
          >
            <ArrowDownUp size={22} strokeWidth={2.5} className="group-hover:scale-110" />
          </button>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[32px] p-6 transition-all shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-[0.2em]">{language === 'ru' ? 'ВЫ ПОЛУЧАЕТЕ' : 'YOU GET'}</span>
            <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-widest bg-zinc-200/20 dark:bg-zinc-800/50 px-2 py-0.5 rounded-md">Bal: {formatValue(toAsset.balance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsAssetPickerOpen('to')}
              className="flex items-center space-x-2 bg-white dark:bg-zinc-800 p-2 pr-4 rounded-[20px] border border-zinc-100 dark:border-white/5 shadow-sm active:scale-95 transition-all"
            >
              <img src={toAsset.logoUrl} className="w-8 h-8 object-contain rounded-full shadow-sm" alt="" />
              <span className="font-semibold text-base">{toAsset.symbol}</span>
              <ChevronDown size={14} className="text-zinc-400" />
            </button>
            <div className={`text-right text-3xl font-semibold transition-all duration-300 tracking-tight ${isCalculating ? 'text-zinc-300 dark:text-zinc-800 opacity-40 scale-95' : 'text-zinc-500 dark:text-zinc-400'}`}>
              {toAmount || '0'}
            </div>
          </div>
          <div className="flex justify-end items-center mt-2 h-5">
            {isCalculating ? (
               <div className="flex items-center space-x-1.5 animate-pulse">
                 <Loader2 size={12} className="animate-spin text-blue-500" />
                 <span className="text-[11px] font-semibold text-blue-500 uppercase tracking-widest">Calculating</span>
               </div>
            ) : (
              <p className="text-right text-[13px] text-zinc-400 font-semibold opacity-80">
                ≈ {formatValue(parseFloat(toAmount || '0') * toAsset.priceUsd)} $
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 px-5 py-5 bg-zinc-50 dark:bg-zinc-900/40 rounded-[32px] border border-zinc-100 dark:border-white/5 space-y-4 shadow-inner">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 font-semibold uppercase tracking-widest text-[10px]">{language === 'ru' ? 'КУРС ОБМЕНА' : 'RATE'}</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-semibold text-[13px]">
              1 {fromAsset.symbol} ≈ {exchangeRate.toFixed(4)} {toAsset.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-zinc-200/50 dark:border-white/5">
            <span className="text-zinc-400 font-semibold uppercase tracking-widest text-[10px]">{t.networkFee}</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-semibold text-[13px]">1,42 $</span>
          </div>
        </div>

        <button 
          disabled={!fromAmount || isInsufficient || isCalculating}
          onClick={handleSwapClick}
          className={`w-full py-5 rounded-[28px] font-semibold text-lg mt-8 shadow-2xl transition-all ${
            !fromAmount || isInsufficient || isCalculating
            ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-white/5 shadow-none' 
            : 'bg-blue-600 text-white shadow-blue-600/30 btn-press active:scale-95'
          }`}
        >
          {isInsufficient ? t.insufficient : isCalculating ? 'Calculating...' : t.swap}
        </button>
      </div>

      {isAssetPickerOpen && (
        <div className="absolute inset-0 z-[100] flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60 glass-panel" onClick={() => setIsAssetPickerOpen(null)}></div>
          <div className="w-full bg-white dark:bg-zinc-950 rounded-t-[44px] h-[85%] flex flex-col p-6 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6 shrink-0"></div>
            
            <div className="flex items-center justify-between mb-6 shrink-0 px-2">
                <h3 className="text-xl font-semibold tracking-tight">{language === 'ru' ? 'Выберите актив' : 'Select Asset'}</h3>
                <button onClick={() => setIsAssetPickerOpen(null)} className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 btn-press">
                    <X size={20} strokeWidth={2.5} />
                </button>
            </div>

            <div className="relative mb-6 shrink-0 px-2">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                    type="text" 
                    placeholder={language === 'ru' ? 'Поиск...' : 'Search token...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
                />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 px-2 pb-8">
                {filteredAssets.map(asset => (
                    <button 
                        key={asset.id}
                        onClick={() => selectAsset(asset)}
                        className="w-full flex items-center justify-between p-4 rounded-[28px] hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all active:scale-95 group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:shadow-md transition-all p-1.5">
                                <img src={asset.logoUrl} className="w-full h-full object-contain" alt="" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-base leading-none mb-1">{asset.symbol}</p>
                                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{asset.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-[15px]">{formatValue(asset.balance)}</p>
                            <p className="text-[11px] text-zinc-400 font-semibold">{formatValue(asset.balance * asset.priceUsd)} $</p>
                        </div>
                    </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="absolute inset-0 z-[110] flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60 glass-panel" onClick={() => setShowConfirmation(false)}></div>
          <div className="w-full bg-white dark:bg-zinc-950 rounded-t-[44px] p-8 pb-12 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8"></div>
            
            <div className="text-center mb-10 px-4">
              <h3 className="text-2xl font-semibold mb-2 tracking-tight">{t.confirm} {t.swap}</h3>
              <p className="text-[12px] text-zinc-500 font-semibold uppercase tracking-[0.2em] opacity-60">{t.review}</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-100 dark:border-white/5 shadow-inner">
                <div className="text-left">
                  <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-widest mb-1 opacity-70">{t.send}</p>
                  <p className="text-xl font-semibold tracking-tight">{fromAmount} {fromAsset.symbol}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 animate-pulse">
                  <ArrowDownUp size={20} strokeWidth={2.5} />
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-widest mb-1 opacity-70">{t.receive}</p>
                  <p className="text-xl font-semibold text-green-600 tracking-tight">≈ {toAmount} {toAsset.symbol}</p>
                </div>
              </div>

              <div className="px-6 space-y-4">
                <div className="flex justify-between text-[13px]">
                  <span className="text-zinc-400 font-semibold uppercase tracking-widest text-[10px]">{t.networkFee}</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">1,42 $</span>
                </div>
                <div className="flex justify-between text-[13px]">
                   <span className="text-zinc-400 font-semibold uppercase tracking-widest text-[10px]">{language === 'ru' ? 'ПРОСКАЛЬЗЫВАНИЕ' : 'SLIPPAGE'}</span>
                   <span className="font-semibold text-blue-500">0.5% (Auto)</span>
                </div>
              </div>

              <button 
                onClick={confirmSwap}
                className="w-full py-5 bg-blue-600 text-white rounded-[26px] font-semibold text-lg shadow-xl shadow-blue-600/30 btn-press active:scale-95 transition-all"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapView;
