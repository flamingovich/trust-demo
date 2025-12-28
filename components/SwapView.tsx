
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, Transaction, Language } from '../types';
import { ChevronLeft, ArrowDownUp, Info, ChevronDown, CheckCircle2, X, Search } from 'lucide-react';

interface Props {
  assets: Asset[];
  onBack: () => void;
  onSwap: (tx: Transaction) => void;
  t: any;
  language: Language;
}

const formatValue = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(val);
};

const SwapView: React.FC<Props> = ({ assets, onBack, onSwap, t, language }) => {
  const [fromAsset, setFromAsset] = useState<Asset>(assets[0]);
  const [toAsset, setToAsset] = useState<Asset>(assets[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate dynamic exchange rate based on USD prices
  const exchangeRate = useMemo(() => {
    if (!fromAsset || !toAsset) return 0;
    return fromAsset.priceUsd / toAsset.priceUsd;
  }, [fromAsset, toAsset]);

  const toAmount = useMemo(() => {
    const amount = parseFloat(fromAmount);
    if (isNaN(amount) || !exchangeRate) return '';
    return (amount * exchangeRate).toFixed(6);
  }, [fromAmount, exchangeRate]);

  const handleSwapClick = () => {
    if (!fromAmount || parseFloat(fromAmount) > fromAsset.balance) return;
    setShowConfirmation(true);
  };

  const confirmSwap = () => {
    setShowConfirmation(false);
    setIsProcessing(true);
    
    // Simulate smart contract execution
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
    }, 2200);
  };

  const switchAssets = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setFromAmount(toAmount);
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
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white p-10 animate-scale-in">
        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-6">
          <CheckCircle2 size={64} strokeWidth={2.5} className="animate-scale-in" />
        </div>
        <h2 className="text-2xl font-bold">{t.done}!</h2>
        <p className="text-zinc-500 mt-2 font-medium">{t.swap} {language === 'ru' ? 'завершен' : 'completed'}</p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white p-10 animate-fade-in">
        <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin mb-8"></div>
        <h2 className="text-xl font-bold">{t.processing}</h2>
        <p className="text-zinc-500 mt-2 text-center text-sm font-medium opacity-70">Executing smart contract...</p>
      </div>
    );
  }

  const isInsufficient = parseFloat(fromAmount) > fromAsset.balance;

  return (
    <div className="h-full bg-white dark:bg-black text-black dark:text-white flex flex-col animate-spring-up relative">
      <div className="flex items-center justify-between px-6 pt-12 pb-4 shrink-0">
        <button onClick={onBack} className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-900 dark:text-zinc-100 btn-press">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-[17px] font-bold">{t.swap}</h2>
        <button className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 btn-press">
          <Info size={20} />
        </button>
      </div>

      <div className="px-6 mt-4 space-y-2 relative flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* From Section */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[32px] p-6 transition-professional">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{language === 'ru' ? 'ПРОДАЕТЕ' : 'YOU PAY'}</span>
            <button 
                onClick={() => setFromAmount(fromAsset.balance.toString())}
                className="text-blue-600 dark:text-blue-500 text-[11px] font-bold uppercase"
            >
                {language === 'ru' ? 'Макс' : 'Max'}: {formatValue(fromAsset.balance)}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsAssetPickerOpen('from')}
              className="flex items-center space-x-2 bg-white dark:bg-zinc-800 p-2 pr-4 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-sm active:scale-95 transition-professional"
            >
              <img src={fromAsset.logoUrl} className="w-8 h-8 object-contain rounded-full" alt="" />
              <span className="font-bold text-base">{fromAsset.symbol}</span>
              <ChevronDown size={14} className="text-zinc-400" />
            </button>
            <input 
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0"
              className="bg-transparent text-right text-3xl font-bold w-1/2 focus:outline-none placeholder-zinc-300 dark:placeholder-zinc-800"
            />
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center -my-5 relative z-10">
          <button 
            onClick={switchAssets}
            className="w-12 h-12 bg-white dark:bg-zinc-900 border-4 border-white dark:border-black rounded-[18px] flex items-center justify-center text-blue-600 dark:text-blue-500 shadow-xl active:rotate-180 transition-professional"
          >
            <ArrowDownUp size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* To Section */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[32px] p-6 transition-professional">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{language === 'ru' ? 'ПОЛУЧАЕТЕ' : 'YOU GET'}</span>
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Bal: {formatValue(toAsset.balance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setIsAssetPickerOpen('to')}
              className="flex items-center space-x-2 bg-white dark:bg-zinc-800 p-2 pr-4 rounded-2xl border border-zinc-100 dark:border-white/5 shadow-sm active:scale-95 transition-professional"
            >
              <img src={toAsset.logoUrl} className="w-8 h-8 object-contain rounded-full" alt="" />
              <span className="font-bold text-base">{toAsset.symbol}</span>
              <ChevronDown size={14} className="text-zinc-400" />
            </button>
            <div className="text-right text-3xl font-bold text-zinc-400 dark:text-zinc-600 truncate">
              {toAmount || '0'}
            </div>
          </div>
        </div>

        <div className="mt-8 px-4 py-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 space-y-3">
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-zinc-500 font-medium">{language === 'ru' ? 'Курс обмена' : 'Exchange Rate'}</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              1 {fromAsset.symbol} ≈ {exchangeRate.toFixed(4)} {toAsset.symbol}
            </span>
          </div>
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-zinc-500 font-medium">{t.networkFee}</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-bold">$1.42</span>
          </div>
        </div>

        <button 
          disabled={!fromAmount || isInsufficient}
          onClick={handleSwapClick}
          className={`w-full py-5 rounded-[24px] font-bold text-[17px] mt-10 shadow-2xl transition-all ${
            !fromAmount || isInsufficient
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed' 
            : 'bg-blue-600 text-white shadow-blue-600/30 btn-press'
          }`}
        >
          {isInsufficient ? t.insufficient : t.swap}
        </button>
      </div>

      {/* Asset Picker Modal */}
      {isAssetPickerOpen && (
        <div className="absolute inset-0 z-[100] flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60 glass-panel" onClick={() => setIsAssetPickerOpen(null)}></div>
          <div className="w-full bg-white dark:bg-zinc-950 rounded-t-[40px] h-[85%] flex flex-col p-6 relative animate-spring-up">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6 shrink-0"></div>
            
            <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className="text-xl font-bold">{language === 'ru' ? 'Выберите актив' : 'Select Asset'}</h3>
                <button onClick={() => setIsAssetPickerOpen(null)} className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center">
                    <X size={20} />
                </button>
            </div>

            <div className="relative mb-6 shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                    type="text" 
                    placeholder={language === 'ru' ? 'Поиск...' : 'Search...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:outline-none transition-professional"
                />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                {filteredAssets.map(asset => (
                    <button 
                        key={asset.id}
                        onClick={() => selectAsset(asset)}
                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-professional active:scale-95"
                    >
                        <div className="flex items-center space-x-4">
                            <img src={asset.logoUrl} className="w-10 h-10 object-contain" alt="" />
                            <div className="text-left">
                                <p className="font-bold text-base">{asset.symbol}</p>
                                <p className="text-xs text-zinc-500 font-medium">{asset.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">{formatValue(asset.balance)}</p>
                            <p className="text-xs text-zinc-500 font-medium">${formatValue(asset.balance * asset.priceUsd)}</p>
                        </div>
                    </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Bottom Sheet */}
      {showConfirmation && (
        <div className="absolute inset-0 z-[110] flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60 glass-panel" onClick={() => setShowConfirmation(false)}></div>
          <div className="w-full bg-white dark:bg-zinc-950 rounded-t-[40px] p-8 pb-12 relative animate-spring-up shadow-2xl border-t border-white/5">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8"></div>
            
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold mb-2">{t.confirm} {t.swap}</h3>
              <p className="text-[13px] text-zinc-500 font-medium uppercase tracking-widest">{t.review}</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-100 dark:border-white/5">
                <div className="text-left">
                  <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t.send}</p>
                  <p className="text-xl font-bold">{fromAmount} {fromAsset.symbol}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600">
                  <ArrowDownUp size={20} strokeWidth={2.5} />
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t.receive}</p>
                  <p className="text-xl font-bold text-green-600">{toAmount} {toAsset.symbol}</p>
                </div>
              </div>

              <div className="px-6 py-2 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 font-medium">{t.networkFee}</span>
                  <span className="font-bold">$1.42</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-zinc-500 font-medium">{language === 'ru' ? 'Проскальзывание' : 'Slippage'}</span>
                   <span className="font-bold text-blue-500">0.5%</span>
                </div>
              </div>

              <button 
                onClick={confirmSwap}
                className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-bold text-lg shadow-xl shadow-blue-600/30 btn-press"
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
