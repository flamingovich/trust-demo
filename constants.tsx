
import { Asset } from './types';

export const USER_ADDRESSES = {
  bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  evm: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  tron: 'TWs9Uo232Yx6yF13o57v3q8mD9nUo3vW2v'
};

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'usdt-tron',
    name: 'USDT',
    symbol: 'USDT',
    network: 'TRC20',
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
    network: 'Mainnet',
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
