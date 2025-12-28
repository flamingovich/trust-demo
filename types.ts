

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  network: string;
  networkIcon?: string;
  balance: number;
  priceUsd: number;
  change24h: number;
  icon: string;
  logoUrl: string;
  color: string;
}

export interface Transaction {
  id: string;
  assetId: string;
  type: 'send' | 'receive' | 'swap';
  amount: number;
  toAmount?: number;
  toAssetId?: string;
  address?: string;
  timestamp: number;
  status: 'confirmed' | 'pending';
  hash?: string;
  networkFee?: string;
  blockNumber?: number;
}

export interface Wallet {
  id: string;
  name: string;
  assets: Asset[];
}

export type SortOrder = 'default' | 'asc' | 'desc';
export type Language = 'en' | 'ru';
export type Theme = 'light' | 'dark';

// Fix: Added 'rewards' and 'more' to the View union to allow safe comparison in BottomNav.tsx
export type View = 'wallet' | 'swap' | 'discover' | 'settings' | 'send' | 'receive' | 'top-up' | 'history' | 'asset-detail' | 'wallet-manager' | 'rewards' | 'more';
