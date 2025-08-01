import { OrderbookLevelV5 } from 'bybit-api';

export interface OrderBookResponse {
  symbol: string;
  bids: OrderbookLevelV5[];
  ask: OrderbookLevelV5[];
}
