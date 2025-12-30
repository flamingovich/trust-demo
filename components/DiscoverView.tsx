
import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, ChevronRight, TrendingUp, ShoppingBag, Loader2, AlertCircle, Sparkles, Filter } from 'lucide-react';
import { FALLBACK_MARKET_DATA } from '../constants';

interface Props {
  onBuy: (token: any, usdtAmount: number) => void;
  usdtBalance: number;
  language: 'ru' | 'en';
}

const DiscoverView: React.FC<Props> = ({ onBuy, usdtBalance, language }) => {
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedToken, setSelectedToken] = useState<any | null>(null);
  const [buyAmount, setBuyAmount] = useState('100');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    const fetchTopTokens = async () => {
      if (Date.now() - lastFetchRef.current < 15000 && tokens.length > 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
        
        if (!res.ok) {
          if (res.status === 429 && tokens.length > 0) {
             setIsLoading(false);
             return;
          }
          throw new Error('API Rate Limit');
        }
        
        const data = await res.json();
        if (Array.isArray(data)) {
          setTokens(data);
          setHasError(false);
          lastFetchRef.current = Date.now();
        }
      } catch (e) {
        if (tokens.length === 0) {
          setTokens(FALLBACK_MARKET_DATA);
          setHasError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopTokens();
  }, []);

  const categories = ['All', 'L1', 'DeFi', 'Meme', 'AI', 'Gaming'];

  const filteredTokens = tokens.filter(t => 
    (t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.symbol.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-bg text-black dark:text-zinc-100 animate-fade-in overflow-hidden">
      <div className="px-5 pt-8 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-5">
            <h1 className="text-[28px] font-black tracking-tighter">
                {language === 'ru' ? 'Маркет' : 'Market'}
            </h1>
            <div className="bg-blue-600/5 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/10">
                Live Data
            </div>
        </div>
        
        <div className="relative mb-4 flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={language === 'ru' ? 'Поиск...' : 'Search Top 100...'} 
                className="w-full bg-zinc-50 dark:bg-dark-surface border border-zinc-100 dark:border-dark-border rounded-2xl py-2.5 pl-11 pr-4 text-[13px] font-bold focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <button className="p-2.5 bg-zinc-50 dark:bg-dark-surface border border-zinc-100 dark:border-dark-border rounded-2xl text-zinc-400">
            <Filter size={18} />
          </button>
        </div>

        {/* Categories Pills */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${activeCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-zinc-50 dark:bg-dark-surface text-zinc-400 border-zinc-100 dark:border-dark-border'}`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Loader2 className="animate-spin mb-4" size={24} />
          </div>
        ) : (
          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between items-center mb-3 px-1">
              <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                {language === 'ru' ? 'Лидеры роста' : 'Market Cap Rank'}
              </h2>
            </div>
            
            {filteredTokens.map((token, i) => (
              <div 
                key={token.id} 
                onClick={() => setSelectedToken(token)}
                className="flex items-center justify-between p-3.5 bg-white dark:bg-dark-surface/30 rounded-2xl border border-zinc-100 dark:border-dark-border/50 hover:bg-zinc-50 transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-[10px] font-bold text-zinc-300 w-4">{i + 1}</span>
                  <div className="w-9 h-9 rounded-xl bg-zinc-50 dark:bg-dark-surface flex items-center justify-center p-1.5 border border-zinc-100 dark:border-dark-border/50 shadow-sm">
                    <img src={token.image} className="w-full h-full object-contain" alt="" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[14px] leading-none uppercase">{token.symbol}</h3>
                    <p className="text-[10px] text-zinc-400 font-bold tracking-tight mt-1">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[14px] tracking-tight">
                    ${token.current_price.toLocaleString()}
                  </p>
                  <p className={`text-[10px] font-black mt-0.5 ${token.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {token.price_change_percentage_24h >= 0 ? '+' : ''}{token.price_change_percentage_24h?.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedToken && (
        <div className="absolute inset-0 z-[120] flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedToken(null)}></div>
          <div className="w-full max-w-[440px] bg-white dark:bg-dark-surface rounded-t-[40px] p-8 pb-10 relative animate-ios-bottom-up shadow-2xl">
            <div className="w-10 h-1 bg-zinc-200 dark:bg-dark-elevated rounded-full mx-auto mb-6"></div>
            
            <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-[20px] bg-zinc-50 dark:bg-dark-elevated flex items-center justify-center p-3 mb-4 border border-zinc-100 dark:border-dark-border">
                    <img src={selectedToken.image} className="w-full h-full object-contain" alt="" />
                </div>
                <h3 className="text-2xl font-black tracking-tight">{language === 'ru' ? 'Купить' : 'Buy'} {selectedToken.name}</h3>
                <p className="text-zinc-400 font-bold text-xs mt-1 uppercase tracking-widest">
                    Available: {usdtBalance.toFixed(2)} USDT
                </p>
            </div>

            <div className="space-y-4">
                <div className="bg-zinc-50 dark:bg-dark-bg p-5 rounded-3xl border border-zinc-100 dark:border-dark-border">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-400 text-[9px] font-black uppercase tracking-widest">{language === 'ru' ? 'Сумма покупки' : 'Amount to spend'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <input 
                            type="number"
                            value={buyAmount}
                            onChange={(e) => setBuyAmount(e.target.value)}
                            className="bg-transparent text-3xl font-black w-full focus:outline-none tracking-tighter"
                        />
                        <span className="text-lg font-black text-zinc-400">USDT</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-dark-border flex justify-between items-center">
                         <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-tight">{language === 'ru' ? 'Вы получите' : 'Estimated receive'}</span>
                         <span className="text-emerald-500 font-black text-[12px]">
                            {(parseFloat(buyAmount) / selectedToken.current_price).toFixed(6)} {selectedToken.symbol.toUpperCase()}
                         </span>
                    </div>
                </div>

                <button 
                    onClick={() => {
                        onBuy(selectedToken, parseFloat(buyAmount));
                        setSelectedToken(null);
                    }}
                    className="w-full py-4.5 bg-blue-600 text-white rounded-[24px] font-black text-base shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center space-x-3"
                >
                    <ShoppingBag size={18} />
                    <span className="uppercase tracking-widest">Confirm Order</span>
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverView;
