
import React, { useState } from 'react';
import { Asset, Language } from '../types';
import { ChevronLeft } from 'lucide-react';

interface Props {
  assets: Asset[];
  onBack: () => void;
  onUpdate: (assetId: string, amount: number) => void;
  language: Language;
}

const TopUpView: React.FC<Props> = ({ assets, onBack, onUpdate, language }) => {
  const [selectedId, setSelectedId] = useState(assets[0].id);
  const [inputVal, setInputVal] = useState('');

  const handleUpdate = () => {
    const val = parseFloat(inputVal);
    if (isNaN(val)) return;
    onUpdate(selectedId, val);
    onBack();
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-black text-black dark:text-white animate-ios-slide-in transition-colors">
      <div className="flex items-center justify-between px-5 pt-12 pb-4 shrink-0">
        <button onClick={onBack} className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-500 btn-press">
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>
        <h2 className="text-lg font-medium">{language === 'ru' ? 'Управление балансом' : 'Manage Balances'}</h2>
        <div className="w-10"></div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto no-scrollbar space-y-8">
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 text-sm text-blue-600 dark:text-blue-400 font-normal">
          {language === 'ru' 
            ? 'Это инструмент для демо-режима. Вы можете вручную установить баланс любого актива.' 
            : 'This is a demo mode tool. You can manually set the balance for any asset.'}
        </div>

        <div className="space-y-4">
          <label className="text-zinc-500 text-[10px] font-medium uppercase tracking-widest ml-1">{language === 'ru' ? 'Выберите актив' : 'Select Asset'}</label>
          <div className="grid grid-cols-2 gap-3">
            {assets.map(a => (
              <button 
                key={a.id}
                onClick={() => {
                  setSelectedId(a.id);
                  setInputVal(a.balance.toString());
                }}
                className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all active:scale-95 ${
                  selectedId === a.id ? 'bg-blue-600/5 border-blue-500/20' : 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent'
                }`}
              >
                <img src={a.logoUrl} alt="" className="w-7 h-7 object-contain" />
                <span className="font-medium text-sm">{a.symbol}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-zinc-500 text-[10px] font-medium uppercase tracking-widest ml-1">{language === 'ru' ? 'Новый баланс' : 'New Balance'}</label>
          <input 
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="0.00"
            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-6 text-black dark:text-white text-3xl font-medium focus:outline-none focus:border-blue-500 transition-all placeholder-zinc-300 dark:placeholder-zinc-800"
          />
        </div>

        <div className="pt-4 space-y-3">
          <button 
            onClick={handleUpdate}
            className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-medium shadow-xl shadow-blue-600/30 transition-all btn-press active:scale-95"
          >
            {language === 'ru' ? 'Обновить баланс' : 'Update Balance'}
          </button>
          <button 
            onClick={onBack}
            className="w-full py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 rounded-[22px] font-medium transition-all btn-press active:scale-95"
          >
            {language === 'ru' ? 'Отмена' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopUpView;
