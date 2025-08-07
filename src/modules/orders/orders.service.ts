import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  OrderCreated,
  ResponseDataWebsocket,
  Side,
} from './interfaces/orders.request.interfaces';
import * as crypto from 'crypto';
import { EXCHANGES_CONFIG } from 'src/config/exchanges.config';
import axios from 'axios';
import * as WebSocket from 'ws';
@Injectable()
export class OrdersService {
  private orderCreated: any;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly baseUrl: string =
    EXCHANGES_CONFIG.binance.tesnet === true
      ? EXCHANGES_CONFIG.binance.baseUrlFuturesTestnet
      : EXCHANGES_CONFIG.binance.baseUrlFuturesMainnet;
  private readonly logger: Logger = new Logger(OrdersService.name);
  private wsMap = new Map<string, WebSocket>();
  constructor(private readonly configService: ConfigService) {
    if (EXCHANGES_CONFIG.binance.tesnet === true) {
      this.apiKey = this.configService.getOrThrow('BINANCE_API_KEY_TEST');
      this.apiSecret = this.configService.getOrThrow('BINANCE_API_SECRET_TEST');
    } else {
      this.apiKey = this.configService.getOrThrow('BINANCE_API_KEY');
      this.apiSecret = this.configService.getOrThrow('BINANCE_API_SECRET');
    }
  }
  async placeOrder(
    symbol: string,
    side: Side,
    quantity: string,
    type: string,
    price?: string,
    timeInForce?: string,
  ): Promise<OrderCreated> {
    const timestamp = Date.now();
    //const query = timestamp.toString();

    const params: Record<string, any> = {
      symbol,
      side,
      type,
      quantity,
      price,
      timeInForce,
      timestamp,
    };
    if (type === 'LIMIT') {
      if (!price || !timeInForce) {
        throw new HttpException(
          'Price and TimeInForce are required for LIMIT orders',
          HttpStatus.BAD_REQUEST,
        );
      }
      const tickSize = await this.getTickSize(symbol);
      const adjustedPrice = Math.floor(Number(price) / tickSize) * tickSize;
      console.log('Tick Size: ', tickSize);
      console.log('Precio: ', adjustedPrice.toFixed(1).toString());
      //if (Number(price) % tickSize !== 0) {
      //  throw new HttpException(
      //    `Price ${price} is not valid for symbol ${symbol}`,
      //    HttpStatus.BAD_REQUEST,
      //  );
      //}
      params.price = adjustedPrice.toFixed(1).toString();
      params.timeInForce = timeInForce;
    }
    const queryString = new URLSearchParams(params).toString();
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');

    params.signature = signature;
    const body = new URLSearchParams(params);

    try {
      const res = await axios.post<OrderCreated>(
        this.baseUrl,
        body.toString(),
        {
          headers: {
            'X-MBX-APIKEY': this.apiKey,
          },
        },
      );

      if (res.data) {
        this.logger.log(`Order programed in ${res.data.side}`);
      }
      const order: OrderCreated = res.data;
      console.log(order);
      return order;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const binanceError = error.response.data as {
          code: number;
          msg: string;
        };
        throw new HttpException(
          `Error Created Order: ${JSON.stringify(binanceError)}`,
          HttpStatus.BAD_GATEWAY,
        );
      } else {
        throw new HttpException(
          'Unexpected error creating order',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async startWebsocketOrder(
    symbol: string,
    quantity: string,
    type: string,
    timeInForce: string,
  ): Promise<OrderCreated | undefined> {
    if (this.wsMap.has(symbol)) return;
    const wsUrl = EXCHANGES_CONFIG.binance.tesnet
      ? `wss://stream.binancefuture.com/ws/${symbol.toLowerCase()}@markPrice`
      : `wss://fstream.binance.com/stream?streams=${symbol.toLowerCase()}@markPrice`;

    const ws = new WebSocket(wsUrl);
    ws.on('open', () => {
      this.logger.log(`Websocket connect for: ${symbol} to ${ws.url}`);
    });

    ws.on('message', (data: WebSocket.Data) => {
      let raw: string;

      if (typeof data === 'string') {
        raw = data;
      } else if (data instanceof Buffer) {
        raw = data.toString('utf-8');
      } else {
        this.logger.log('Type value not expected:', typeof data);
        return;
      }
      const payload = JSON.parse(raw.toString()) as ResponseDataWebsocket;
      const fundingRate = parseFloat(payload.r);
      const fundingTime = payload.T;
      const now = Date.now();
      const oBefore = 3000; //fundingTime - now;
      const oAfter = fundingTime - now + 3000;
      const isPositive = fundingRate > 0;

      const side = isPositive ? Side.SELL : Side.BUY;

      if (oBefore === 3000) {
        const order = async () => {
          return await this.placeOrder(
            symbol,
            side,
            quantity,
            type,
            payload.p,
            timeInForce,
          );
        };
        this.orderCreated = order();
      }
      if (oAfter === 3000) {
        const order = async () => {
          return await this.placeOrder(
            symbol,
            side,
            quantity,
            type,
            payload.p,
            timeInForce,
          );
        };
        this.orderCreated = order();
      }

      this.logger.log(
        `
        Next Funding Time a las: ${new Date(fundingTime).toLocaleString()}
        Funding Rate: ${(fundingRate * 100).toFixed(4).toString()} %
        StatusFunding: ${fundingRate > 0 ? 'Is positive' : 'Is negative'}
        `,
      );
      ws.close();
    });

    ws.on('close', () => {
      this.logger.log(`Websocket close for ${symbol}`);
      this.wsMap.delete(symbol);
    });

    ws.on('error', (err) => {
      this.logger.log(`Error en WebSocket para ${symbol}`, err.message);
    });

    this.wsMap.set(symbol, ws);

    return (await this.orderCreated) as OrderCreated;
  }

  stopWebSocketOrder(symbol: string) {
    const ws = this.wsMap.get(symbol);
    if (ws) {
      ws.close();
      this.logger.log(`WebSocket terminate for ${symbol}`);
    } else {
      this.logger.log(`Not exist WebSocket active`);
    }
  }

  listActiveSockets(): string[] {
    return [...this.wsMap.keys()];
  }

  async getTickSize(symbol: string) {
    type ExchangeInfo = {
      symbols: Array<{
        symbol: string;
        filters: Array<{ filterType: string; tickSize?: string }>;
      }>;
    };

    const res = await axios.get<ExchangeInfo>(
      'https://testnet.binancefuture.com/fapi/v1/exchangeInfo',
    );

    const symbolInfo = res.data.symbols.find((s) => s.symbol === symbol);
    if (!symbolInfo) {
      throw new HttpException(
        `Symbol ${symbol} not found in exchange info`,
        HttpStatus.NOT_FOUND,
      );
    }
    const priceFilter = symbolInfo.filters.find(
      (f) => f.filterType === 'PRICE_FILTER',
    );
    if (!priceFilter || !priceFilter.tickSize) {
      throw new HttpException(
        `PRICE_FILTER not found for symbol ${symbol}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return parseFloat(priceFilter.tickSize);
  }
}
