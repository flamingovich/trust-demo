
import React, { useState } from 'react';
import { Asset, Transaction } from '../types';
import { ChevronLeft, Share2, Copy, Sparkles, Check } from 'lucide-react';
import { USER_ADDRESSES } from '../constants';

interface Props {
  assets: Asset[];
  initialAssetId: string | null;
  onBack: () => void;
  onSimulateReceive: (tx: Transaction) => void;
  t: any;
}

const ReceiveView: React.FC<Props> = ({ assets, initialAssetId, onBack, onSimulateReceive, t }) => {
  const [asset, setAsset] = useState<Asset>(() => {
    return assets.find(a => a.id === initialAssetId) || assets[0];
  });
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [receiveAmount, setReceiveAmount] = useState('');
  
  // Use correct static addresses for user's wallet
  const getUserAddress = () => {
    if (asset.id === 'bitcoin') return USER_ADDRESSES.bitcoin;
    if (asset.id === 'tron') return USER_ADDRESSES.tron;
    return USER_ADDRESSES.evm;
  };

  const mockAddress = getUserAddress();

  // USD value preview
  const usdPreview = receiveAmount ? (parseFloat(receiveAmount) * asset.priceUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mockAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const amount = receiveAmount ? parseFloat(receiveAmount) : (Math.floor(Math.random() * 50) + 5);
      onSimulateReceive({
        id: Math.random().toString(36).substr(2, 9),
        assetId: asset.id,
        type: 'receive',
        amount: amount,
        address: mockAddress, // Use user's own address as the target
        timestamp: Date.now(),
        status: 'confirmed'
      });
      setIsSimulating(false);
      setReceiveAmount('');
    }, 1800);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black text-black dark:text-white page-enter">
      <div className="flex items-center justify-between p-6 mt-6 shrink-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-white/5 btn-press">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-base font-bold">{t.receive} {asset.symbol}</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 px-8 py-2 flex flex-col items-center justify-between overflow-y-auto no-scrollbar">
        <div className="w-full flex flex-col items-center space-y-7 mt-4">
          <div className="w-full max-w-[240px] aspect-square bg-white rounded-[44px] p-7 flex items-center justify-center relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-8 border-zinc-50 dark:border-white/5 transition-colors">
            <div className="grid grid-cols-6 gap-2 w-full h-full opacity-[0.03] dark:opacity-10">
              {Array.from({length: 36}).map((_, i) => (
                <div key={i} className="bg-black dark:bg-white rounded-[1px]"></div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden bg-white shadow-xl">
                <img src={asset.logoUrl} alt="" className="w-9 h-9 object-contain" />
              </div>
            </div>
          </div>

          <div className="text-center space-y-4 w-full">
            <p className="text-[11px] font-bold text-zinc-500 max-w-[220px] mx-auto leading-relaxed uppercase tracking-wider opacity-60">
              Only send {asset.name} to this address
            </p>
            
            <button 
              onClick={copyToClipboard}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-[22px] px-5 py-4.5 font-mono text-[11px] break-all text-zinc-700 dark:text-zinc-300 relative active:scale-95 transition-all shadow-inner"
            >
              {mockAddress}
              {copied && (
                <div className="absolute inset-0 bg-blue-600 rounded-[22px] flex items-center justify-center text-white font-bold animate-in fade-in scale-in duration-300">
                  <Check size={18} className="mr-2" /> Copied
                </div>
              )}
            </button>
          </div>
        </div>

        <div className="w-full space-y-5 pt-6 pb-8">
          <div className="space-y-2">
             <div className="flex justify-between items-center px-1">
                <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest opacity-60">{t.enterAmountToReceive}</label>
                {receiveAmount && <span className="text-blue-600 dark:text-blue-500 text-[10px] font-bold tracking-widest">≈ ${usdPreview}</span>}
             </div>
             <input 
              type="number" 
              placeholder="0.00" 
              value={receiveAmount}
              onChange={e => setReceiveAmount(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-4 text-black dark:text-white text-lg font-bold focus:outline-none focus:border-blue-500 transition-all placeholder-zinc-300 dark:placeholder-zinc-800"
             />
          </div>

          <div className="flex space-x-4 w-full justify-center">
            <button onClick={copyToClipboard} className="flex-1 flex flex-col items-center space-y-2 group btn-press">
              <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-900 rounded-[22px] flex items-center justify-center transition-all border border-zinc-100 dark:border-white/5 hover:border-blue-500/30">
                <Copy size={22} className="text-blue-600 dark:text-blue-500" />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.copy || 'Copy'}</span>
            </button>
            <button className="flex-1 flex flex-col items-center space-y-2 group btn-press">
              <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-900 rounded-[22px] flex items-center justify-center transition-all border border-zinc-100 dark:border-white/5">
                <Share2 size={22} className="text-blue-600 dark:text-blue-500" />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.share || 'Share'}</span>
            </button>
          </div>

          <button 
            disabled={isSimulating}
            onClick={handleSimulate}
            className={`w-full py-4.5 rounded-[22px] flex items-center justify-center space-x-2.5 font-bold text-xs transition-all border ${
              isSimulating 
              ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-400 dark:text-zinc-700' 
              : 'bg-green-500/5 border-green-500/10 text-green-600 dark:text-green-500 hover:bg-green-500/10 active:scale-95'
            }`}
          >
            {isSimulating ? (
              <div className="w-4 h-4 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
            ) : (
              <><Sparkles size={16} /> <span className="uppercase tracking-[0.1em]">{t.simulate}</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiveView;
