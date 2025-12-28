
import React, { useState, useEffect } from 'react';
import { Asset, Transaction } from '../types';
import { ChevronLeft, ArrowDownUp, Info, ChevronDown, CheckCircle2, X } from 'lucide-react';

interface Props {
  assets: Asset[];
  onBack: () => void;
  onSwap: (tx: Transaction) => void;
  t: any;
}

const formatValue = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(val);
};

const SwapView: React.FC<Props> = ({ assets, onBack, onSwap, t }) => {
  const [fromAsset, setFromAsset] = useState<Asset>(assets[1] || assets[0]);
  const [toAsset, setToAsset] = useState<Asset>(assets[2] || assets[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchRate = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${fromAsset.id},${toAsset.id}&vs_currencies=usd`);
        const data = await response.json();
        const fromPrice = data[fromAsset.id]?.usd;
        const toPrice = data[toAsset.id]?.usd;
        
        if (fromPrice && toPrice) {
          setExchangeRate(fromPrice / toPrice);
        } else {
          setExchangeRate(fromAsset.priceUsd / toAsset.priceUsd);
        }
      } catch (e) {
        setExchangeRate(fromAsset.priceUsd / toAsset.priceUsd);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRate();
  }, [fromAsset.id, toAsset.id]);

  useEffect(() => {
    if (fromAmount && exchangeRate) {
      setToAmount((parseFloat(fromAmount) * exchangeRate).toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount, exchangeRate]);

  const handleSwapClick = () => {
    setShowConfirmation(true);
  };

  const confirmSwap = () => {
    setShowConfirmation(false);
    setIsProcessing(true);
    
    setTimeout(() => {
      const amount = parseFloat(fromAmount);
      onSwap({
        id: Math.random().toString(36).substr(2, 9),
        assetId: fromAsset.id,
        toAssetId: toAsset.id,
        type: 'swap',
        amount: amount,
        toAmount: parseFloat(toAmount),
        timestamp: Date.now(),
        status: 'confirmed'
      });
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onBack();
      }, 1500);
    }, 3000);
  };

  const switchAssets = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setFromAmount('');
    setToAmount('');
  };

  if (isSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white p-10 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-6 scale-in duration-700 ease-out">
          <CheckCircle2 size={64} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-semibold">{t.done}!</h2>
        <p className="text-zinc-500 mt-2">{t.swap} {t.completed}</p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white p-10 animate-in fade-in duration-300">
        <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-8"></div>
        <h2 className="text-xl font-semibold">{t.processing}</h2>
        <p className="text-zinc-500 mt-2 text-center text-sm">AMM protocol matching liquidity...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-black text-black dark:text-white flex flex-col animate-in slide-in-from-bottom duration-300 relative">
      <div className="flex items-center justify-between p-5 mt-8 shrink-0">
        <button onClick={onBack} className="text-blue-600 dark:text-blue-500 btn-press">
          <ChevronLeft size={28} />
        </button>
        <h2 className="text-lg font-semibold">{t.swap}</h2>
        <button className="text-zinc-500"><Info size={22} /></button>
      </div>

      <div className="px-5 mt-4 space-y-2 relative flex-1 overflow-y-auto no-scrollbar">
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[32px] p-6 shadow-sm transition-colors">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">From</span>
            <span className="text-zinc-500 text-xs font-medium">Bal: {formatValue(fromAsset.balance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 bg-white dark:bg-white/5 p-2 pr-4 rounded-full border border-zinc-100 dark:border-white/5 active:scale-95 transition-all">
              <img src={fromAsset.logoUrl} className="w-8 h-8 object-contain" alt="" />
              <span className="font-semibold">{fromAsset.symbol}</span>
              <ChevronDown size={16} />
            </div>
            <input 
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-right text-3xl font-semibold w-1/2 focus:outline-none placeholder-zinc-300 dark:placeholder-zinc-800"
            />
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 top-[170px] z-10">
          <button 
            onClick={switchAssets}
            className="w-12 h-12 bg-white dark:bg-black border border-zinc-100 dark:border-white/5 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-500 active:rotate-180 transition-all duration-500 shadow-xl"
          >
            <ArrowDownUp size={24} />
          </button>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[32px] p-6 shadow-sm pt-10 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">To</span>
            <span className="text-zinc-500 text-xs font-medium">Bal: {formatValue(toAsset.balance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 bg-white dark:bg-white/5 p-2 pr-4 rounded-full border border-zinc-100 dark:border-white/5 active:scale-95 transition-all">
              <img src={toAsset.logoUrl} className="w-8 h-8 object-contain" alt="" />
              <span className="font-semibold">{toAsset.symbol}</span>
              <ChevronDown size={16} />
            </div>
            <input 
              readOnly
              type="number"
              value={toAmount}
              placeholder="0.00"
              className="bg-transparent text-right text-3xl font-semibold w-1/2 focus:outline-none placeholder-zinc-300 dark:placeholder-zinc-800 text-zinc-400 dark:text-zinc-500"
            />
          </div>
        </div>

        <div className="mt-8 px-2 space-y-4">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-zinc-500">{t.txDetails}</span>
            <span className="text-zinc-600 dark:text-zinc-300">
              {isLoading ? '...' : `1 ${fromAsset.symbol} ≈ ${exchangeRate.toFixed(4)} ${toAsset.symbol}`}
            </span>
          </div>
        </div>

        <button 
          disabled={!fromAmount || parseFloat(fromAmount) > fromAsset.balance}
          onClick={handleSwapClick}
          className={`w-full py-5 rounded-full font-semibold transition-all transform active:scale-[0.98] mt-10 shadow-xl ${
            !fromAmount || parseFloat(fromAmount) > fromAsset.balance
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-zinc-200 dark:border-white/5' 
            : 'bg-blue-600 text-white shadow-blue-600/30'
          }`}
        >
          {parseFloat(fromAmount) > fromAsset.balance ? t.insufficient : t.swap}
        </button>
      </div>

      {showConfirmation && (
        <div className="absolute inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirmation(false)}></div>
          <div className="w-full bg-white dark:bg-zinc-900 rounded-t-[40px] p-8 pb-12 relative animate-in slide-in-from-bottom duration-300 border-t border-zinc-100 dark:border-white/5 shadow-2xl">
            <button 
              onClick={() => setShowConfirmation(false)}
              className="absolute right-6 top-6 w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 btn-press"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold">{t.confirm} {t.swap}</h3>
              <p className="text-sm text-zinc-500 mt-1">{t.review}</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest">{t.send}</p>
                  <p className="text-lg font-semibold">{formatValue(parseFloat(fromAmount))} {fromAsset.symbol}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-500">
                  <ArrowDownUp size={24} />
                </div>
                <div className="text-right">
                  <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest">{t.receive}</p>
                  <p className="text-lg font-semibold">{formatValue(parseFloat(toAmount))} {toAsset.symbol}</p>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-black/40 rounded-3xl p-5 space-y-3 border border-zinc-100 dark:border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">{t.networkFee}</span>
                  <span className="font-semibold text-zinc-600 dark:text-zinc-300">$1.24</span>
                </div>
              </div>

              <button 
                onClick={confirmSwap}
                className="w-full py-5 bg-blue-600 text-white rounded-full font-semibold shadow-xl shadow-blue-600/30 active:scale-95 transition-transform"
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
