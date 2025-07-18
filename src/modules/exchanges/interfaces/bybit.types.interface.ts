export interface IP2POrder {
  asset: string;
  fiat: string;
  price: number;
  amount: number;
  tradeType: 'BUY' | 'SELL';
}

export interface BybitP2PResponse {
  ret_code: number;
  ret_msg?: string;
  result?: {
    count: number;
    items: BybitRawOrder[];
  };
}

export interface BybitRawOrder {
  id: string;
  tokenId: string;
  currencyId: string;
  price: string;
  lastQuantity: string;
  minAmount: string;
  maxAmount: string;
  side: '1' | '2'; // 1 = BUY, 2 = SELL
  nickName: string;
  payments?: { name: string }[];
  finishRate: string;
  recentExecuteRate: number;
  status: '1' | '0'; // 1 = online
}

export interface BybitServerTimeResponse {
  retCode: number;
  retMsg: string;
  result: {
    timeSecond: string;
    timeNano: string;
  };
  retExtInfo: any;
  time: number;
}

export interface BybitBalanceResponse {
  retCode: number;
  retMsg: string;
  result: {
    spot: {
      [coin: string]: {
        availableBalance: string;
        total: string;
      };
    };
  };
  time: number;
}

export interface IExchangeService {
  getName(): string;
  getP2POrders(
    asset: string,
    fiat: string,
    tradeType: 'BUY' | 'SELL',
  ): Promise<IP2POrder[]>;
  isRateLimited(): boolean;
}

export interface ResponseBybitfundingRate {
  retCode: number;
  retMsg: string;
  result: {
    category: string;
    list: FundingRateItem[];
  };
  retExtInfo: Record<string, any>;
  time: number;
}

export interface FundingRateItem {
  symbol: string;
  fundingRate: string;
  fundingRateTimestamp: number; // Timestamp in milliseconds
}
