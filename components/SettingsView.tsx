
import React from 'react';
import { ChevronLeft, ChevronRight, Shield, Bell, HelpCircle, FileText, Info, Globe, Moon, Sun, Wallet, Trash2 } from 'lucide-react';
import { Language, Theme } from '../types';

interface Props {
  onBack: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onReset: () => void;
  t: any;
}

const SettingsView: React.FC<Props> = ({ onBack, language, onLanguageChange, theme, onThemeChange, onReset, t }) => {
  const toggleLanguage = () => {
    onLanguageChange(language === 'en' ? 'ru' : 'en');
  };

  const toggleTheme = () => {
    onThemeChange(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="h-full bg-white dark:bg-black text-black dark:text-white flex flex-col animate-spring-slide overflow-y-auto no-scrollbar pb-10">
       <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <button onClick={onBack} className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-900 dark:text-zinc-100 btn-press">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-[17px] font-medium">{t.settings}</h2>
        <div className="w-10"></div>
      </div>

      <div className="px-6 space-y-8 mt-2">
        <div className="flex items-center space-x-4 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-100 dark:border-white/5 shadow-sm transition-professional">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl shadow-lg shadow-blue-600/20">
            <Wallet size={24} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg truncate">{t.mainWallet}</h3>
            <p className="text-zinc-400 text-[10px] font-normal tracking-[0.2em] uppercase">Multi-Coin Wallet</p>
          </div>
          <ChevronRight size={20} className="text-zinc-400" />
        </div>

        <div className="space-y-3">
          <h4 className="text-zinc-400 text-[10px] font-medium uppercase tracking-[0.2em] px-2">{language === 'ru' ? 'ПРИЛОЖЕНИЕ' : 'APP SETTINGS'}</h4>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] border border-zinc-100 dark:border-white/5 overflow-hidden transition-professional">
            <button 
              onClick={toggleLanguage}
              className="w-full flex items-center justify-between p-5 active:bg-zinc-100 dark:active:bg-zinc-800 border-b border-zinc-100 dark:border-white/5 transition-professional"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Globe size={20} className="text-blue-600" />
                </div>
                <span className="font-medium text-[15px]">{t.language}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-zinc-400">{language === 'ru' ? 'Русский' : 'English'}</span>
                <ChevronRight size={18} className="text-zinc-300" />
              </div>
            </button>

            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-5 active:bg-zinc-100 dark:active:bg-zinc-800 transition-professional"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                  {theme === 'light' ? <Sun size={20} className="text-orange-500" /> : <Moon size={20} className="text-blue-500" />}
                </div>
                <span className="font-medium text-[15px]">{t.theme}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-zinc-400">{theme === 'light' ? t.light : t.dark}</span>
                <ChevronRight size={18} className="text-zinc-300" />
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-zinc-400 text-[10px] font-medium uppercase tracking-[0.2em] px-2">{t.support}</h4>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] border border-zinc-100 dark:border-white/5 overflow-hidden transition-professional">
            <button className="w-full flex items-center justify-between p-5 border-b border-zinc-100 dark:border-white/5">
              <div className="flex items-center space-x-4">
                <Shield size={20} className="text-green-500" />
                <span className="font-medium text-[15px]">{t.security || 'Security'}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300" />
            </button>
            <button className="w-full flex items-center justify-between p-5 border-b border-zinc-100 dark:border-white/5">
              <div className="flex items-center space-x-4">
                <Bell size={20} className="text-blue-500" />
                <span className="font-medium text-[15px]">{t.notifications || 'Notifications'}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300" />
            </button>
            <button className="w-full flex items-center justify-between p-5">
              <div className="flex items-center space-x-4">
                <HelpCircle size={20} className="text-zinc-400" />
                <span className="font-medium text-[15px]">{t.help || 'Help'}</span>
              </div>
              <ChevronRight size={18} className="text-zinc-300" />
            </button>
          </div>
        </div>

        <div className="pt-4 px-2">
          <button 
            onClick={onReset}
            className="w-full flex items-center justify-center space-x-3 p-5 rounded-[28px] bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500/10 transition-all btn-press"
          >
            <Trash2 size={20} />
            <span className="font-medium">{language === 'ru' ? 'Сбросить кошелек' : 'Reset Wallet'}</span>
          </button>
        </div>

        <div className="text-center pt-8 opacity-40">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em]">Version 1.0.4 (Build 88)</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
