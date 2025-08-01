import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import axios from 'axios';
import { EXCHANGES_CONFIG } from 'src/config/exchanges.config';
import { ExchangeConnectionException } from 'src/exceptions/exchange.exceptions';
import {
  OrderBookDtoResponse,
  OrderBookResponseBinance,
  OrdersBookBids,
  OrdersBookAsk,
} from '../exchanges/interfaces/binance.types.interface';
import { CategoryV5, GetOrderbookParamsV5, RestClientV5 } from 'bybit-api';
import { OrderBookResponse } from './interfaces/bybit.interfaces';
import { RestClientV2 } from 'bitget-api';
import { OrderBookResponsBitget } from './interfaces/bitget.interfaces';

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

  async getOrderBookBybit(
    category: CategoryV5,
    symbol: string,
    limit: number,
  ): Promise<OrderBookResponse> {
    const client = new RestClientV5();
    const params: GetOrderbookParamsV5 = {
      category,
      symbol,
      limit,
    };
    try {
      const res = await client.getOrderbook(params);
      if (!res.result || res.retCode === 400) {
        throw new HttpException(
          `OrderBook not found: ${res.retMsg}`,
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        symbol: res.result.s,
        bids: res.result.b.map((b) => [
          `USDTprice ${b[0]}`,
          `BTCquantity${b[1]}`,
        ]),
        ask: res.result.a.map((a) => [
          `USDTprice ${a[0]}`,
          `BTCquantity${a[1]}`,
        ]),
      };
    } catch (error) {
      throw new HttpException(`Error Bybit: ${error}`, HttpStatus.BAD_GATEWAY);
    }
  }

  async getOrderBookBitget(
    symbol: string,
    type?: string,
    limit?: string,
  ): Promise<OrderBookResponsBitget> {
    const client = new RestClientV2();
    const params = {
      symbol,
      type,
      limit,
    };
    try {
      const res = await client.getSpotOrderBookDepth(params);
      if (!res.data || res.code === '400') {
        throw new HttpException(
          `Bitget Not Data: ${res.msg}`,
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        symbol: symbol,
        bids: res.data.bids.map((b) => [
          `USDTprice: ${b[0]}`,
          `BTCquantity: ${b[1]}`,
        ]),
        asks: res.data.asks.map((a) => [
          `USDTprice: ${a[0]}`,
          `BTCquantity: ${a[1]}`,
        ]),
      };
    } catch (error) {
      throw new HttpException(`Bitget Error: ${error}`, HttpStatus.BAD_GATEWAY);
    }
  }
}
