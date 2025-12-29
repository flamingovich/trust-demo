
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, Transaction, Language } from '../types';
import { ChevronLeft, ArrowDownUp, Info, ChevronDown, CheckCircle2, X, Loader2 } from 'lucide-react';

interface Props {
  assets: Asset[];
  onBack: () => void;
  onSwap: (tx: Transaction) => void;
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

const SwapView: React.FC<Props> = ({ assets, onBack, onSwap, t, language, formatPrice }) => {
  const [fromAsset, setFromAsset] = useState<Asset>(assets[0]);
  const [toAsset, setToAsset] = useState<Asset>(assets[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState<'from' | 'to' | null>(null);

  const [isCalculating, setIsCalculating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const exchangeRate = useMemo(() => {
    if (!fromAsset || !toAsset) return 0;
    return fromAsset.priceUsd / toAsset.priceUsd;
  }, [fromAsset.priceUsd, toAsset.priceUsd, fromAsset.id, toAsset.id]);

  const toAmount = useMemo(() => {
    const amount = parseFloat(fromAmount);
    if (isNaN(amount) || !exchangeRate) return '';
    return (amount * exchangeRate).toFixed(4);
  }, [fromAmount, exchangeRate]);

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
    setTimeout(() => {
      onSwap({
        id: Math.random().toString(36).substr(2, 9),
        assetId: fromAsset.id,
        toAssetId: toAsset.id,
        type: 'swap',
        amount: parseFloat(fromAmount),
        toAmount: parseFloat(toAmount),
        timestamp: Date.now(),
        status: 'confirmed',
        hash: '0x' + Math.random().toString(16).slice(2, 24)
      });
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => onBack(), 1800);
    }, 2800);
  };

  const switchAssets = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    if (toAmount) setFromAmount(toAmount);
  };

  if (isSuccess || isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black p-10">
        {isSuccess ? (
          <div className="flex flex-col items-center animate-scale-in">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <CheckCircle2 size={52} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1C1E] dark:text-white">{t.done}!</h2>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-600 mb-6" size={52} strokeWidth={2.5} />
            <h2 className="text-xl font-bold text-[#1A1C1E] dark:text-white">{t.processing}</h2>
          </div>
        )}
      </div>
    );
  }

  const isInsufficient = parseFloat(fromAmount) > fromAsset.balance;

  return (
    <div className="h-full bg-white dark:bg-black flex flex-col items-center animate-ios-slide-in relative transition-colors overflow-hidden">
      <div className="w-full max-w-xl px-5 pt-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 shrink-0">
          <button onClick={onBack} className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full text-[#1A1C1E] dark:text-white btn-press">
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
          <h2 className="text-[17px] font-bold text-[#1A1C1E] dark:text-white">{t.swap}</h2>
          <button className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-400">
            <Info size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-24 px-1">
          {/* Card: Pay */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[32px] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{language === 'ru' ? 'Вы отдаете' : 'You pay'}</span>
              <button 
                onClick={() => setFromAmount(fromAsset.balance.toString())}
                className="text-blue-600 text-[11px] font-bold bg-blue-600/10 px-4 py-1.5 rounded-xl hover:bg-blue-600/20 transition-all active:scale-95"
              >
                {language === 'ru' ? 'МАКС' : 'MAX'}: {formatValue(fromAsset.balance)}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setIsAssetPickerOpen('from')}
                className="flex items-center space-x-3 bg-white dark:bg-zinc-800 p-2.5 pr-4 rounded-[20px] shadow-sm border border-zinc-200 dark:border-white/5 active:scale-95 transition-all"
              >
                <img src={fromAsset.logoUrl} className="w-8 h-8 object-contain rounded-[22%]" alt="" />
                <span className="font-bold text-lg text-[#1A1C1E] dark:text-white">{fromAsset.symbol}</span>
                <ChevronDown size={14} className="text-zinc-400" />
              </button>
              <input 
                type="number"
                inputMode="decimal"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0"
                className="bg-transparent text-right text-[36px] font-bold w-1/2 focus:outline-none placeholder-zinc-200 dark:placeholder-zinc-800 text-[#1A1C1E] dark:text-white tracking-tighter"
              />
            </div>
          </div>

          {/* Switcher */}
          <div className="flex justify-center -my-7 relative z-10">
            <button 
              onClick={switchAssets}
              className="w-12 h-12 bg-white dark:bg-zinc-950 border-4 border-white dark:border-black rounded-[18px] flex items-center justify-center text-blue-600 shadow-lg active:rotate-180 transition-all duration-300 hover:scale-110"
            >
              <ArrowDownUp size={20} strokeWidth={3} />
            </button>
          </div>

          {/* Card: Receive */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[32px] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{language === 'ru' ? 'Вы получаете' : 'You get'}</span>
              <span className="text-zinc-400 text-[10px] font-bold bg-zinc-200/50 dark:bg-zinc-800/50 px-3 py-1 rounded-lg">Баланс: {formatValue(toAsset.balance)}</span>
            </div>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setIsAssetPickerOpen('to')}
                className="flex items-center space-x-3 bg-white dark:bg-zinc-800 p-2.5 pr-4 rounded-[20px] shadow-sm border border-zinc-200 dark:border-white/5 active:scale-95 transition-all"
              >
                <img src={toAsset.logoUrl} className="w-8 h-8 object-contain rounded-[22%]" alt="" />
                <span className="font-bold text-lg text-[#1A1C1E] dark:text-white">{toAsset.symbol}</span>
                <ChevronDown size={14} className="text-zinc-400" />
              </button>
              <div className={`text-right text-[36px] font-bold tracking-tighter ${isCalculating ? 'opacity-30' : (toAmount ? 'text-[#1A1C1E] dark:text-white' : 'text-zinc-200 dark:text-zinc-800')}`}>
                {toAmount || '0'}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-[28px] p-6 space-y-4 border border-zinc-100 dark:border-white/5 mt-2">
            <div className="flex justify-between items-center text-[12px] font-bold">
              <span className="text-zinc-400 uppercase tracking-widest text-[9px]">Курс обмена</span>
              <span className="text-[#1A1C1E] dark:text-zinc-200">1 {fromAsset.symbol} ≈ {exchangeRate.toFixed(6)} {toAsset.symbol}</span>
            </div>
            <div className="flex justify-between items-center text-[12px] font-bold pt-4 border-t border-zinc-200/20">
              <span className="text-zinc-400 uppercase tracking-widest text-[9px]">Комиссия сети</span>
              <span className="text-[#1A1C1E] dark:text-zinc-200">{formatPrice(1.42)}</span>
            </div>
          </div>

          {/* Swap Button */}
          <button 
            disabled={!fromAmount || isInsufficient || isCalculating}
            onClick={handleSwapClick}
            className={`w-full py-5 rounded-[26px] font-bold text-xl mt-8 shadow-xl transition-all ${
                !fromAmount || isInsufficient || isCalculating
                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 text-white shadow-blue-600/30 btn-press active:scale-95'
            }`}
          >
            {isInsufficient ? t.insufficient : isCalculating ? '...' : t.swap}
          </button>
        </div>
      </div>

      {/* Asset Picker Modal */}
      {isAssetPickerOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center animate-fade-in p-0 md:p-6">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" onClick={() => setIsAssetPickerOpen(null)}></div>
          <div className="w-full max-w-[440px] bg-white dark:bg-zinc-950 rounded-t-[40px] md:rounded-[40px] h-[75vh] md:h-[600px] flex flex-col p-6 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
            <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6 md:hidden"></div>
            <div className="flex items-center justify-between mb-6 px-4">
                <h3 className="text-xl font-bold text-[#1A1C1E] dark:text-white">{language === 'ru' ? 'Выбор токена' : 'Select Token'}</h3>
                <button onClick={() => setIsAssetPickerOpen(null)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                  <X size={24} strokeWidth={2.5}/>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 px-2">
                {assets.map(asset => (
                    <button 
                        key={asset.id}
                        onClick={() => {
                          if (isAssetPickerOpen === 'from') {
                            if (asset.id === toAsset.id) setToAsset(fromAsset);
                            setFromAsset(asset);
                          } else {
                            if (asset.id === fromAsset.id) setFromAsset(toAsset);
                            setToAsset(asset);
                          }
                          setIsAssetPickerOpen(null);
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-[24px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-[0.98] group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-2 group-hover:scale-110 transition-transform shadow-sm">
                                <img src={asset.logoUrl} className="w-full h-full object-contain" alt="" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-[16px] text-[#1A1C1E] dark:text-white leading-tight">{asset.symbol}</p>
                                <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mt-1">{asset.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-[15px] text-[#1A1C1E] dark:text-white">{formatValue(asset.balance)}</p>
                        </div>
                    </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center animate-fade-in p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-[4px]" onClick={() => setShowConfirmation(false)}></div>
            <div className="w-full max-w-[380px] bg-white dark:bg-zinc-950 rounded-[40px] p-8 relative animate-scale-in shadow-2xl">
                <h3 className="text-xl font-bold text-center mb-10 text-[#1A1C1E] dark:text-white">Подтверждение обмена</h3>
                <div className="space-y-4 mb-10">
                    <div className="flex justify-between items-center p-5 bg-zinc-50 dark:bg-zinc-900 rounded-[24px]">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Вы отдаете</p>
                            <p className="font-bold text-lg text-[#1A1C1E] dark:text-white">{fromAmount} {fromAsset.symbol}</p>
                        </div>
                        <img src={fromAsset.logoUrl} className="w-10 h-10 object-contain" alt="" />
                    </div>
                    <div className="flex justify-between items-center p-5 bg-zinc-50 dark:bg-zinc-900 rounded-[24px]">
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Вы получите</p>
                            <p className="font-bold text-lg text-[#1A1C1E] dark:text-white">{toAmount} {toAsset.symbol}</p>
                        </div>
                        <img src={toAsset.logoUrl} className="w-10 h-10 object-contain" alt="" />
                    </div>
                </div>
                <button 
                    onClick={confirmSwap}
                    className="w-full py-5 bg-blue-600 text-white rounded-[22px] font-bold shadow-lg shadow-blue-600/30 btn-press active:scale-95"
                >
                    Обменять активы
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default SwapView;
