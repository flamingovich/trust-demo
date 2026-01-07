
import { Asset } from './types';

export const USER_ADDRESSES = {
  bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  evm: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  tron: 'TWs9Uo232Yx6yF13o57v3q8mD9nUo3vW2v'
};

// Карта соответствия наших ID и ID в CoinGecko
export const CG_ID_MAP: Record<string, string> = {
  'bitcoin': 'bitcoin',
  'eth': 'ethereum',
  'tron': 'tron',
  'usdt-tron': 'tether',
  'solana': 'solana',
  'binancecoin': 'binancecoin',
  'ripple': 'ripple',
  'dogecoin': 'dogecoin',
  'cardano': 'cardano',
  'lighter': 'lighter',
  'layerzero': 'layerzero'
};

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'usdt-tron',
    name: 'USDT',
    symbol: 'USDT',
    network: 'Tron',
    networkIcon: 'https://cryptologos.cc/logos/tron-trx-logo.png',
    balance: 1170.2439,
    priceUsd: 1.00,
    change24h: 0.01,
    icon: '₮',
    logoUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    color: '#26A17B'
  },
  {
    id: 'tron',
    name: 'TRON',
    symbol: 'TRX',
    network: 'Tron',
    balance: 5420.50,
    priceUsd: 0.12,
    change24h: 1.25,
    icon: 'TRX',
    logoUrl: 'https://cryptologos.cc/logos/tron-trx-logo.png',
    color: '#EF0027'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'ERC20',
    balance: 0.452,
    priceUsd: 3240.15,
    change24h: -0.44,
    icon: 'Ξ',
    logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    color: '#627EEA'
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin',
    balance: 0.0842,
    priceUsd: 64230.50,
    change24h: 2.15,
    icon: '₿',
    logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    color: '#F7931A'
  }
];

// Резервный список ТОП-токенов, если API CoinGecko не отвечает
export const FALLBACK_MARKET_DATA = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 64230.50, price_change_percentage_24h: 2.15, image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 3240.15, price_change_percentage_24h: -0.44, image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { id: 'solana', name: 'Solana', symbol: 'sol', current_price: 145.20, price_change_percentage_24h: 5.12, image: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
  { id: 'binancecoin', name: 'BNB', symbol: 'bnb', current_price: 580.40, price_change_percentage_24h: 1.20, image: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
  { id: 'ripple', name: 'XRP', symbol: 'xrp', current_price: 0.62, price_change_percentage_24h: -1.15, image: 'https://cryptologos.cc/logos/xrp-xrp-logo.png' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'doge', current_price: 0.16, price_change_percentage_24h: 12.45, image: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png' },
  { id: 'cardano', name: 'Cardano', symbol: 'ada', current_price: 0.45, price_change_percentage_24h: 0.50, image: 'https://cryptologos.cc/logos/cardano-ada-logo.png' },
  { id: 'tron', name: 'TRON', symbol: 'trx', current_price: 0.12, price_change_percentage_24h: 1.25, image: 'https://cryptologos.cc/logos/tron-trx-logo.png' },
  { id: 'lighter', name: 'Lighter', symbol: 'lit', current_price: 0.054, price_change_percentage_24h: -2.3, image: 'https://assets.coingecko.com/coins/images/36224/standard/lighter.png' },
  { id: 'layerzero', name: 'LayerZero', symbol: 'zro', current_price: 3.84, price_change_percentage_24h: 4.15, image: 'https://assets.coingecko.com/coins/images/38914/standard/zro.png' }
];
