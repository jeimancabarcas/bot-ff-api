import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { EXCHANGES_CONFIG } from 'src/config/exchanges.config';
import { ExchangeConnectionException } from 'src/exceptions/exchange.exceptions';
import {
  OrderBookDtoResponse,
  OrderBookResponseBinance,
  OrdersBookBids,
  OrdersBookAsk,
} from '../exchanges/interfaces/binance.types.interface';

@Injectable()
export class OrderbookService {
  async getOrderBookBinance(
    symbol: string,
    limit: number,
  ): Promise<OrderBookDtoResponse> {
    try {
      symbol = symbol.toUpperCase();
      const response = await axios.get<OrderBookResponseBinance>(
        `${EXCHANGES_CONFIG.binance.baseUrlFapi}/${EXCHANGES_CONFIG.binance.endPoints.orderBook}`,
        {
          params: { symbol, limit },
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/json',
          },
        },
      );
      if (!response.data || !response.data.bids || !response.data.asks) {
        throw new ExchangeConnectionException(
          `No order book data found for symbol: ${symbol}`,
          new Error('Empty response'),
        );
      }
      const data: OrderBookResponseBinance = response.data;

      const bids: OrdersBookBids[] = data.bids.map((bid) => ({
        USDTprice: Number(bid[0]),
        BTCquantity: Number(bid[1]),
      }));

      const asks: OrdersBookAsk[] = data.asks.map((ask) => ({
        USDTprice: Number(ask[0]),
        BTCquantity: Number(ask[1]),
      }));

      const orderBookDto: OrderBookDtoResponse = {
        lastUpdateId: data.lastUpdateId,
        bids,
        asks,
        bestAsksWithoutSlippage: asks[0].USDTprice * asks[0].BTCquantity,
        bestBidsWithoutSlippage: bids[0].USDTprice * bids[0].BTCquantity,
      };

      return orderBookDto;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ExchangeConnectionException(
          'Connection Failure Binance',
          error,
        );
      } else {
        throw new BadRequestException('Ocurrio un error inesperado');
      }
    }
  }
}
