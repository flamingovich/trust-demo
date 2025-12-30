
import React from 'react';
import { View } from '../types';
import { Home, Compass, Repeat, Gift, BarChart3, Wallet } from 'lucide-react';

interface Props {
  activeView: View;
  onViewChange: (view: View) => void;
  t: any;
}

const BottomNav: React.FC<Props> = ({ activeView, onViewChange, t }) => {
  const navItems = [
    { id: 'wallet' as View, label: t.wallet, icon: <Wallet size={20} /> },
    { id: 'discover' as View, label: t.discover, icon: <Compass size={20} /> },
    { id: 'swap' as View, label: t.swap, icon: <Repeat size={20} /> },
    { id: 'rewards' as View, label: t.rewards, icon: <Gift size={20} /> },
    { id: 'settings' as View, label: t.settings, icon: <BarChart3 size={20} /> },
  ];

  return (
    <nav className="shrink-0 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-t border-zinc-100 dark:border-dark-border px-3 pb-safe pt-2 flex justify-between items-center z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            if (['wallet', 'discover', 'swap', 'settings'].includes(item.id)) {
                onViewChange(item.id);
            }
          }}
          className={`flex-1 flex flex-col items-center space-y-1 transition-all btn-press ${
            activeView === item.id ? 'text-blue-600 dark:text-blue-500' : 'text-zinc-400'
          }`}
        >
          <div className={`${activeView === item.id ? 'scale-110' : ''} transition-transform duration-200`}>
            {item.icon}
          </div>
          <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
