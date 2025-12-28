
import React from 'react';
import { Search, Globe, ChevronRight } from 'lucide-react';

const DiscoverView: React.FC = () => {
  const dapps = [
    { title: 'Uniswap V3', desc: 'Swap tokens on Ethereum', img: 'https://picsum.photos/seed/uniswap/200/200' },
    { title: 'OpenSea', desc: 'The NFT Marketplace', img: 'https://picsum.photos/seed/opensea/200/200' },
    { title: 'Aave', desc: 'Lend and borrow assets', img: 'https://picsum.photos/seed/aave/200/200' },
  ];

  const news = [
    { title: 'Market Update: Bitcoin hits new milestones', date: '2h ago', img: 'https://picsum.photos/seed/crypto1/400/200' },
    { title: 'Layer 2 adoption grows by 40% this quarter', date: '5h ago', img: 'https://picsum.photos/seed/crypto2/400/200' },
  ];

  return (
    <div className="px-5 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <h1 className="text-3xl font-bold mb-6">Discover</h1>
      
      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
          type="text" 
          placeholder="Search DApps or Enter URL" 
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Top DApps */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Top DApps</h2>
          <button className="text-blue-500 text-sm font-bold flex items-center">
            See All <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-4">
          {dapps.map((dapp, idx) => (
            <div key={idx} className="flex items-center space-x-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-900 active:bg-zinc-800 transition-colors">
              <img src={dapp.img} className="w-12 h-12 rounded-xl object-cover" alt={dapp.title} />
              <div className="flex-1">
                <h3 className="font-bold text-sm">{dapp.title}</h3>
                <p className="text-xs text-zinc-500">{dapp.desc}</p>
              </div>
              <Globe size={18} className="text-zinc-600" />
            </div>
          ))}
        </div>
      </section>

      {/* Featured News */}
      <section>
        <h2 className="text-lg font-bold mb-4">Latest News</h2>
        <div className="space-y-6">
          {news.map((item, idx) => (
            <div key={idx} className="group cursor-pointer">
              <img src={item.img} className="w-full h-44 rounded-3xl object-cover mb-3 grayscale group-hover:grayscale-0 transition-all duration-500" alt={item.title} />
              <h3 className="font-bold text-base group-hover:text-blue-400 transition-colors">{item.title}</h3>
              <p className="text-xs text-zinc-500 font-medium mt-1">{item.date}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DiscoverView;
