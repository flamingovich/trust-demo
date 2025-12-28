
import React from 'react';
import { ChevronLeft, ChevronRight, Shield, Bell, HelpCircle, FileText, Info, Globe, Moon, Sun } from 'lucide-react';
import { Language, Theme } from '../types';

interface Props {
  onBack: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  t: any;
}

const SettingsView: React.FC<Props> = ({ onBack, language, onLanguageChange, theme, onThemeChange, t }) => {
  const toggleLanguage = () => {
    onLanguageChange(language === 'en' ? 'ru' : 'en');
  };

  const toggleTheme = () => {
    onThemeChange(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="h-full bg-white dark:bg-zinc-950 text-black dark:text-white flex flex-col pt-12 animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar">
       <div className="flex items-center justify-between p-5 shrink-0">
        <button onClick={onBack} className="text-blue-600 dark:text-blue-500">
          <ChevronLeft size={28} />
        </button>
        <h2 className="text-lg font-bold">{t.settings}</h2>
        <div className="w-10"></div>
      </div>

      <div className="px-6 space-y-6 mt-4 pb-10">
        <div className="flex items-center space-x-4 bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-[28px] border border-zinc-100 dark:border-white/5 shadow-sm">
          <div className="w-14 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center text-xl shadow-inner">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[17px] truncate">{t.mainWallet}</h3>
            <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase">Multi-Coin Wallet</p>
          </div>
          <ChevronRight size={20} className="text-zinc-400" />
        </div>

        <div className="space-y-2">
          <h4 className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest px-1">App Settings</h4>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[28px] border border-zinc-100 dark:border-white/5 overflow-hidden">
            <button 
              onClick={toggleLanguage}
              className="w-full flex items-center justify-between p-5 active:bg-zinc-100 dark:active:bg-zinc-800 border-b border-zinc-100 dark:border-white/5 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Globe size={20} className="text-blue-600 dark:text-blue-500" />
                </div>
                <span className="font-bold">{t.language}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-zinc-500">{language === 'ru' ? 'Русский' : 'English'}</span>
                <ChevronRight size={18} className="text-zinc-400" />
              </div>
            </button>

            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-5 active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  {theme === 'light' ? <Sun size={20} className="text-orange-500" /> : <Moon size={20} className="text-purple-500" />}
                </div>
                <span className="font-bold">{t.theme}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-zinc-500">{theme === 'light' ? t.light : t.dark}</span>
                <ChevronRight size={18} className="text-zinc-400" />
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest px-1">{t.support}</h4>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[28px] border border-zinc-100 dark:border-white/5 overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 border-b border-zinc-100 dark:border-white/5">
              <div className="flex items-center space-x-4">
                <Shield size={20} className="text-green-500" />
                <span className="font-bold">{t.security}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-400" />
            </button>
            <button className="w-full flex items-center justify-between p-5 border-b border-zinc-100 dark:border-white/5">
              <div className="flex items-center space-x-4">
                <Bell size={20} className="text-blue-500" />
                <span className="font-bold">{t.notifications}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-400" />
            </button>
            <button className="w-full flex items-center justify-between p-5">
              <div className="flex items-center space-x-4">
                <HelpCircle size={20} className="text-zinc-400" />
                <span className="font-bold">{t.help}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
