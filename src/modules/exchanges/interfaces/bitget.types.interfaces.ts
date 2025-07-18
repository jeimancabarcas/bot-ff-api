export interface IOrderBook {
  symbol: string;
  bids: [string, string][];
  asks: [string, string][];
  timestamp: number;
}

export interface ITicker {
  symbol: string;
  price: string;
  volume: string;
  change24h: string;
  timestamp: number;
}

export interface IBalance {
  asset: string;
  free: string;
  locked: string;
  total: string;
}

export interface IOrder {
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: string;
  price: string;
  status: string;
  timestamp: number;
  clientOrderId?: string;
}

export interface ITradeLimit {
  minQty: string;
  minNotional: string;
  maxQty?: string;
  stepSize?: string;
  tickSize?: string;
}

export interface IBestPrices {
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadPercent: number;
}

export interface IExchangeInfo {
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  tradingFee: number;
  withdrawalFee?: { [asset: string]: string };
}

export interface IArbitrageOpportunity {
  symbol: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  profitPercent: number;
  volume: number;
  timestamp: number;
}

export interface IP2POrder {
  id: string;
  advertiser: string;
  asset: string;
  fiatCurrency: string; // antes “fiat”
  tradeType: 'buy' | 'sell';
  price: number;
  amount: number; // o “availableAmount”
  availableAmount: number; // si quieres ambos
  minAmount: number;
  maxAmount: number;
  paymentMethods: string[];
  completionRate: number; // aprovéchalo para tipar en number
  orderCount: number;
  avgResponseTime: number;
  isOnline: boolean;
  timestamp: number;
}

export interface IP2POrdersParams {
  asset?: string;
  fiatCurrency?: string;
  side?: 'buy' | 'sell';
  paymentMethod?: string;
  page?: number;
  size?: number;
}

export interface IExchangeService {
  getName(): string;
  getP2POrders(
    asset: string,
    fiat: string,
    tradeType: 'buy' | 'sell',
  ): Promise<IP2POrder[]>;
  isRateLimited(): boolean;
}

export interface BitgetProduct {
  symbol: string;
  status: string;
  // ...otros campos, si los necesitas
}

export interface BitgetProductsResponse {
  code: string;
  msg: string;
  data: BitgetProduct[];
}

export interface BitgetDepthData {
  asks: [string, string][];
  bids: [string, string][];
  ts: string;
}

export interface BitgetDepthResponse {
  code: string;
  msg: string;
  data: BitgetDepthData;
}

export interface BitgetTickerData {
  close: string; // precio último
  baseVol: string; // volumen
  change24h: string; // variación 24
  ts: string; // timestamp en string
}
export interface BitgetTickerRaw {
  symbol: string;
  close: string;
  baseVol: string;
  change24h: string;
  ts: string;
}

export interface BitgetBalanceRaw {
  coinName: string; // “BTC”, “USDT”, etc.
  available: string; // cantidades en string
  frozen: string;
}

export interface BitgetOrderCreated {
  orderId: string;
  // Bitget devuelve más campos (clientOid, etc.) si los necesitas añádelos aquí
}

// Envoltura reutilizable (ya usada en métodos anteriores)
export interface BitgetEnvelope<T = unknown> {
  code: string; // '00000' = éxito
  msg: string;
  data: T;
}
export interface BitgetOrderInfoRaw {
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  size: string;
  price: string;
  status: string; // 'init', 'filled', etc.
  createTime: string; // timestamp como string
  clientOid?: string;
}
export interface BitgetOpenOrderRaw {
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  size: string;
  price: string;
  status: string; // 'init', 'filled', ...
  createTime: string; // timestamp string
  clientOid?: string;
}
export interface BitgetOrderRaw {
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  size: string;
  price: string;
  status: string;
  createTime: string;
  clientOid?: string;
}

export interface BitgetProductDetailRaw {
  minTradeAmount: string;
  minTradeUSDT: string;
  maxTradeAmount?: string;
  quantityScale: string; // nº de decimales (p.ej. "4" ⇒ 0.0001)
  priceScale: string; // idem para el precio
}

export interface BitgetP2PMerchantRaw {
  id: string | undefined;
  advertId?: string;
  userId?: string;
  nickName?: string;
  userName?: string;
  coin: string;
  fiat: string;
  side: 'buy' | 'sell';
  price: string;
  minAmount: string;
  maxAmount: string;
  availableAmount: string;
  payTypes?: string; // "Nequi,Bancolombia"
  completionRate?: string;
  orderCount?: string;
  avgResponseTime?: string;
  online?: '0' | '1';
  isOnline?: boolean;
}
