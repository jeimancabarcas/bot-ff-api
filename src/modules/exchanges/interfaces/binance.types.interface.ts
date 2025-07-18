export interface BinanceAdv {
  advNo: string;
  fiatUnit: string;
  asset: string;
  price: string;
  tradeType: string;
  minSingleTransAmount: string;
  maxSingleTransAmount: string;
  commissionRate: string;
}

export interface BinanceP2PResponse {
  code: string;
  msg?: string;
  data: BinanceAdv[];
}

export interface FundingFeeTypes {
  symbol: string;
  fundingTime: string;
  fundingRate: string;
}

export interface OrderBookResponseBinance {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
  bestAsksWithoutSlippage: string;
  bestBidsWithoutSlippage: string;
}

export interface OrderBookDtoResponse {
  lastUpdateId: number;
  asks: OrdersBookAsk[];
  bids: OrdersBookBids[];
  bestAsksWithoutSlippage: number;
  bestBidsWithoutSlippage: number;
}

export interface OrdersBookAsk {
  USDTprice: number;
  BTCquantity: number;
}

export interface OrdersBookBids {
  USDTprice: number;
  BTCquantity: number;
}
