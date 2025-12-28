
import React from 'react';
import { ChevronLeft, ChevronRight, Shield, Bell, HelpCircle, FileText, Info, Globe, Moon, Sun, Wallet, Trash2, Banknote } from 'lucide-react';
import { Language, Theme, Currency } from '../types';

interface Props {
  onBack: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onReset: () => void;
  t: any;
}

const SettingsView: React.FC<Props> = ({ onBack, language, onLanguageChange, theme, onThemeChange, currency, onCurrencyChange, onReset, t }) => {
  return (
    <div className="h-full bg-white dark:bg-dark-bg text-black dark:text-zinc-100 flex flex-col animate-ios-slide-in overflow-y-auto no-scrollbar pb-10">
       <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <button onClick={onBack} className="w-10 h-10 bg-zinc-100 dark:bg-dark-surface rounded-full flex items-center justify-center text-zinc-900 dark:text-zinc-100 btn-press">
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <h2 className="text-[18px] font-bold">{t.settings}</h2>
        <div className="w-10"></div>
      </div>

      <div className="px-6 space-y-8 mt-4">
        <div className="flex items-center space-x-4 bg-zinc-50 dark:bg-dark-surface p-6 rounded-[32px] border border-zinc-100 dark:border-dark-border shadow-sm">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Wallet size={24} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{t.mainWallet}</h3>
            <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase opacity-60">Multi-Coin Wallet</p>
          </div>
          <ChevronRight size={20} className="text-zinc-300 dark:text-zinc-700" />
        </div>

        <div className="space-y-3">
          <h4 className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] px-3">{language === 'ru' ? 'ПРИЛОЖЕНИЕ' : 'APP SETTINGS'}</h4>
          <div className="bg-zinc-50 dark:bg-dark-surface rounded-[32px] border border-zinc-100 dark:border-dark-border overflow-hidden">
            <button 
              onClick={() => onLanguageChange(language === 'en' ? 'ru' : 'en')}
              className="w-full flex items-center justify-between p-5 border-b border-zinc-100 dark:border-dark-border active:bg-zinc-100 dark:active:bg-dark-elevated transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
                  <Globe size={20} className="text-blue-600" />
                </div>
                <span className="font-bold text-[15px]">{t.language}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-zinc-400">{language === 'ru' ? 'Русский' : 'English'}</span>
                <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-700" />
              </div>
            </button>

            <button 
              onClick={() => onCurrencyChange(currency === 'USD' ? 'RUB' : 'USD')}
              className="w-full flex items-center justify-between p-5 border-b border-zinc-100 dark:border-dark-border active:bg-zinc-100 dark:active:bg-dark-elevated transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/10 flex items-center justify-center">
                  <Banknote size={20} className="text-green-600" />
                </div>
                <span className="font-bold text-[15px]">{t.currency}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-zinc-400">{currency}</span>
                <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-700" />
              </div>
            </button>

            <button 
              onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
              className="w-full flex items-center justify-between p-5 active:bg-zinc-100 dark:active:bg-dark-elevated transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/10 flex items-center justify-center">
                  {theme === 'light' ? <Sun size={20} className="text-orange-500" /> : <Moon size={20} className="text-blue-500" />}
                </div>
                <span className="font-bold text-[15px]">{t.theme}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-tighter">{theme === 'light' ? t.light : t.dark}</span>
                <ChevronRight size={18} className="text-zinc-300 dark:text-zinc-700" />
              </div>
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={onReset}
            className="w-full flex items-center justify-center space-x-3 p-5 rounded-[28px] bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 text-red-500 hover:bg-red-500/10 transition-all btn-press"
          >
            <Trash2 size={20} strokeWidth={2.5} />
            <span className="font-bold uppercase tracking-tight text-sm">{t.resetWallet}</span>
          </button>
        </div>

        <div className="text-center pt-8 opacity-20">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em]">v1.0.8 • PRO BUILD</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
