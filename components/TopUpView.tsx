
import React, { useState } from 'react';
import { Asset } from '../types';
import { ChevronLeft, Plus, Minus } from 'lucide-react';

interface Props {
  assets: Asset[];
  onBack: () => void;
  onUpdate: (assetId: string, amount: number) => void;
}

const TopUpView: React.FC<Props> = ({ assets, onBack, onUpdate }) => {
  const [selectedId, setSelectedId] = useState(assets[0].id);
  const [inputVal, setInputVal] = useState('');

  const handleUpdate = () => {
    const val = parseFloat(inputVal);
    if (isNaN(val)) return;
    onUpdate(selectedId, val);
    onBack();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black text-black dark:text-white animate-in slide-in-from-bottom duration-300 transition-colors">
      <div className="flex items-center justify-between p-5 mt-8">
        <button onClick={onBack} className="text-blue-600 dark:text-blue-500 btn-press">
          <ChevronLeft size={28} />
        </button>
        <h2 className="text-lg font-bold">Manage Balances</h2>
        <div className="w-10"></div>
      </div>

      <div className="p-5 space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm text-blue-600 dark:text-blue-400">
          This is a demo mode tool. You can manually set the balance for any asset to test the UI.
        </div>

        <div className="space-y-4">
          <label className="text-zinc-500 text-xs font-bold uppercase ml-1">Select Asset</label>
          <div className="grid grid-cols-2 gap-3">
            {assets.map(a => (
              <button 
                key={a.id}
                onClick={() => {
                  setSelectedId(a.id);
                  setInputVal(a.balance.toString());
                }}
                className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all active:scale-95 ${
                  selectedId === a.id ? 'bg-blue-600/10 border-blue-500' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-white/5'
                }`}
              >
                <img src={a.logoUrl} alt="" className="w-7 h-7 object-contain" />
                <span className="font-bold">{a.symbol}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-zinc-500 text-xs font-bold uppercase ml-1">New Balance</label>
          <input 
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="0.00"
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-5 text-black dark:text-white text-3xl font-bold focus:outline-none focus:border-blue-500 transition-all placeholder-zinc-300 dark:placeholder-zinc-800"
          />
        </div>

        <button 
          onClick={handleUpdate}
          className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-bold shadow-xl shadow-blue-600/30 transition-all active:scale-95 mt-10"
        >
          Update Balance
        </button>
      </div>
    </div>
  );
};

export default TopUpView;
