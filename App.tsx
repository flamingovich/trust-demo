
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Asset, Transaction, SortOrder, Language, Theme } from './types';
import { INITIAL_ASSETS } from './constants';
import WalletDashboard from './components/WalletDashboard';
import SendView from './components/SendView';
import ReceiveView from './components/ReceiveView';
import TopUpView from './components/TopUpView';
import SettingsView from './components/SettingsView';
import DiscoverView from './components/DiscoverView';
import SwapView from './components/SwapView';
import HistoryView from './components/HistoryView';
import BottomNav from './components/BottomNav';
import { translations } from './translations';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('wallet');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('demo_wallet_lang') as Language) || 'ru';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('demo_wallet_theme') as Theme) || 'light';
  });
  
  const t = translations[language];

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('demo_wallet_assets');
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('demo_wallet_txs');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      // Mapping our IDs to CoinGecko IDs
      const mapping: Record<string, string> = {
        'bitcoin': 'bitcoin',
        'eth': 'ethereum',
        'tron': 'tron',
        'usdt-tron': 'tether'
      };
      
      const cgIds = Object.values(mapping).join(',');
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgIds}&vs_currencies=usd&include_24hr_change=true`);
      const data = await response.json();
      
      setAssets(prev => prev.map(asset => {
        const cgId = mapping[asset.id];
        if (cgId && data[cgId]) {
          return {
            ...asset,
            priceUsd: data[cgId].usd,
            change24h: data[cgId].usd_24h_change || asset.change24h
          };
        }
        return asset;
      }));
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPrices();
    // Simulate some network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchPrices]);

  useEffect(() => {
    localStorage.setItem('demo_wallet_assets', JSON.stringify(assets));
    localStorage.setItem('demo_wallet_txs', JSON.stringify(transactions));
    localStorage.setItem('demo_wallet_lang', language);
    localStorage.setItem('demo_wallet_theme', theme);
    
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [assets, transactions, language, theme]);

  const totalBalance = useMemo(() => {
    return assets.reduce((acc, asset) => acc + (asset.balance * asset.priceUsd), 0);
  }, [assets]);

  const sortedAssets = useMemo(() => {
    let sorted = [...assets];
    if (sortOrder === 'asc') {
      sorted.sort((a, b) => (a.balance * a.priceUsd) - (b.balance * b.priceUsd));
    } else if (sortOrder === 'desc') {
      sorted.sort((a, b) => (b.balance * b.priceUsd) - (a.balance * a.priceUsd));
    }
    return sorted;
  }, [assets, sortOrder]);

  const handleUpdateBalance = (assetId: string, newBalance: number) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, balance: newBalance } : a));
  };

  const handleAddTransaction = (tx: Transaction) => {
    const fullTx: Transaction = {
      ...tx,
      hash: tx.hash || `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}...`,
      networkFee: tx.networkFee || (Math.random() * 2 + 0.1).toFixed(2) + ' USD',
      blockNumber: tx.blockNumber || Math.floor(Math.random() * 10000000) + 18000000
    };

    setTransactions(prev => [fullTx, ...prev]);
    setAssets(prev => prev.map(a => {
      if (a.id === tx.assetId) {
        if (tx.type === 'send') return { ...a, balance: Math.max(0, a.balance - tx.amount) };
        if (tx.type === 'receive') return { ...a, balance: a.balance + tx.amount };
        if (tx.type === 'swap') return { ...a, balance: Math.max(0, a.balance - tx.amount) };
      }
      if (tx.type === 'swap' && a.id === tx.toAssetId) {
        return { ...a, balance: a.balance + (tx.toAmount || 0) };
      }
      return a;
    }));
  };

  const renderView = () => {
    switch (activeView) {
      case 'wallet':
        return (
          <WalletDashboard 
            assets={sortedAssets} 
            totalBalance={totalBalance} 
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            t={t}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            onAction={(view, assetId) => {
              setActiveView(view);
              setSelectedAssetId(assetId || null);
            }} 
          />
        );
      case 'send':
        return <SendView assets={assets} initialAssetId={selectedAssetId} onBack={() => setActiveView('wallet')} onSend={handleAddTransaction} t={t} />;
      case 'receive':
        return <ReceiveView assets={assets} initialAssetId={selectedAssetId} onBack={() => setActiveView('wallet')} onSimulateReceive={handleAddTransaction} t={t} />;
      // Added language prop to SwapView
      case 'swap':
        return <SwapView assets={assets} onBack={() => setActiveView('wallet')} onSwap={handleAddTransaction} t={t} language={language} />;
      case 'history':
        return <HistoryView transactions={transactions} assets={assets} onBack={() => setActiveView('wallet')} t={t} language={language} />;
      case 'top-up':
        return <TopUpView assets={assets} onBack={() => setActiveView('wallet')} onUpdate={handleUpdateBalance} />;
      case 'settings':
        return <SettingsView onBack={() => setActiveView('wallet')} language={language} onLanguageChange={setLanguage} theme={theme} onThemeChange={setTheme} t={t} />;
      default:
        return <div className="p-10 text-center text-zinc-500">View not implemented</div>;
    }
  };

  return (
    <div className={`flex justify-center min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-zinc-100'}`}>
      <div className="w-full max-w-[430px] h-screen bg-white dark:bg-black flex flex-col relative overflow-hidden shadow-2xl border-x border-zinc-200 dark:border-zinc-900">
        <main className="flex-1 overflow-y-auto ios-scroll no-scrollbar transition-colors duration-300">
          {renderView()}
        </main>
        {['wallet', 'swap', 'discover', 'settings'].includes(activeView) && (
          <BottomNav activeView={activeView} onViewChange={setActiveView} t={t} />
        )}
      </div>
    </div>
  );
};

export default App;
