export enum Side {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum positionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export interface ResponseDataWebsocket {
  r: string;
  T: number;
  E: number;
  s: string;
  p: string;
}
export enum TimeInForce {
  GTC = 'GTC',
  IOC = 'IOC',
  FOK = 'FOK',
}
export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
}

export interface OrderCreated {
  orderId: number;
  symbol: string;
  status: string;
  clientOrderId: string;
  price: string;
  avgPrice: string;
  origQty: string;
  executedQty: string;
  cumQty: string;
  cumQuote: string;
  timeInForce: string;
  type: string;
  reduceOnly: false;
  closePosition: false;
  side: string;
  positionSide: string;
  stopPrice: string;
  workingType: string;
  priceProtect: false;
  origType: string;
  priceMatch: string;
  selfTradePreventionMode: string;
  goodTillDate: number;
  updateTime: number;
}
