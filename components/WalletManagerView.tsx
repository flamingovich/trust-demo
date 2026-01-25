
import React from 'react';
import { Wallet, Language } from '../types';
import { X, Plus, Check, Trash2, Wallet as WalletIcon, Edit2 } from 'lucide-react';

interface Props {
  wallets: Wallet[];
  activeWalletId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onClose: () => void;
  t: any;
  language: Language;
}

const WalletManagerView: React.FC<Props> = ({ wallets, activeWalletId, onSelect, onCreate, onDelete, onRename, onClose, t, language }) => {
  const calculateWalletBalance = (wallet: Wallet) => {
    return wallet.assets.reduce((sum, asset) => sum + (asset.balance * asset.priceUsd), 0);
  };

  const handleRenameClick = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    // Using a clear prompt for renaming
    const newName = window.prompt(language === 'ru' ? 'Введите новое имя кошелька:' : 'Enter new wallet name:', currentName);
    if (newName !== null && newName.trim() !== "") {
      onRename(id, newName.trim());
    }
  };

  return (
    <div className="absolute inset-0 z-[110] flex items-end justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/60 glass-panel" onClick={onClose}></div>
      <div className="w-full bg-white dark:bg-zinc-950 rounded-t-[40px] p-8 pb-12 relative animate-ios-bottom-up shadow-2xl border-t border-white/5">
        <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-8 md:hidden"></div>
        
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-2xl font-medium tracking-tight text-black dark:text-white">{language === 'ru' ? 'Кошельки' : 'Wallets'}</h3>
          <button onClick={onCreate} className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center btn-press shadow-lg shadow-blue-600/20">
            <Plus size={22} strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
          {wallets.map(wallet => {
            const balance = calculateWalletBalance(wallet);
            const isActive = activeWalletId === wallet.id;
            
            return (
              <div 
                key={wallet.id}
                onClick={() => onSelect(wallet.id)}
                className={`flex items-center justify-between p-5 rounded-[28px] border transition-all cursor-pointer group ${
                  isActive 
                  ? 'bg-blue-600/5 border-blue-500/20 shadow-sm' 
                  : 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent hover:border-zinc-200 dark:hover:border-white/10'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                    <WalletIcon size={22} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium text-base leading-tight ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {wallet.name}
                      </p>
                      <button 
                        title="Rename"
                        onClick={(e) => handleRenameClick(e, wallet.id, wallet.name)}
                        className="p-1.5 text-zinc-400 hover:text-blue-600 transition-colors bg-white/50 dark:bg-zinc-800/50 rounded-lg"
                      >
                        <Edit2 size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-[11px] text-zinc-500 font-normal uppercase tracking-widest">
                        {wallet.assets.length} {language === 'ru' ? 'активов' : 'assets'}
                      </p>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <p className="text-[11px] text-zinc-900 dark:text-zinc-300 font-medium">
                        ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {isActive ? (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(wallet.id); }}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 rounded-[22px] font-medium btn-press"
        >
          {language === 'ru' ? 'Закрыть' : 'Close'}
        </button>
      </div>
    </div>
  );
};

export default WalletManagerView;
