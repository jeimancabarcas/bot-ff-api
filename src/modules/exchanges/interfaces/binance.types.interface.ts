export interface BinanceAdv {
  adv: {
    asset: string;
    fiatUnit: string;
    tradeType: string;
    price: string;
    minSingleTransAmount: string;
    maxSingleTransAmount: string;
    commissionRate: string;
  };
}

export interface BinanceP2PResponsePrice {
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

export type TradeType = {
  buy: string;
  sell: string;
};

export type ResponseSpotBinancePrice = {
  symbol: string;
  price: string;
};

export interface ResponseArbitrageIntraExhchanceBinance {
  p2pBuy: string;
  p2pSell: string;
  spotPrice: number;
  spreadPercent: string;
}

export interface ResponseFuturesBinance {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  time: Date;
  lastUpdateId: Date;
}

export interface ResponseArbitrageBinance {
  p2pPrice: string;
  futuresPrice: string;
  profitEstimated: string;
}
