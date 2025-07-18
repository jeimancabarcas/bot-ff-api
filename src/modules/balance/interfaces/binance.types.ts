export interface FuturesBinanceResponse {
  asset: string;
  walletBalance: string;
  unrealizedProfit: string;
  marginBalance: string;
}

export interface SpotBinanceBalanceResponse {
  balances: SpotBinanceBalance[];
}

export interface SpotBinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface CombinedAssetBalance {
  asset: string;
  spot: SpotBalance | null;
  futures: FuturesBalance | null;
}

export interface CombinedBalanceResponse {
  totalBalance: CombinedAssetBalance[];
}

type SpotBalance = {
  free: string;
  locked: string;
};

type FuturesBalance = {
  walletBalance: string;
  unrealizedProfit: string;
  marginBalance: string;
};

export interface WalletResponseData {
  balances: Wallet[];
}

export interface Wallet {
  activate?: boolean;
  balance?: string;
  walletName?: string;
}
