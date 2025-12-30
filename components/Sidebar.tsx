
import React from 'react';
import { View, Theme } from '../types';
import { Home, Compass, Repeat, Gift, Settings, Wallet, BarChart3 } from 'lucide-react';

interface Props {
  activeView: View;
  onViewChange: (view: View) => void;
  t: any;
  theme: Theme;
}

const Sidebar: React.FC<Props> = ({ activeView, onViewChange, t, theme }) => {
  const navItems = [
    { id: 'wallet' as View, label: t.wallet, icon: <Wallet size={20} /> },
    { id: 'discover' as View, label: t.discover, icon: <Compass size={20} /> },
    { id: 'swap' as View, label: t.swap, icon: <Repeat size={20} /> },
    { id: 'rewards' as View, label: t.rewards, icon: <Gift size={20} /> },
  ];

  const bottomItems = [
    { id: 'settings' as View, label: t.settings, icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-56 h-full bg-white dark:bg-dark-surface border-r border-zinc-200 dark:border-dark-border flex flex-col py-8 px-4 transition-colors duration-300">
      <div className="mb-10 px-4 flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic">W</div>
          <span className="font-black tracking-tighter text-lg">Ledger</span>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
                if (['wallet', 'discover', 'swap', 'settings'].includes(item.id)) {
                    onViewChange(item.id);
                }
            }}
            className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl transition-all duration-200 ${
              activeView === item.id 
              ? 'bg-blue-600/5 text-blue-600 dark:bg-blue-600/10' 
              : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-dark-elevated'
            }`}
          >
            {item.icon}
            <span className="font-extrabold text-[14px]">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="space-y-1 pt-6 border-t border-zinc-100 dark:border-dark-border/50">
        {bottomItems.map((item) => (
           <button
             key={item.id}
             onClick={() => onViewChange(item.id)}
             className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl transition-all duration-200 ${
               activeView === item.id 
               ? 'bg-blue-600/5 text-blue-600 dark:bg-blue-600/10' 
               : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-dark-elevated'
             }`}
           >
             {item.icon}
             <span className="font-extrabold text-[14px]">{item.label}</span>
           </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
