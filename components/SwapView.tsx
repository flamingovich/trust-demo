
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, Transaction, Language } from '../types';
import { ChevronLeft, ArrowDownUp, Info, ChevronDown, CheckCircle2, X, Loader2, Wallet, RefreshCw, ShieldCheck, Settings2, ChevronRight, Activity } from 'lucide-react';

interface Props {
  assets: Asset[];
  initialAssetId: string | null;
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

const SwapView: React.FC<Props> = ({ assets, initialAssetId, onBack, onSwap, t, language, formatPrice }) => {
  const [fromAsset, setFromAsset] = useState<Asset>(() => {
    if (initialAssetId) {
      const found = assets.find(a => a.id === initialAssetId);
      if (found) return found;
    }
    return assets[0];
  });
  const [toAsset, setToAsset] = useState<Asset>(() => {
    const fromIdx = assets.findIndex(a => a.id === fromAsset.id);
    return assets[fromIdx === 0 ? 1 : 0];
  });
  const [fromAmount, setFromAmount] = useState('');
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState<'from' | 'to' | null>(null);

  const [isCalculating, setIsCalculating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusStep, setStatusStep] = useState(0);

  // Random swap fee between 0.05 and 2.00
  const randomSwapFee = useMemo(() => (Math.random() * (2.0 - 0.05) + 0.05).toFixed(2), []);

  const processingMessages = useMemo(() => [
    language === 'ru' ? 'Инициализация обмена...' : 'Initializing swap...',
    language === 'ru' ? 'Поиск лучшего маршрута...' : 'Finding best route...',
    language === 'ru' ? 'Валидация блокчейн-узлов...' : 'Validating blockchain nodes...',
    language === 'ru' ? 'Подписание транзакции...' : 'Signing transaction...',
    language === 'ru' ? 'Финальное подтверждение...' : 'Final confirmation...'
  ], [language]);

  const exchangeRate = useMemo(() => {
    if (!fromAsset || !toAsset) return 0;
    return fromAsset.priceUsd / toAsset.priceUsd;
  }, [fromAsset.priceUsd, toAsset.priceUsd, fromAsset.id, toAsset.id]);

  const toAmount = useMemo(() => {
    const amount = parseFloat(fromAmount);
    if (isNaN(amount) || !exchangeRate) return '';
    return (amount * exchangeRate).toFixed(8);
  }, [fromAmount, exchangeRate]);

  useEffect(() => {
    if (fromAmount) {
      setIsCalculating(true);
      const timer = setTimeout(() => setIsCalculating(false), 400);
      return () => clearTimeout(timer);
    } else {
      setIsCalculating(false);
    }
  }, [fromAmount, fromAsset.id, toAsset.id]);

  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      interval = setInterval(() => {
        setStatusStep(prev => (prev < processingMessages.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isProcessing, processingMessages.length]);

  const handleSwapClick = () => {
    const amount = parseFloat(fromAmount);
    if (!fromAmount || isNaN(amount) || amount <= 0 || amount > fromAsset.balance) return;
    setShowConfirmation(true);
  };

  const confirmSwap = () => {
    setShowConfirmation(false);
    setIsProcessing(true);
    setStatusStep(0);
    
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
    }, 4000);
  };

  const switchAssets = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    if (toAmount) setFromAmount(toAmount);
  };

  const setPercentAmount = (percent: number) => {
    const amount = (fromAsset.balance * percent) / 100;
    setFromAmount(amount.toString());
  };

  if (isSuccess || isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black p-10 relative overflow-hidden">
        {isSuccess ? (
          <div className="flex flex-col items-center animate-scale-in z-10">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 mb-6">
              <CheckCircle2 size={52} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1C1E] dark:text-white uppercase tracking-tight">{t.done}!</h2>
          </div>
        ) : (
          <div className="flex flex-col items-center z-10 w-full px-6 text-center">
            {/* Blockchain Animation Visual */}
            <div className="relative w-32 h-32 mb-10">
              <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="text-blue-600 animate-pulse" size={40} />
              </div>
              {/* Nodes dots */}
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-2 h-2 bg-blue-600 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 60}deg) translate(64px) rotate(-${i * 60}deg)`,
                    opacity: statusStep >= i ? 1 : 0.2,
                    transition: 'opacity 0.3s ease'
                  }}
                />
              ))}
            </div>
            
            <h2 className="text-xl font-bold text-[#1A1C1E] dark:text-white mb-2">{t.processing}</h2>
            <div className="h-6">
              <p className="text-zinc-400 text-sm font-bold opacity-70 animate-fade-in" key={statusStep}>
                {processingMessages[statusStep]}
              </p>
            </div>
          </div>
        )}
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>
      </div>
    );
  }

  const isInsufficient = parseFloat(fromAmount) > fromAsset.balance;

  const fadeStyle: React.CSSProperties = {
    WebkitMaskImage: 'linear-gradient(to right, black 82%, transparent 100%)',
    maskImage: 'linear-gradient(to right, black 82%, transparent 100%)',
  };

  return (
    <div className="h-full bg-[#F5F7F9] dark:bg-black flex flex-col items-center animate-ios-slide-in relative transition-colors overflow-hidden">
      <div className="w-full max-w-xl px-4 pt-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 shrink-0 px-2">
          <button onClick={onBack} className="p-2 text-[#1A1C1E] dark:text-white btn-press">
            <ChevronLeft size={28} strokeWidth={2} />
          </button>
          <h2 className="text-[20px] font-bold text-[#1A1C1E] dark:text-white leading-none">{t.swap}</h2>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 pb-24 px-1 mt-1">
          {/* Section: From */}
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-5 pb-6 shadow-sm border border-zinc-100/50 dark:border-white/5 relative z-0">
            <div className="flex justify-between items-center mb-4 px-0.5">
              <span className="text-zinc-400 text-[13px] font-bold uppercase tracking-wider">{language === 'ru' ? 'Из' : 'From'}</span>
              <div className="flex items-center space-x-1.5">
                <Wallet size={14} className="text-zinc-300" />
                <span className="text-zinc-500 text-[13px] font-bold">{formatValue(fromAsset.balance, 6)}</span>
                <div className="flex space-x-1 ml-1">
                  {[25, 50].map(p => (
                    <button key={p} onClick={() => setPercentAmount(p)} className="bg-blue-600/10 text-blue-600 px-2.5 py-0.5 rounded-lg text-[10px] font-bold active:scale-95">{p}%</button>
                  ))}
                  <button onClick={() => setPercentAmount(100)} className="bg-blue-600/10 text-blue-600 px-2.5 py-0.5 rounded-lg text-[10px] font-bold active:scale-95">{language === 'ru' ? 'Макс' : 'Max'}</button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between overflow-hidden">
              <button onClick={() => setIsAssetPickerOpen('from')} className="flex items-center space-x-3 group shrink-0">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center p-2 border border-zinc-100 dark:border-white/5 shadow-sm">
                    <img src={fromAsset.logoUrl} className="w-full h-full object-contain" alt="" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5 border border-zinc-100 dark:border-white/10 shadow-sm">
                    <img src={fromAsset.networkIcon || fromAsset.logoUrl} className="w-3.5 h-3.5 object-contain rounded-full" alt="" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-1">
                    <span className="font-extrabold text-[19px] text-[#1A1C1E] dark:text-white leading-tight uppercase">{fromAsset.symbol}</span>
                    <ChevronDown size={18} className="text-zinc-400" />
                  </div>
                  <p className="text-[12px] text-zinc-400 font-bold opacity-60 mt-0.5">{fromAsset.network || 'Tron'}</p>
                </div>
              </button>
              <div className="text-right flex-1 min-w-0 ml-4 overflow-hidden relative">
                <div style={fadeStyle}>
                  <input 
                    type="number"
                    inputMode="decimal"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    placeholder="0"
                    className="bg-transparent text-right text-[26px] font-extrabold w-full focus:outline-none placeholder-zinc-200 dark:placeholder-zinc-800 text-[#1A1C1E] dark:text-white tracking-tighter whitespace-nowrap overflow-hidden"
                  />
                </div>
                <p className="text-zinc-400 text-[13px] font-bold tracking-tight mt-0.5 truncate">
                  ${formatValue(parseFloat(fromAmount || '0') * fromAsset.priceUsd, 2)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-6.5 relative z-10">
            <button 
              onClick={switchAssets}
              className="w-10 h-10 bg-white dark:bg-zinc-950 border-[4.5px] border-[#F5F7F9] dark:border-black rounded-full flex items-center justify-center text-zinc-400 shadow-md active:rotate-180 transition-all duration-300 hover:scale-105"
            >
              <ArrowDownUp size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Section: To */}
          <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-5 pb-6 shadow-sm border border-zinc-100/50 dark:border-white/5 relative z-0">
            <div className="flex justify-between items-center mb-4 px-0.5">
              <span className="text-zinc-400 text-[13px] font-bold uppercase tracking-wider">{language === 'ru' ? 'В' : 'To'}</span>
              <div className="flex items-center space-x-1.5">
                <Wallet size={14} className="text-zinc-300" />
                <span className="text-zinc-500 text-[13px] font-bold">{formatValue(toAsset.balance, 6)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between overflow-hidden">
              <button onClick={() => setIsAssetPickerOpen('to')} className="flex items-center space-x-3 group shrink-0">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center p-2 border border-zinc-100 dark:border-white/5 shadow-sm">
                    <img src={toAsset.logoUrl} className="w-full h-full object-contain" alt="" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5 border border-zinc-100 dark:border-white/10 shadow-sm">
                    <img src={toAsset.networkIcon || toAsset.logoUrl} className="w-3.5 h-3.5 object-contain rounded-full" alt="" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-1">
                    <span className="font-extrabold text-[19px] text-[#1A1C1E] dark:text-white leading-tight uppercase">{toAsset.symbol}</span>
                    <ChevronDown size={18} className="text-zinc-400" />
                  </div>
                  <p className="text-[12px] text-zinc-400 font-bold opacity-60 mt-0.5">{toAsset.network || 'Tron'}</p>
                </div>
              </button>
              <div className="text-right flex-1 min-w-0 ml-4 overflow-hidden relative">
                <div style={fadeStyle}>
                  <div className={`text-right text-[26px] font-extrabold tracking-tighter whitespace-nowrap overflow-hidden ${isCalculating ? 'opacity-30' : (toAmount ? 'text-[#1A1C1E] dark:text-white' : 'text-zinc-200 dark:text-zinc-800')}`}>
                    {toAmount ? parseFloat(toAmount).toLocaleString('ru-RU', { maximumFractionDigits: 12 }) : '0'}
                  </div>
                </div>
                <p className="text-zinc-400 text-[13px] font-bold tracking-tight mt-0.5 truncate">
                  ${formatValue(parseFloat(toAmount || '0') * toAsset.priceUsd, 2)}
                </p>
              </div>
            </div>
          </div>

          {/* Rate Line */}
          <div className="flex items-center space-x-2 px-3.5 py-1 bg-white dark:bg-zinc-900/60 rounded-full w-fit mx-auto border border-zinc-100/30 shadow-sm mt-1.5">
            <RefreshCw size={12} className="text-zinc-400" />
            <span className="text-[12px] font-bold text-zinc-700 dark:text-zinc-300">
              1 {fromAsset.symbol} ≈ {exchangeRate.toLocaleString('ru-RU', { maximumFractionDigits: 6 })} {toAsset.symbol}
            </span>
          </div>

          {/* Details Section */}
          <div className="bg-white dark:bg-zinc-900/40 rounded-[24px] p-5 space-y-4 border border-zinc-100/50 dark:border-white/5 mt-1">
            <div className="flex justify-between items-start">
              <span className="text-zinc-500 font-bold text-[13px]">{language === 'ru' ? 'Комиссия свопера' : 'Swap fee'}</span>
              <div className="text-right">
                <div className="flex items-center justify-end space-x-1.5 text-[14px] font-extrabold text-[#1A1C1E] dark:text-white">
                  <div className="w-5 h-5 min-w-[20px] rounded-full bg-emerald-500 flex items-center justify-center p-0.5 shadow-sm overflow-hidden shrink-0">
                    <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" className="w-full h-full object-contain brightness-0 invert" alt="" />
                  </div>
                  <span>${randomSwapFee.replace('.', ',')}</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-bold opacity-70 mt-0.5 tracking-tight">{randomSwapFee} USDT</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-1">
              <span className="text-zinc-500 font-bold text-[13px]">{language === 'ru' ? 'Поставщик' : 'Provider'}</span>
              <div className="flex items-center space-x-2 font-bold text-[13px] text-[#1A1C1E] dark:text-white">
                <div className="flex -space-x-1 mr-0.5">
                  <div className="w-6 h-6 min-w-[24px] rounded-full bg-white border border-zinc-100 dark:border-black flex items-center justify-center p-0.5 shadow-sm overflow-hidden shrink-0">
                    <img src="https://cryptologos.cc/logos/uniswap-uni-logo.png" className="w-full h-full object-contain" alt="Uniswap" />
                  </div>
                </div>
                <span>Uniswap</span>
              </div>
            </div>
          </div>

          <div className="pt-3 pb-4">
            <button 
              disabled={!fromAmount || isInsufficient || isCalculating}
              onClick={handleSwapClick}
              className={`w-full py-5 rounded-[26px] font-bold text-[18px] transition-all ${
                  !fromAmount || isInsufficient || isCalculating
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed border border-transparent' 
                  : 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 btn-press active:scale-95'
              }`}
            >
              {isInsufficient ? t.insufficient : isCalculating ? '...' : (language === 'ru' ? 'Продолжить' : 'Continue')}
            </button>
          </div>
        </div>
      </div>

      {/* Asset Picker Modal */}
      {isAssetPickerOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center animate-fade-in p-0 md:p-6">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" onClick={() => setIsAssetPickerOpen(null)}></div>
          <div className="w-full max-w-[440px] bg-white dark:bg-zinc-950 rounded-t-[40px] md:rounded-[40px] h-[75vh] md:h-[600px] flex flex-col p-6 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
            <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-6 md:hidden"></div>
            <div className="flex items-center justify-between mb-6 px-4">
                <h3 className="text-xl font-bold text-[#1A1C1E] dark:text-white uppercase tracking-tight">{language === 'ru' ? 'Выбор токена' : 'Select Token'}</h3>
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
                        className="w-full flex items-center justify-between p-4 rounded-[28px] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-[0.98] group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-11 h-11 min-w-[44px] rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-2 group-hover:scale-110 transition-transform shadow-sm">
                                <img src={asset.logoUrl} className="w-full h-full object-contain" alt="" />
                            </div>
                            <div className="text-left">
                                <p className="font-extrabold text-[17px] text-[#1A1C1E] dark:text-white leading-tight uppercase">{asset.symbol}</p>
                                <p className="text-[12px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5 opacity-60">{asset.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-[16px] text-[#1A1C1E] dark:text-white">{formatValue(asset.balance, 6)}</p>
                        </div>
                    </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[300] bg-white dark:bg-zinc-950 animate-ios-slide-in flex flex-col">
          {/* Confirmation Header */}
          <div className="flex items-center justify-between p-6 pt-10">
            <button onClick={() => setShowConfirmation(false)} className="p-2 text-zinc-800 dark:text-white">
              <ChevronLeft size={28} />
            </button>
            <h3 className="text-[20px] font-bold text-[#1A1C1E] dark:text-white leading-tight">{language === 'ru' ? 'Подтвердить своп' : 'Confirm Swap'}</h3>
            <button className="bg-zinc-100 dark:bg-zinc-900 text-zinc-400 text-[12px] font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 border border-zinc-200/50 dark:border-white/5">
              <Settings2 size={12} strokeWidth={2.5} />
              <span>3%</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
            {/* Confirmation Assets Rows */}
            <div className="px-5 space-y-3 mt-4">
              <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 shadow-sm border border-zinc-100/50 dark:border-white/5 flex items-center justify-between overflow-hidden">
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center p-2 border border-zinc-100 dark:border-white/5">
                      <img src={fromAsset.logoUrl} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-1 border border-zinc-100 dark:border-white/10 shadow-sm">
                      <img src={fromAsset.networkIcon || fromAsset.logoUrl} className="w-3.5 h-3.5 object-contain rounded-full" alt="" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-[18px] text-[#1A1C1E] dark:text-white uppercase leading-none truncate">{fromAsset.symbol}</h4>
                    <p className="text-[13px] text-zinc-400 font-bold mt-1.5 opacity-70">{fromAsset.network || 'Tron'}</p>
                  </div>
                </div>
                <div className="text-right min-w-[100px] overflow-hidden ml-4">
                  <p className="font-extrabold text-[22px] text-[#1A1C1E] dark:text-white leading-none truncate">{fromAmount}</p>
                  <p className="text-zinc-400 font-bold text-[14px] mt-2 opacity-70">${formatValue(parseFloat(fromAmount || '0') * fromAsset.priceUsd, 2)}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-6 shadow-sm border border-zinc-100/50 dark:border-white/5 flex items-center justify-between overflow-hidden">
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center p-2 border border-zinc-100 dark:border-white/5">
                      <img src={toAsset.logoUrl} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-1 border border-zinc-100 dark:border-white/10 shadow-sm">
                      <img src={toAsset.networkIcon || toAsset.logoUrl} className="w-3.5 h-3.5 object-contain rounded-full" alt="" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-[18px] text-[#1A1C1E] dark:text-white uppercase leading-none truncate">{toAsset.symbol}</h4>
                    <p className="text-[13px] text-zinc-400 font-bold mt-1.5 opacity-70">{toAsset.network || 'Tron'}</p>
                  </div>
                </div>
                <div className="text-right min-w-[100px] overflow-hidden ml-4">
                  <p className="font-extrabold text-[22px] text-[#1A1C1E] dark:text-white leading-none truncate">{parseFloat(toAmount).toLocaleString('ru-RU', { maximumFractionDigits: 8 })}</p>
                  <p className="text-zinc-400 font-bold text-[14px] mt-2 opacity-70">${formatValue(parseFloat(toAmount || '0') * toAsset.priceUsd, 2)}</p>
                </div>
              </div>
            </div>

            {/* MEV Protection */}
            <div className="flex items-center justify-center space-x-3 py-6">
              <div className="flex-1 h-[0.5px] bg-zinc-100 dark:bg-white/5"></div>
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-500 font-bold text-[13px] px-2">
                <ShieldCheck size={18} strokeWidth={2.5} />
                <span>{language === 'ru' ? 'Защита от MEV-атак' : 'MEV protection'}</span>
              </div>
              <div className="flex-1 h-[0.5px] bg-zinc-100 dark:bg-white/5"></div>
            </div>

            {/* Fees section */}
            <div className="px-6 mt-2 space-y-6">
               <div className="flex justify-between items-center px-1">
                  <span className="text-zinc-500 font-bold text-[15px]">{language === 'ru' ? 'Мин. сумма для получения' : 'Min received'}</span>
                  <div className="text-right flex items-center space-x-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/10 flex items-center justify-center p-1 shadow-sm overflow-hidden shrink-0">
                      <img src={toAsset.logoUrl} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="min-w-0 max-w-[180px] text-right">
                      <span className="font-extrabold text-[16px] text-[#1A1C1E] dark:text-white block truncate">
                        {formatValue(parseFloat(toAmount) * 0.97, 8)} {toAsset.symbol}
                      </span>
                      <p className="text-[12px] text-zinc-400 font-bold opacity-70 mt-0.5">${formatValue(parseFloat(toAmount) * 0.97 * toAsset.priceUsd, 2)}</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Confirmation Footer */}
          <div className="p-6 pb-12 bg-white dark:bg-zinc-950 border-t border-zinc-50 dark:border-white/5 space-y-5">
             <button 
                onClick={confirmSwap}
                className="w-full py-5 bg-blue-600 text-white rounded-[26px] font-extrabold text-[20px] shadow-2xl shadow-blue-600/30 btn-press active:scale-95 transition-all"
             >
                {language === 'ru' ? 'Подтвердить своп' : 'Confirm Swap'}
             </button>

             <div className="flex items-center justify-center space-x-2.5">
                <div className="w-4 h-4 border-2 border-zinc-100 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-[14px] font-bold text-zinc-500 dark:text-zinc-400 tracking-tight">
                  1 {fromAsset.symbol} ≈ {exchangeRate.toLocaleString('ru-RU', { maximumFractionDigits: 6 })} {toAsset.symbol}
                </span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapView;
