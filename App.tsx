
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Asset, Transaction, SortOrder, Language, Theme, Wallet, Currency } from './types';
import { INITIAL_ASSETS, CG_ID_MAP } from './constants';
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
import Sidebar from './components/Sidebar';
import LockScreen from './components/LockScreen';
import { translations } from './translations';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('wallet');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  
  const lastPriceFetchRef = useRef<number>(0);

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('demo_wallet_lang') as Language) || 'ru';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('demo_wallet_theme') as Theme) || 'light';
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('demo_wallet_currency') as Currency) || 'USD';
  });

  const [rubRate, setRubRate] = useState<number>(92.5); 
  const t = translations[language];

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('demo_wallets');
    let data: any[] = [];
    if (saved) {
      try { data = JSON.parse(saved); } catch (e) { data = []; }
    }
    if (!Array.isArray(data) || data.length === 0) {
      return [{ 
        id: 'wallet-1', 
        name: language === 'ru' ? 'Основной кошелек' : 'Main Wallet', 
        assets: INITIAL_ASSETS, 
        transactions: [] 
      }];
    }
    return data.map(w => ({
      ...w,
      assets: Array.isArray(w.assets) ? w.assets : INITIAL_ASSETS,
      transactions: Array.isArray(w.transactions) ? w.transactions : []
    }));
  });

  const [activeWalletId, setActiveWalletId] = useState(() => {
    return localStorage.getItem('demo_active_wallet_id') || 'wallet-1';
  });

  const activeWallet = useMemo(() => {
    return wallets.find(w => w.id === activeWalletId) || wallets[0];
  }, [wallets, activeWalletId]);

  const sortedAssets = useMemo(() => {
    if (!activeWallet || !activeWallet.assets) return [];
    let list = [...activeWallet.assets];
    if (sortOrder === 'asc') {
      list.sort((a, b) => (a.balance * a.priceUsd) - (b.balance * b.priceUsd));
    } else if (sortOrder === 'desc') {
      list.sort((a, b) => (b.balance * b.priceUsd) - (a.balance * a.priceUsd));
    }
    return list;
  }, [activeWallet, sortOrder]);

  const fetchRubRate = async () => {
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data && data.rates && data.rates.RUB) setRubRate(data.rates.RUB);
    } catch (e) {}
  };

  const fetchPrices = useCallback(async (force = false) => {
    if (!force && Date.now() - lastPriceFetchRef.current < 30000) return;
    try {
      const currentAssets = activeWallet.assets;
      if (!currentAssets || currentAssets.length === 0) return;
      const cgIds = currentAssets.map(a => CG_ID_MAP[a.id] || a.id).join(',');
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgIds}&vs_currencies=usd&include_24hr_change=true`);
      if (!response.ok) return;
      const data = await response.json();
      lastPriceFetchRef.current = Date.now();
      setWallets(prev => prev.map(wallet => {
        if (wallet.id !== activeWalletId) return wallet;
        return {
          ...wallet,
          assets: wallet.assets.map(asset => {
            const cgId = CG_ID_MAP[asset.id] || asset.id;
            if (data[cgId]) {
              return {
                ...asset,
                priceUsd: data[cgId].usd,
                change24h: data[cgId].usd_24h_change || asset.change24h
              };
            }
            return asset;
          })
        };
      }));
    } catch (error) {}
  }, [activeWallet.assets, activeWalletId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchPrices(true), fetchRubRate()]);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchPrices();
    fetchRubRate();
    const interval = setInterval(() => { fetchPrices(); fetchRubRate(); }, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  useEffect(() => {
    localStorage.setItem('demo_wallets', JSON.stringify(wallets));
    localStorage.setItem('demo_active_wallet_id', activeWalletId);
    localStorage.setItem('demo_wallet_lang', language);
    localStorage.setItem('demo_wallet_theme', theme);
    localStorage.setItem('demo_wallet_currency', currency);
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [wallets, activeWalletId, language, theme, currency]);

  const formatPrice = useCallback((usdAmount: number) => {
    const amount = currency === 'USD' ? usdAmount : usdAmount * rubRate;
    const symbol = currency === 'USD' ? '$' : '₽';
    const digits = amount < 1 ? 4 : 2;
    return `${amount.toLocaleString('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${symbol}`;
  }, [currency, rubRate]);

  const totalBalance = useMemo(() => {
    if (!activeWallet || !activeWallet.assets) return 0;
    return activeWallet.assets.reduce((acc, asset) => acc + (asset.balance * asset.priceUsd), 0);
  }, [activeWallet]);

  const navigateTo = (view: View, assetId: string | null = null) => {
    if (assetId) setSelectedAssetId(assetId);
    setActiveView(view);
  };

  const handleAddTransaction = (tx: Transaction, toWalletId?: string) => {
    const hash = `0x${Math.random().toString(16).slice(2, 12)}${Math.random().toString(16).slice(2, 12)}...`;
    const fullTx: Transaction = {
      ...tx,
      hash,
      networkFee: '0.85 USD'
    };

    setWallets(prev => prev.map(w => {
      // Logic for the SENDER wallet (active)
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
        return { ...w, assets: updatedAssets, transactions: [fullTx, ...(w.transactions || [])] };
      }
      
      // Logic for the RECEIVER wallet (internal transfer)
      if (toWalletId && w.id === toWalletId && tx.type === 'send') {
        const updatedAssets = w.assets.map(a => {
          if (a.id === tx.assetId) {
            return { ...a, balance: a.balance + tx.amount };
          }
          return a;
        });
        const receivedTx: Transaction = {
          ...fullTx,
          type: 'receive',
          address: activeWallet.name // Show sender wallet name as origin
        };
        return { ...w, assets: updatedAssets, transactions: [receivedTx, ...(w.transactions || [])] };
      }
      
      return w;
    }));
  };

  const handleCreateWallet = () => {
    const newId = `wallet-${Date.now()}`;
    const newWallet: Wallet = {
      id: newId,
      name: language === 'ru' ? `Кошелек ${wallets.length + 1}` : `Wallet ${wallets.length + 1}`,
      assets: INITIAL_ASSETS.map(asset => ({ ...asset, balance: 0 })),
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

  const handleRenameWallet = (id: string, newName: string) => {
    if (!newName.trim()) return;
    setWallets(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));
  };

  const handleReset = () => {
    setWallets(prev => prev.map(w => {
      if (w.id === activeWalletId) {
        return {
          ...w,
          assets: w.assets.map(a => ({ ...a, balance: 0 })),
          transactions: []
        };
      }
      return w;
    }));
  };

  const handleBuyToken = (tokenData: any, usdtAmount: number) => {
    const usdtAsset = activeWallet.assets.find(a => a.id === 'usdt-tron');
    if (!usdtAsset || usdtAsset.balance < usdtAmount) {
      alert(language === 'ru' ? 'Недостаточно USDT!' : 'Insufficient USDT!');
      return;
    }
    const tokenAmount = usdtAmount / tokenData.current_price;
    const existingAsset = activeWallet.assets.find(a => a.id === tokenData.id);
    setWallets(prev => prev.map(w => {
      if (w.id === activeWalletId) {
        let newAssets = w.assets.map(a => {
          if (a.id === 'usdt-tron') return { ...a, balance: a.balance - usdtAmount };
          if (a.id === tokenData.id) return { ...a, balance: a.balance + tokenAmount };
          return a;
        });
        if (!existingAsset) {
          const newAsset: Asset = {
            id: tokenData.id,
            name: tokenData.name,
            symbol: tokenData.symbol.toUpperCase(),
            network: 'Mainnet',
            balance: tokenAmount,
            priceUsd: tokenData.current_price,
            change24h: tokenData.price_change_percentage_24h,
            icon: tokenData.symbol.toUpperCase(),
            logoUrl: tokenData.image,
            color: '#3262F1'
          };
          newAssets.push(newAsset);
        }
        const tx: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          assetId: 'usdt-tron',
          toAssetId: tokenData.id,
          type: 'swap',
          amount: usdtAmount,
          toAmount: tokenAmount,
          timestamp: Date.now(),
          status: 'confirmed',
          hash: `0x${Math.random().toString(16).slice(2, 10)}...`
        };
        return { ...w, assets: newAssets, transactions: [tx, ...(w.transactions || [])] };
      }
      return w;
    }));
  };

  const renderView = () => {
    if (!activeWallet) return <div className="h-full bg-white dark:bg-dark-bg" />;
    switch (activeView) {
      case 'wallet':
        return <WalletDashboard assets={sortedAssets} totalBalance={totalBalance} walletName={activeWallet.name} sortOrder={sortOrder} onSortChange={setSortOrder} t={t} isRefreshing={isRefreshing} onRefresh={handleRefresh} formatPrice={formatPrice} onAction={(view, assetId) => navigateTo(view, assetId)} />;
      case 'asset-detail':
        const selectedAsset = activeWallet.assets.find(a => a.id === selectedAssetId);
        return <AssetDetailView asset={selectedAsset} transactions={activeWallet.transactions.filter(tx => tx.assetId === selectedAssetId || tx.toAssetId === selectedAssetId)} onBack={() => navigateTo('wallet')} onAction={(view) => navigateTo(view, selectedAssetId)} t={t} formatPrice={formatPrice} language={language} allAssets={activeWallet.assets} />;
      case 'send':
        return <SendView assets={activeWallet.assets} wallets={wallets.filter(w => w.id !== activeWalletId)} initialAssetId={selectedAssetId} onBack={() => navigateTo('wallet')} onSend={handleAddTransaction} t={t} walletName={activeWallet.name} language={language} />;
      case 'receive':
        return <ReceiveView assets={activeWallet.assets} initialAssetId={selectedAssetId} onBack={() => navigateTo('wallet')} onSimulateReceive={handleAddTransaction} t={t} />;
      case 'top-up':
        return <TopUpView assets={activeWallet.assets} onBack={() => navigateTo('wallet')} onUpdate={(id, bal) => setWallets(prev => prev.map(w => w.id === activeWalletId ? {...w, assets: w.assets.map(a => a.id === id ? {...a, balance: bal} : a)} : w))} language={language} />;
      case 'swap':
        return <SwapView assets={activeWallet.assets} initialAssetId={selectedAssetId} onBack={() => { setSelectedAssetId(null); navigateTo('wallet'); }} onSwap={handleAddTransaction} t={t} language={language} formatPrice={formatPrice} />;
      case 'history':
        return <HistoryView transactions={activeWallet.transactions} assets={activeWallet.assets} onBack={() => navigateTo('wallet')} t={t} formatPrice={formatPrice} language={language} />;
      case 'settings':
        return <SettingsView onBack={() => navigateTo('wallet')} language={language} onLanguageChange={setLanguage} theme={theme} onThemeChange={setTheme} currency={currency} onCurrencyChange={setCurrency} onReset={handleReset} t={t} />;
      case 'discover':
        return <DiscoverView onBuy={handleBuyToken} usdtBalance={activeWallet.assets.find(a => a.id === 'usdt-tron')?.balance || 0} language={language} />;
      case 'wallet-manager':
        return <WalletManagerView wallets={wallets} activeWalletId={activeWalletId} onSelect={(id) => { setActiveWalletId(id); navigateTo('wallet'); }} onCreate={handleCreateWallet} onDelete={handleDeleteWallet} onRename={handleRenameWallet} onClose={() => navigateTo('wallet')} t={t} language={language} />;
      default:
        return <div className="p-10 text-center text-zinc-500">В разработке</div>;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row h-[100dvh] w-full transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a0a0b]' : 'bg-white'}`}>
      {isLocked && (
        <LockScreen onUnlock={() => setIsLocked(false)} theme={theme} language={language} />
      )}
      
      <div className="hidden md:flex">
        <Sidebar activeView={activeView} onViewChange={(v) => navigateTo(v)} t={t} theme={theme} />
      </div>

      <div className="flex-1 flex justify-center h-full relative overflow-hidden">
        <div className="w-full h-full flex flex-col relative">
            <main className="flex-1 overflow-y-auto ios-scroll no-scrollbar relative">
                <div key={activeView} className="h-full w-full absolute inset-0 overflow-hidden view-transition-enter">
                    {renderView()}
                </div>
            </main>
            
            <div className="md:hidden">
                {['wallet', 'swap', 'discover', 'settings'].includes(activeView) && (
                <BottomNav activeView={activeView} onViewChange={(view) => navigateTo(view)} t={t} />
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
