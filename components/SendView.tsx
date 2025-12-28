
import React, { useState } from 'react';
import { Asset, Transaction } from '../types';
import { ChevronLeft, QrCode, ShieldCheck, X, ChevronDown, CheckCircle2, Clipboard } from 'lucide-react';

interface Props {
  assets: Asset[];
  initialAssetId: string | null;
  onBack: () => void;
  onSend: (tx: Transaction) => void;
  t: any;
}

const formatValue = (val: any, decimals: number = 4) => {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

const formatUSD = (val: any) => {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '0,00';
  return num.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

  const usdValue = amount ? formatUSD(parseFloat(amount) * (asset?.priceUsd || 0)) : '0,00';

  const handleNext = () => {
    const numAmount = parseFloat(amount);
    if (!address || isNaN(numAmount) || numAmount <= 0) return;
    setIsConfirming(true);
  };

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        console.debug('Clipboard API not available');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text) setAddress(text);
    } catch (err) {
      console.debug('Clipboard access denied or failed');
    }
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
        status: 'confirmed',
        hash: `0x${Math.random().toString(16).slice(2, 10)}...`,
        networkFee: '0,85 USD'
      });
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onBack();
      }, 1800);
    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black p-10 animate-fade-in text-black dark:text-white">
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-8 animate-scale-in">
          <CheckCircle2 size={56} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">{t.done}!</h2>
        <p className="text-zinc-500 mt-3 text-center font-semibold opacity-80">
          Transaction broadcasted to the blockchain
        </p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black p-10 animate-fade-in text-black dark:text-white">
        <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-4 border-blue-600/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">{t.processing}</h2>
        <p className="text-zinc-500 mt-3 text-center font-semibold opacity-70">Securing your transaction...</p>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-black text-black dark:text-white animate-ios-slide-in">
        <div className="flex items-center justify-between p-6 pt-12 shrink-0">
          <button onClick={() => setIsConfirming(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 btn-press">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h2 className="text-[17px] font-semibold tracking-tight">{t.review}</h2>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 px-6 flex flex-col pt-6 overflow-y-auto no-scrollbar">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-900 rounded-[22px] flex items-center justify-center mb-5 border border-zinc-100 dark:border-white/5 shadow-sm">
              <img src={asset.logoUrl} className="w-9 h-9 object-contain" alt="" />
            </div>
            <p className="text-4xl font-semibold tracking-tight text-center">
              {formatValue(parseFloat(amount))} <span className="text-zinc-400 font-semibold text-2xl ml-1">{asset.symbol}</span>
            </p>
            <p className="text-zinc-500 font-semibold text-sm mt-1">≈ {usdValue} $</p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[32px] p-6 space-y-6 shadow-sm">
            <div className="space-y-1.5">
              <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-[0.2em]">{t.recipient}</p>
              <p className="font-mono text-[13px] break-all text-zinc-800 dark:text-zinc-200 leading-relaxed font-semibold">{address}</p>
            </div>
            <div className="flex justify-between items-center border-t border-zinc-200/50 dark:border-white/5 pt-5">
              <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-[0.2em]">{t.networkFee}</p>
              <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-[15px]">0,85 $</p>
            </div>
            <div className="flex justify-between items-center border-t border-zinc-200/50 dark:border-white/5 pt-5">
              <p className="text-zinc-400 text-[10px] font-semibold uppercase tracking-[0.2em]">Network</p>
              <p className="font-semibold text-black dark:text-white text-[15px]">{asset.network}</p>
            </div>
          </div>

          <div className="mt-auto pb-10 pt-10">
            <button 
              onClick={handleFinalSend}
              className="w-full py-5 bg-blue-600 text-white rounded-[26px] font-semibold text-lg shadow-xl shadow-blue-600/30 btn-press active:scale-95 transition-all"
            >
              {t.confirm}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black text-black dark:text-white animate-ios-slide-in overflow-hidden">
      <div className="flex items-center justify-between p-6 pt-12 shrink-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 btn-press">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h2 className="text-[17px] font-semibold tracking-tight">{t.send} {asset.symbol}</h2>
        <div className="w-10"></div>
      </div>

      <div className="px-6 space-y-6 mt-4 flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="space-y-4">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[28px] p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3 ml-1">
              <label className="text-zinc-400 text-[10px] font-semibold uppercase tracking-[0.2em]">{t.recipient}</label>
              <div className="flex items-center space-x-4">
                <button onClick={handlePaste} className="text-blue-600 dark:text-blue-500 text-[11px] font-semibold flex items-center space-x-1 active:opacity-60">
                  <Clipboard size={12} />
                  <span>PASTE</span>
                </button>
                <button className="text-blue-600 dark:text-blue-500 text-[11px] font-semibold flex items-center space-x-1 active:opacity-60">
                  <QrCode size={12} />
                  <span>SCAN</span>
                </button>
              </div>
            </div>
            <textarea 
              placeholder="Recipient address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-transparent text-black dark:text-white focus:outline-none transition-all text-[15px] font-semibold placeholder-zinc-300 dark:placeholder-zinc-800 resize-none h-14"
            />
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[28px] p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3 ml-1">
              <label className="text-zinc-400 text-[10px] font-semibold uppercase tracking-[0.2em]">{t.amount}</label>
              <div className="text-[11px] font-semibold text-zinc-500 whitespace-nowrap">
                Bal: <span className="text-zinc-900 dark:text-zinc-100 font-bold">{formatValue(asset.balance)} {asset.symbol}</span>
              </div>
            </div>
            <div className="flex items-center min-w-0 min-h-[44px]">
              <input 
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 w-full min-w-0 bg-transparent text-black dark:text-white focus:outline-none transition-all text-3xl font-semibold placeholder-zinc-200 dark:placeholder-zinc-800"
              />
              <button 
                onClick={() => setAmount(asset.balance.toString())}
                className="shrink-0 text-blue-600 dark:text-blue-500 text-[11px] font-bold bg-blue-500/10 px-3.5 py-1.5 rounded-xl border border-blue-500/10 active:scale-95 transition-all ml-4 h-8 flex items-center justify-center"
              >
                MAX
              </button>
            </div>
            <div className="mt-2 ml-1">
              <span className="text-zinc-400 text-[13px] font-semibold tracking-tight">≈ {usdValue} $</span>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[28px] p-5 shadow-sm">
            <label className="text-zinc-400 text-[10px] font-semibold uppercase tracking-[0.2em] ml-1 block mb-3">{t.asset}</label>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center p-1.5 shadow-sm">
                    <img src={asset.logoUrl} className="w-full h-full object-contain" alt="" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[16px] leading-tight">{asset.symbol}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">{asset.network}</span>
                  </div>
                </div>
                <ChevronDown size={18} className="text-zinc-400" />
              </div>
              <select 
                value={asset.id}
                onChange={(e) => setAsset(assets.find(a => a.id === e.target.value)!)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.symbol})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <button 
            disabled={!address || !amount || parseFloat(amount) > asset.balance}
            onClick={handleNext}
            className={`w-full py-5 rounded-[26px] font-semibold text-lg transition-all shadow-xl ${
              !address || !amount || parseFloat(amount) > asset.balance
              ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-white/5 shadow-none' 
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
