
import React, { useState } from 'react';
import { Asset, Transaction } from '../types';
import { ChevronLeft, QrCode, ShieldCheck, X, ChevronDown, CheckCircle2 } from 'lucide-react';
import { USER_ADDRESSES } from '../constants';

interface Props {
  assets: Asset[];
  initialAssetId: string | null;
  onBack: () => void;
  onSend: (tx: Transaction) => void;
  t: any;
}

const formatValue = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(val);
};

const formatUSD = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const SendView: React.FC<Props> = ({ assets, initialAssetId, onBack, onSend, t }) => {
  const [asset, setAsset] = useState<Asset>(() => {
    return assets.find(a => a.id === initialAssetId) || assets[0];
  });
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const usdValue = amount ? formatUSD(parseFloat(amount) * asset.priceUsd) : '0.00';

  const handleNext = () => {
    const numAmount = parseFloat(amount);
    if (!address || isNaN(numAmount) || numAmount <= 0) return;
    setIsConfirming(true);
  };

  const handleFinalSend = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onSend({
        id: Math.random().toString(36).substr(2, 9),
        assetId: asset.id,
        type: 'send',
        amount: parseFloat(amount),
        address,
        timestamp: Date.now(),
        status: 'confirmed'
      });
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onBack();
      }, 1500);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black p-10 page-enter text-black dark:text-white">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6 scale-in">
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-semibold">{t.done}!</h2>
        <p className="text-zinc-500 mt-2 text-sm text-center">Transaction broadcasted successfully</p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black p-10 page-enter text-black dark:text-white">
        <div className="w-16 h-16 border-[3px] border-blue-600/10 border-t-blue-600 rounded-full animate-spin mb-8"></div>
        <h2 className="text-xl font-semibold">{t.processing}</h2>
        <p className="text-zinc-500 mt-2 text-center text-sm opacity-60">Pending on {asset.name} Chain...</p>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-black text-black dark:text-white page-enter">
        <div className="flex items-center justify-between p-6 mt-6 shrink-0">
          <button onClick={() => setIsConfirming(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-white/5 btn-press">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-base font-semibold">{t.review}</h2>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 px-7 flex flex-col pt-6">
          <div className="flex flex-col items-center mb-10 scale-in">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-5 border border-blue-500/10">
              <ShieldCheck size={32} />
            </div>
            <p className="text-[32px] font-semibold tracking-tight">{formatValue(parseFloat(amount))} <span className="text-zinc-400 font-medium text-2xl">{asset.symbol}</span></p>
            <p className="text-zinc-500 font-semibold text-xs tracking-widest uppercase mt-1">≈ ${usdValue}</p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[32px] p-7 space-y-6">
            <div className="space-y-1.5">
              <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest opacity-60">{t.recipient}</p>
              <p className="font-mono text-xs break-all text-zinc-700 dark:text-zinc-200 bg-white/50 dark:bg-white/5 p-3 rounded-xl border border-zinc-200 dark:border-white/5">{address}</p>
            </div>
            <div className="flex justify-between items-center border-t border-zinc-200 dark:border-white/5 pt-5">
              <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest opacity-60">{t.networkFee}</p>
              <p className="font-semibold text-zinc-600 dark:text-zinc-300">$0.85</p>
            </div>
            <div className="flex justify-between items-center border-t border-zinc-200 dark:border-white/5 pt-5">
              <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest opacity-60">Total Cost</p>
              <p className="font-semibold text-black dark:text-white text-lg tracking-tight">${formatUSD(parseFloat(usdValue.replace(/,/g, '')) + 0.85)}</p>
            </div>
          </div>

          <div className="mt-auto pb-12">
            <button 
              onClick={handleFinalSend}
              className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-semibold shadow-xl shadow-blue-600/30 btn-press active:scale-95 transition-all"
            >
              {t.confirm}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black text-black dark:text-white page-enter">
      <div className="flex items-center justify-between p-6 mt-6 shrink-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-white/5 btn-press">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-base font-semibold">{t.send} {asset.symbol}</h2>
        <div className="w-10"></div>
      </div>

      <div className="px-7 space-y-8 mt-4 overflow-y-auto no-scrollbar pb-10">
        <div className="space-y-3">
          <label className="text-zinc-500 text-[10px] font-semibold uppercase tracking-[0.15em] ml-1 opacity-60">{t.recipient}</label>
          <div className="relative group">
            <input 
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-5 text-black dark:text-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
            />
            <button className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-500">
              <QrCode size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-zinc-500 text-[10px] font-semibold uppercase tracking-[0.15em] ml-1 opacity-60">{t.amount}</label>
          <div className="relative">
            <input 
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-6 text-black dark:text-white focus:outline-none focus:border-blue-500 transition-all text-3xl font-semibold placeholder-zinc-300 dark:placeholder-zinc-800"
            />
            <button 
              onClick={() => setAmount(asset.balance.toString())}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-500 text-[10px] font-semibold bg-blue-500/10 px-3.5 py-2 rounded-full border border-blue-500/10 hover:bg-blue-500/20 transition-all"
            >
              MAX
            </button>
          </div>
          <div className="flex justify-between items-center px-1">
            <div className="flex flex-col">
               <span className="text-zinc-500 text-[11px] font-medium">Balance: {formatValue(asset.balance)} {asset.symbol}</span>
               <span className="text-blue-600 dark:text-blue-500 text-[13px] font-semibold mt-0.5">≈ ${usdValue}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
           <label className="text-zinc-500 text-[10px] font-semibold uppercase tracking-[0.15em] ml-1 opacity-60">{t.asset}</label>
           <div className="relative">
             <select 
              value={asset.id}
              onChange={(e) => setAsset(assets.find(a => a.id === e.target.value)!)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-5 text-black dark:text-white focus:outline-none appearance-none font-semibold text-sm"
             >
               {assets.map(a => (
                 <option key={a.id} value={a.id}>{a.name} ({a.symbol})</option>
               ))}
             </select>
             <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
           </div>
        </div>

        <div className="pt-6">
          <button 
            disabled={!address || !amount || parseFloat(amount) > asset.balance}
            onClick={handleNext}
            className={`w-full py-5 rounded-[24px] font-semibold transition-all shadow-xl ${
              !address || !amount || parseFloat(amount) > asset.balance
              ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-white/5' 
              : 'bg-blue-600 text-white shadow-blue-600/30 btn-press active:scale-95'
            }`}
          >
            {parseFloat(amount) > asset.balance ? t.insufficient : t.send}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendView;
