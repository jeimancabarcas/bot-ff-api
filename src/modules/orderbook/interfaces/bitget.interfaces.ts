export interface OrderBookResponsBitget {
  symbol: string;
  asks: [string, string][];
  bids: [string, string][];
}
