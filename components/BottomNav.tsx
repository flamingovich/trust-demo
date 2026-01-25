
import React from 'react';
import { View } from '../types';
import { Home, Compass, Repeat, Gift, BarChart3 } from 'lucide-react';

interface Props {
  activeView: View;
  onViewChange: (view: View) => void;
  t: any;
}

const BottomNav: React.FC<Props> = ({ activeView, onViewChange, t }) => {
  const navItems = [
    { id: 'wallet' as View, label: t.wallet, icon: <Home size={26} /> },
    { id: 'discover' as View, label: t.discover, icon: <Compass size={26} /> },
    { id: 'swap' as View, label: t.swap, icon: <Repeat size={26} /> },
    { id: 'rewards' as View, label: t.rewards, icon: <Gift size={26} /> },
    { id: 'more' as View, label: t.more, icon: <BarChart3 size={26} /> },
  ];

  return (
    <nav className="shrink-0 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-lg border-t border-zinc-100 dark:border-dark-border px-1 py-3 pb-safe flex justify-between items-center z-50 transition-colors duration-300">
      {navItems.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              if (['wallet', 'discover', 'swap', 'settings'].includes(item.id)) {
                  onViewChange(item.id);
              }
            }}
            className={`flex-1 flex flex-col items-center space-y-1 transition-all btn-press ${
              isActive ? 'text-[#0500FF] dark:text-blue-500' : 'text-[#8E8E93] dark:text-zinc-500'
            }`}
          >
            <div className={`${isActive ? 'scale-105' : ''} transition-transform duration-200`}>
              {item.icon}
            </div>
            <span className={`text-[11px] font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
