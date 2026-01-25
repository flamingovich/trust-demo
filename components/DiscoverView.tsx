
import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, ChevronRight, TrendingUp, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
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
  
  // Используем ref для отслеживания последнего успешного обновления, чтобы не показывать ошибку при временных лимитах API
  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    const fetchTopTokens = async () => {
      // Если обновляли недавно (меньше 15 секунд назад), не мучаем API
      if (Date.now() - lastFetchRef.current < 15000 && tokens.length > 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Запрашиваем ТОП-100 и отдельно LIT и ZRO
        const [resTop, resExtra] = await Promise.all([
          fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'),
          fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=lighter,layerzero&vs_currency=usd&order=market_cap_desc&sparkline=false')
        ]);
        
        if (!resTop.ok) {
          if (resTop.status === 429 && tokens.length > 0) {
             setIsLoading(false);
             return;
          }
          throw new Error('API Rate Limit or Network Error');
        }
        
        const dataTop = await resTop.json();
        const dataExtra = resExtra.ok ? await resExtra.json() : [];

        if (Array.isArray(dataTop)) {
          // Объединяем, исключая дубликаты (если LIT/ZRO вдруг попали в топ-100)
          // Затем строго пушим их в конец списка для 101 и 102 позиций
          const combined = dataTop.filter(t => t.id !== 'lighter' && t.id !== 'layerzero');
          
          if (Array.isArray(dataExtra)) {
            const lit = dataExtra.find(t => t.id === 'lighter');
            const zro = dataExtra.find(t => t.id === 'layerzero');
            if (lit) combined.push(lit);
            if (zro) combined.push(zro);
          }
          
          setTokens(combined);
          setHasError(false);
          lastFetchRef.current = Date.now();
        } else {
          throw new Error('Invalid data format');
        }
      } catch (e) {
        if (tokens.length === 0) {
          console.warn('Failed to fetch tokens, using fallback data', e);
          setTokens(FALLBACK_MARKET_DATA);
          setHasError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopTokens();
  }, []);

  const filteredTokens = tokens.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-bg text-black dark:text-zinc-100 animate-fade-in overflow-hidden">
      <div className="px-6 pt-12 pb-4 shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6">
          {language === 'ru' ? 'Маркет' : 'Market'}
        </h1>
        
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'ru' ? 'Поиск токенов...' : 'Search Top 100...'} 
            className="w-full bg-zinc-100 dark:bg-dark-surface border border-transparent dark:border-dark-border rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {hasError && !isLoading && (
          <div className="flex items-center space-x-2 text-orange-500 bg-orange-500/5 p-3 rounded-xl border border-orange-500/10 mb-4 animate-fade-in">
            <AlertCircle size={14} />
            <p className="text-[11px] font-bold uppercase tracking-wider">
              {language === 'ru' ? 'Используются архивные цены' : 'Using offline prices'}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="font-bold text-sm">Загрузка ТОП-100...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-4 px-1">
              <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                {language === 'ru' ? 'Популярные активы' : 'Trending Assets'}
              </h2>
              <TrendingUp size={14} className="text-zinc-400" />
            </div>
            
            {filteredTokens.map((token, index) => (
              <div 
                key={token.id} 
                onClick={() => setSelectedToken(token)}
                className="flex items-center justify-between p-4 bg-zinc-50/50 dark:bg-dark-surface/30 rounded-3xl border border-transparent hover:border-zinc-200 dark:hover:border-dark-border transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-[42px] h-[42px] rounded-full bg-zinc-50 dark:bg-dark-surface flex items-center justify-center shadow-sm border border-zinc-100 dark:border-dark-border/50">
                    <img 
                      src={token.image} 
                      className="w-7 h-7 object-contain rounded-[22%]" 
                      alt="" 
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] leading-tight">{token.name}</h3>
                    <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">{token.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[15px] tracking-tight">
                    ${token.current_price.toLocaleString()}
                  </p>
                  <p className={`text-[11px] font-bold ${token.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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
          <div className="absolute inset-0 bg-black/60 glass-panel" onClick={() => setSelectedToken(null)}></div>
          <div className="w-full bg-white dark:bg-dark-surface rounded-t-[44px] p-8 pb-12 relative animate-ios-bottom-up shadow-2xl">
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-dark-elevated rounded-full mx-auto mb-8"></div>
            
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-dark-elevated flex items-center justify-center p-0 mb-4 shadow-sm border border-zinc-100 dark:border-dark-border">
                    <img 
                      src={selectedToken.image} 
                      className="w-12 h-12 object-contain rounded-[22%]" 
                      alt="" 
                    />
                </div>
                <h3 className="text-2xl font-extrabold">{language === 'ru' ? 'Купить' : 'Buy'} {selectedToken.name}</h3>
                <p className="text-zinc-500 font-bold text-sm mt-1">
                    {language === 'ru' ? 'Оплата через USDT (TRC20)' : 'Pay with USDT (TRC20)'}
                </p>
            </div>

            <div className="space-y-6">
                <div className="bg-zinc-50 dark:bg-dark-bg p-6 rounded-[32px] border border-zinc-100 dark:border-dark-border">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{language === 'ru' ? 'Сумма покупки' : 'Amount to spend'}</span>
                        <span className="text-blue-500 text-[10px] font-bold">Bal: {usdtBalance.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <input 
                            type="number"
                            value={buyAmount}
                            onChange={(e) => setBuyAmount(e.target.value)}
                            className="bg-transparent text-3xl font-extrabold w-full focus:outline-none"
                        />
                        <span className="text-xl font-bold text-zinc-400">USDT</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-dark-border flex justify-between">
                         <span className="text-zinc-400 text-[11px] font-bold">{language === 'ru' ? 'Вы получите примерно' : 'You will receive approx.'}</span>
                         <span className="text-green-500 font-bold text-[11px]">
                            {(parseFloat(buyAmount) / selectedToken.current_price).toFixed(6)} {selectedToken.symbol.toUpperCase()}
                         </span>
                    </div>
                </div>

                <button 
                    onClick={() => {
                        onBuy(selectedToken, parseFloat(buyAmount));
                        setSelectedToken(null);
                    }}
                    className="w-full py-5 bg-blue-600 text-white rounded-[26px] font-bold text-lg shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center space-x-3"
                >
                    <ShoppingBag size={20} />
                    <span>{language === 'ru' ? 'Подтвердить покупку' : 'Confirm Purchase'}</span>
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverView;
