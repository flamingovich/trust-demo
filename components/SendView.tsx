
import React, { useState, useMemo, useEffect } from 'react';
import { Asset, Transaction, Wallet, Language } from '../types';
import { ChevronLeft, QrCode, X, ChevronDown, CheckCircle2, Clipboard, Loader2, Info, Activity, Wallet as WalletIcon } from 'lucide-react';
import { USER_ADDRESSES } from '../constants';

interface Props {
  assets: Asset[];
  wallets: Wallet[];
  initialAssetId: string | null;
  onBack: () => void;
  onSend: (tx: Transaction, toWalletId?: string) => void;
  t: any;
  walletName: string;
  language: Language;
}

const formatValue = (val: any, decimals: number = 4) => {
  const num = typeof val === 'number' ? val : parseFloat(val || '0');
  if (isNaN(num)) return '0';
  return num.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

const formatUSD = (val: any) => {
  const num = typeof val === 'number' ? val : parseFloat(val || '0');
  if (isNaN(num)) return '0,00';
  return num.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const SendView: React.FC<Props> = ({ assets, wallets, initialAssetId, onBack, onSend, t, walletName, language }) => {
  const [asset, setAsset] = useState<Asset>(() => {
    return assets.find(a => a.id === initialAssetId) || assets[0];
  });
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusStep, setStatusStep] = useState(0);
  const [selectedTargetWalletId, setSelectedTargetWalletId] = useState<string | null>(null);
  const [showWalletPicker, setShowWalletPicker] = useState(false);

  const statusMessages = useMemo(() => [
    'Blockchain validation in progress...',
    'Syncing with TRON nodes...',
    'Broadcasting signed message...',
    'Waiting for network confirmation...',
    'Finalizing block inclusion...'
  ], []);

  const trxPrice = useMemo(() => {
    const trx = assets.find(a => a.id === 'tron');
    return trx ? trx.priceUsd : 0.12; 
  }, [assets]);

  const dynamicFeeTRX = useMemo(() => {
    if (asset.id === 'usdt-tron') return 13.5;
    return 1.1;
  }, [asset.id]);

  const dynamicFeeUSD = (dynamicFeeTRX * trxPrice).toFixed(2);

  const usdValue = useMemo(() => {
    const val = amount ? parseFloat(amount) * (asset?.priceUsd || 0) : 0;
    return formatUSD(val);
  }, [amount, asset]);

  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      interval = setInterval(() => {
        setStatusStep(prev => (prev < statusMessages.length - 1 ? prev + 1 : prev));
      }, 900);
    }
    return () => clearInterval(interval);
  }, [isProcessing, statusMessages.length]);

  const handleNext = () => {
    const numAmount = parseFloat(amount);
    if ((!address && !selectedTargetWalletId) || isNaN(numAmount) || numAmount <= 0) return;
    setIsConfirming(true);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAddress(text);
        setSelectedTargetWalletId(null);
      }
    } catch (err) {
      console.debug('Clipboard access denied');
    }
  };

  const handleFinalSend = () => {
    setIsProcessing(true);
    setStatusStep(0);

    setTimeout(() => {
      onSend({
        id: Math.random().toString(36).substr(2, 9),
        assetId: asset.id,
        type: 'send',
        amount: parseFloat(amount),
        address: selectedTargetWalletId ? wallets.find(w => w.id === selectedTargetWalletId)?.name : address,
        timestamp: Date.now(),
        status: 'confirmed',
        hash: `0x${Math.random().toString(16).slice(2, 10)}...`,
        networkFee: `${dynamicFeeTRX} TRX ($${dynamicFeeUSD})`
      }, selectedTargetWalletId || undefined);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onBack();
      }, 1800);
    }, 5000);
  };

  const getUserAddress = () => {
    if (asset.id === 'bitcoin') return USER_ADDRESSES.bitcoin;
    if (asset.id === 'tron' || asset.id === 'usdt-tron') return USER_ADDRESSES.tron;
    return USER_ADDRESSES.evm;
  };

  const handleSelectWallet = (id: string) => {
    setSelectedTargetWalletId(id);
    const w = wallets.find(wall => wall.id === id);
    setAddress(w?.name || '');
    setShowWalletPicker(false);
  };

  if (isSuccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black p-10 animate-fade-in text-black dark:text-white">
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-8 animate-scale-in">
          <CheckCircle2 size={56} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">{t.done}!</h2>
        <p className="text-zinc-500 mt-3 text-center font-bold opacity-80">
          Transaction confirmed and broadcasted
        </p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black p-10 animate-fade-in text-black dark:text-white relative overflow-hidden">
        <div className="relative w-36 h-36 mb-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-600/5 rounded-full animate-ping"></div>
            <div className="absolute inset-4 bg-blue-600/10 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-4 border-[#3262F1]/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#3262F1] border-t-transparent rounded-full animate-spin"></div>
            <Activity className="text-[#3262F1] animate-pulse relative z-10" size={56} strokeWidth={2} />
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute w-2.5 h-2.5 bg-[#3262F1] rounded-full shadow-lg shadow-[#3262F1]/40" style={{ top: '50%', left: '50%', transform: `rotate(${i * 45}deg) translate(72px) rotate(-${i * 45}deg)`, opacity: statusStep >= i % 5 ? 1 : 0.2, transition: 'opacity 0.4s ease' }} />
            ))}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-center">{t.processing}</h2>
        <div className="mt-6 space-y-3 flex flex-col items-center text-center max-w-[280px]">
            <p className="text-zinc-500 text-[15px] font-bold h-10 leading-tight transition-all duration-300">{statusMessages[statusStep]}</p>
            <div className="flex space-x-1">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= statusStep ? 'w-8 bg-[#3262F1]' : 'w-2 bg-zinc-200 dark:bg-zinc-800'}`} />
               ))}
            </div>
            <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-[0.2em] opacity-40 mt-2">TRON Mainnet Network</p>
        </div>
      </div>
    );
  }

  if (isConfirming) {
    const fromAddr = getUserAddress();
    const truncatedFrom = `${fromAddr.slice(0, 6)}...${fromAddr.slice(-4)}`;
    const amountVal = parseFloat(amount);

    return (
      <div className="h-full flex flex-col bg-white dark:bg-[#FBFCFD] text-black animate-ios-slide-in">
        <div className="flex items-center justify-between p-6 pt-12 shrink-0">
          <button onClick={() => setIsConfirming(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 btn-press">
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          <h2 className="text-[18px] font-bold tracking-tight text-[#1A1C1E]">{t.summary}</h2>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 px-5 flex flex-col pt-10 overflow-y-auto no-scrollbar">
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-[52px] font-bold tracking-tight text-center flex items-center justify-center space-x-3 text-[#1A1C1E] leading-none">
              <span>{formatValue(amountVal)}</span>
              <span className="text-[#A2ABB8] font-medium text-4xl">{asset.symbol}</span>
            </h1>
            <p className="text-[#A2ABB8] font-bold text-lg mt-3">≈ {usdValue} USD</p>
          </div>

          <div className="bg-white border border-zinc-100 rounded-[32px] overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] mx-1">
            <div className="p-6 space-y-7">
              <div className="flex justify-between items-center">
                <p className="text-[#A2ABB8] text-[10px] font-bold uppercase tracking-[0.2em]">{t.assetLabel}</p>
                <div className="flex items-center space-x-2.5">
                  <img src={asset.logoUrl} className="w-6 h-6 object-contain rounded-[22%]" alt="" />
                  <span className="font-bold text-[15px] text-[#1A1C1E]">{asset.symbol}</span>
                </div>
              </div>
              <div className="flex justify-between items-start pt-6 border-t border-zinc-50">
                <p className="text-[#A2ABB8] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{t.fromLabel}</p>
                <div className="text-right">
                    <p className="font-bold text-[14px] text-[#1A1C1E]">{walletName}</p>
                    <p className="font-mono text-[11px] text-[#A2ABB8] font-bold tracking-tight">{truncatedFrom}</p>
                </div>
              </div>
              <div className="flex justify-between items-start pt-6 border-t border-zinc-50">
                <p className="text-[#A2ABB8] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{t.toLabel}</p>
                <div className="text-right max-w-[220px]">
                  <p className="font-mono text-[11px] break-all text-[#1A1C1E] leading-relaxed font-bold">
                      {selectedTargetWalletId ? wallets.find(w => w.id === selectedTargetWalletId)?.name : address}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-zinc-50">
                <div className="flex items-center space-x-1.5">
                   <p className="text-[#A2ABB8] text-[10px] font-bold uppercase tracking-[0.2em]">{t.feeLabel}</p>
                   <Info size={12} className="text-[#D1D8E0]" />
                </div>
                <p className="font-bold text-[#1A1C1E] text-[15px]">
                  {dynamicFeeTRX} TRX <span className="text-[#A2ABB8] font-medium ml-1">(${dynamicFeeUSD})</span>
                </p>
              </div>
            </div>
            <div className="bg-[#F8FAFC] p-6 flex justify-between items-center border-t border-zinc-50">
                <p className="text-[#A2ABB8] text-[10px] font-bold uppercase tracking-[0.2em]">{t.maxTotalLabel}</p>
                <p className="font-bold text-[15px] text-[#3262F1]">
                  {formatValue(amountVal)} {asset.symbol} + {dynamicFeeTRX} TRX
                </p>
            </div>
          </div>

          <div className="mt-auto pt-12 pb-10 px-4">
            <button onClick={handleFinalSend} className="w-full py-5 bg-[#3262F1] text-white rounded-2xl font-bold text-[18px] shadow-[0_12px_30px_-5px_rgba(50,98,241,0.35)] btn-press active:scale-95 transition-all">
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
        <h2 className="text-[17px] font-bold tracking-tight">{t.send} {asset.symbol}</h2>
        <div className="w-10"></div>
      </div>

      <div className="px-6 space-y-6 mt-4 flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="space-y-4">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[28px] p-5 shadow-sm relative">
            <div className="flex justify-between items-center mb-3 ml-1">
              <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">{t.recipient}</label>
              <div className="flex items-center space-x-4">
                <button onClick={() => setShowWalletPicker(true)} className="text-[#3262F1] text-[11px] font-bold flex items-center space-x-1 active:opacity-60">
                  <WalletIcon size={12} />
                  <span>{language === 'ru' ? 'МОИ' : 'MY'}</span>
                </button>
                <button onClick={handlePaste} className="text-[#3262F1] text-[11px] font-bold flex items-center space-x-1 active:opacity-60">
                  <Clipboard size={12} />
                  <span>PASTE</span>
                </button>
                <button className="text-[#3262F1] text-[11px] font-bold flex items-center space-x-1 active:opacity-60">
                  <QrCode size={12} />
                  <span>SCAN</span>
                </button>
              </div>
            </div>
            <textarea 
              placeholder="Recipient address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setSelectedTargetWalletId(null);
              }}
              className={`w-full bg-transparent text-black dark:text-white focus:outline-none transition-all text-[15px] font-bold placeholder-zinc-300 dark:placeholder-zinc-800 resize-none h-14 ${selectedTargetWalletId ? 'text-blue-600' : ''}`}
            />
            
            {showWalletPicker && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[22px] shadow-xl z-20 overflow-hidden animate-pop-in">
                <div className="p-3 border-b border-zinc-50 dark:border-white/5 flex justify-between items-center">
                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{language === 'ru' ? 'Мои кошельки' : 'My Wallets'}</span>
                   <button onClick={() => setShowWalletPicker(false)} className="text-zinc-400"><X size={14}/></button>
                </div>
                {wallets.length > 0 ? (
                  wallets.map(w => (
                    <button 
                      key={w.id} 
                      onClick={() => handleSelectWallet(w.id)}
                      className="w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center space-x-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600"><WalletIcon size={16}/></div>
                      <span className="font-bold text-sm">{w.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-zinc-400 text-xs">{language === 'ru' ? 'Нет других кошельков' : 'No other wallets'}</div>
                )}
              </div>
            )}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[28px] p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3 ml-1">
              <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">{t.amount}</label>
              <div className="text-[11px] font-bold text-zinc-500 whitespace-nowrap overflow-hidden text-ellipsis">
                Bal: <span className="text-zinc-900 dark:text-zinc-100 font-bold">{formatValue(asset.balance)} {asset.symbol}</span>
              </div>
            </div>
            <div className="flex items-center min-w-0">
              <input type="number" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 min-w-0 bg-transparent text-black dark:text-white focus:outline-none transition-all text-3xl font-bold placeholder-zinc-200 dark:placeholder-zinc-800" />
              <button onClick={() => setAmount(asset.balance.toString())} className="shrink-0 text-[#3262F1] text-[11px] font-bold bg-[#3262F1]/10 px-3.5 py-1.5 rounded-xl border border-[#3262F1]/10 active:scale-95 transition-all ml-4 h-8 flex items-center justify-center">MAX</button>
            </div>
            <div className="mt-2 ml-1"><span className="text-zinc-400 text-[13px] font-bold tracking-tight">≈ {usdValue} $</span></div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-[28px] p-5 shadow-sm">
            <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] ml-1 block mb-3">{t.asset}</label>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center p-1.5 shadow-sm"><img src={asset.logoUrl} className="w-full h-full object-contain" alt="" /></div>
                  <div className="flex flex-col"><span className="font-bold text-[16px] leading-tight">{asset.symbol}</span><span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{asset.network}</span></div>
                </div>
                <ChevronDown size={18} className="text-zinc-400" />
              </div>
              <select value={asset.id} onChange={(e) => setAsset(assets.find(a => a.id === e.target.value)!)} className="absolute inset-0 opacity-0 cursor-pointer">{assets.map(a => (<option key={a.id} value={a.id}>{a.name} ({a.symbol})</option>))}</select>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <button disabled={(!address && !selectedTargetWalletId) || !amount || parseFloat(amount) > asset.balance} onClick={handleNext} className="w-full py-5 bg-[#3262F1] text-white rounded-[26px] font-bold text-lg transition-all shadow-xl shadow-[#3262F1]/30 btn-press active:scale-95 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none">
            {parseFloat(amount) > asset.balance ? t.insufficient : t.send}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendView;
