
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Asset, Transaction, SortOrder, Language, Theme, Wallet } from './types';
import { INITIAL_ASSETS } from './constants';
import WalletDashboard from './components/WalletDashboard';
import SendView from './components/SendView';
import ReceiveView from './components/ReceiveView';
import TopUpView from './components/TopUpView';
import SettingsView from './components/SettingsView';
import DiscoverView from './components/DiscoverView';
import SwapView from './components/SwapView';
import HistoryView from './components/HistoryView';
import AssetDetailView from './components/AssetDetailView';
import WalletManagerView from './components/WalletManagerView';
import BottomNav from './components/BottomNav';
import { translations } from './translations';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('wallet');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('demo_wallet_lang') as Language) || 'ru';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('demo_wallet_theme') as Theme) || 'light';
  });
  
  const t = translations[language];

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('demo_wallets');
    if (saved) return JSON.parse(saved);
    return [{ id: 'wallet-1', name: language === 'ru' ? 'Основной кошелек' : 'Main Wallet', assets: INITIAL_ASSETS, transactions: [] }];
  });

  const [activeWalletId, setActiveWalletId] = useState(() => {
    return localStorage.getItem('demo_active_wallet_id') || 'wallet-1';
  });

  const activeWallet = useMemo(() => {
    return wallets.find(w => w.id === activeWalletId) || wallets[0];
  }, [wallets, activeWalletId]);

  const sortedAssets = useMemo(() => {
    let list = [...activeWallet.assets];
    if (sortOrder === 'asc') {
      list.sort((a, b) => (a.balance * a.priceUsd) - (b.balance * b.priceUsd));
    } else if (sortOrder === 'desc') {
      list.sort((a, b) => (b.balance * b.priceUsd) - (a.balance * a.priceUsd));
    }
    return list;
  }, [activeWallet.assets, sortOrder]);

  const fetchPrices = useCallback(async () => {
    try {
      const mapping: Record<string, string> = {
        'bitcoin': 'bitcoin',
        'eth': 'ethereum',
        'tron': 'tron',
        'usdt-tron': 'tether'
      };
      const cgIds = Object.values(mapping).join(',');
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgIds}&vs_currencies=usd&include_24hr_change=true`);
      if (!response.ok) throw new Error('Fetch failed');
      const data = await response.json();
      
      setWallets(prev => prev.map(wallet => ({
        ...wallet,
        assets: wallet.assets.map(asset => {
          const cgId = mapping[asset.id];
          if (cgId && data[cgId]) {
            return {
              ...asset,
              priceUsd: data[cgId].usd,
              change24h: data[cgId].usd_24h_change || asset.change24h
            };
          }
          return asset;
        })
      })));
    } catch (error) {
      console.warn('Price update skipped', error);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPrices();
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  useEffect(() => {
    localStorage.setItem('demo_wallets', JSON.stringify(wallets));
    localStorage.setItem('demo_active_wallet_id', activeWalletId);
    localStorage.setItem('demo_wallet_lang', language);
    localStorage.setItem('demo_wallet_theme', theme);
    
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
  }, [wallets, activeWalletId, language, theme]);

  const totalBalance = useMemo(() => {
    return activeWallet.assets.reduce((acc, asset) => acc + (asset.balance * asset.priceUsd), 0);
  }, [activeWallet]);

  const navigateTo = (view: View, assetId: string | null = null) => {
    if (assetId) setSelectedAssetId(assetId);
    setActiveView(view);
  };

  const handleUpdateBalance = (assetId: string, newBalance: number) => {
    setWallets(prev => prev.map(w => {
      if (w.id === activeWalletId) {
        return {
          ...w,
          assets: w.assets.map(a => a.id === assetId ? { ...a, balance: newBalance } : a)
        };
      }
      return w;
    }));
  };

  const handleAddTransaction = (tx: Transaction) => {
    const fullTx: Transaction = {
      ...tx,
      hash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}...`,
      networkFee: (Math.random() * 2 + 0.1).toFixed(2) + ' USD'
    };
    
    setWallets(prev => prev.map(w => {
      if (w.id === activeWalletId) {
        const updatedAssets = w.assets.map(a => {
          if (a.id === tx.assetId) {
            if (tx.type === 'send' || tx.type === 'swap') return { ...a, balance: Math.max(0, a.balance - tx.amount) };
            if (tx.type === 'receive') return { ...a, balance: a.balance + tx.amount };
          }
          if (tx.type === 'swap' && a.id === tx.toAssetId) {
            return { ...a, balance: a.balance + (tx.toAmount || 0) };
          }
          return a;
        });
        return { ...w, assets: updatedAssets, transactions: [fullTx, ...w.transactions] };
      }
      return w;
    }));
  };

  const handleCreateWallet = () => {
    const newId = `wallet-${Date.now()}`;
    const newWallet: Wallet = {
      id: newId,
      name: `${language === 'ru' ? 'Кошелек' : 'Wallet'} ${wallets.length + 1}`,
      assets: INITIAL_ASSETS.map(a => ({ ...a, balance: 0 })),
      transactions: []
    };
    setWallets([...wallets, newWallet]);
    setActiveWalletId(newId);
  };

  const handleDeleteWallet = (id: string) => {
    if (wallets.length <= 1) return;
    const newWallets = wallets.filter(w => w.id !== id);
    setWallets(newWallets);
    if (activeWalletId === id) setActiveWalletId(newWallets[0].id);
  };

  const handleReset = () => {
    setWallets(prev => prev.map(w => ({
      ...w,
      assets: w.assets.map(a => ({ ...a, balance: 0 })),
      transactions: []
    })));
  };

  const renderView = () => {
    switch (activeView) {
      case 'wallet':
        return (
          <WalletDashboard 
            assets={sortedAssets} 
            totalBalance={totalBalance} 
            walletName={activeWallet.name}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            t={t}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onAction={(view, assetId) => navigateTo(view, assetId)} 
          />
        );
      case 'asset-detail':
        const selectedAsset = activeWallet.assets.find(a => a.id === selectedAssetId);
        if (!selectedAsset) {
          // Fallback if state hasn't updated yet to prevent white screen crash
          return <div className="h-full bg-white dark:bg-black" />;
        }
        return (
          <AssetDetailView 
            asset={selectedAsset}
            transactions={activeWallet.transactions.filter(tx => tx.assetId === selectedAssetId || tx.toAssetId === selectedAssetId)}
            onBack={() => navigateTo('wallet')}
            onAction={(view) => navigateTo(view, selectedAssetId)}
            t={t}
            language={language}
          />
        );
      case 'send':
        return <SendView assets={activeWallet.assets} initialAssetId={selectedAssetId} onBack={() => navigateTo('wallet')} onSend={handleAddTransaction} t={t} />;
      case 'receive':
        return <ReceiveView assets={activeWallet.assets} initialAssetId={selectedAssetId} onBack={() => navigateTo('wallet')} onSimulateReceive={handleAddTransaction} t={t} />;
      case 'top-up':
        return <TopUpView assets={activeWallet.assets} onBack={() => navigateTo('wallet')} onUpdate={handleUpdateBalance} language={language} />;
      case 'swap':
        return <SwapView assets={activeWallet.assets} onBack={() => navigateTo('wallet')} onSwap={handleAddTransaction} t={t} language={language} />;
      case 'history':
        return <HistoryView transactions={activeWallet.transactions} assets={activeWallet.assets} onBack={() => navigateTo('wallet')} t={t} language={language} />;
      case 'settings':
        return (
          <SettingsView 
            onBack={() => navigateTo('wallet')} 
            language={language} 
            onLanguageChange={setLanguage} 
            theme={theme} 
            onThemeChange={setTheme} 
            onReset={handleReset}
            t={t} 
          />
        );
      default:
        return <div className="p-10 text-center text-zinc-500 animate-fade-in">View in development</div>;
    }
  };

  return (
    <div className={`flex justify-center min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-black' : 'bg-zinc-100'}`}>
      <div className="w-full max-w-[430px] h-screen bg-white dark:bg-black flex flex-col relative overflow-hidden shadow-2xl border-x border-zinc-200 dark:border-zinc-900 pt-safe pb-safe">
        <main className="flex-1 overflow-y-auto ios-scroll no-scrollbar relative">
          <div key={activeView} className="h-full w-full absolute inset-0 overflow-hidden">
            {renderView()}
          </div>
        </main>

        {activeView === 'wallet-manager' && (
          <WalletManagerView 
            wallets={wallets}
            activeWalletId={activeWalletId}
            onSelect={(id) => { setActiveWalletId(id); setActiveView('wallet'); }}
            onCreate={handleCreateWallet}
            onDelete={handleDeleteWallet}
            onClose={() => setActiveView('wallet')}
            t={t}
            language={language}
          />
        )}

        {['wallet', 'swap', 'discover', 'settings'].includes(activeView) && (
          <BottomNav activeView={activeView} onViewChange={(view) => navigateTo(view)} t={t} />
        )}
      </div>
    </div>
  );
};

export default App;
