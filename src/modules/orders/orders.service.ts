import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  positionSide,
  ResponseDataWebsocket,
  Side,
} from './interfaces/orders.request.interfaces';
import { PositionSide } from 'binance';
import * as crypto from 'crypto';
import { EXCHANGES_CONFIG } from 'src/config/exchanges.config';
import axios from 'axios';
import * as WebSocket from 'ws';
@Injectable()
export class OrdersService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly logger: Logger = new Logger(OrdersService.name);
  private wsMap = new Map<string, WebSocket>();
  constructor(private readonly configService: ConfigService) {
    this.apiKey = configService.getOrThrow('BINANCE_API_KEY');
    this.apiSecret = configService.getOrThrow('BINANCE_API_SECRET');
  }
  async placeOrder(
    symbol: string,
    side: Side,
    positionSide: PositionSide,
    quantity: string,
  ): Promise<void> {
    const timestamp = Date.now();
    const query = timestamp.toString();

    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(query)
      .digest('hex');

    const params = {
      symbol,
      side,
      positionSide,
      type: 'MARKET',
      quantity,
      timestamp,
      signature,
    };

    try {
      await axios.post(
        `${EXCHANGES_CONFIG.binance.baseUrlFapi}${EXCHANGES_CONFIG.binance.endPoints.order}`,
        { params },
        {
          headers: {
            'X-MBX-APIKEY': this.apiKey,
          },
        },
      );
    } catch (error) {
      throw new HttpException(
        `Error Created Order: ${error}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  startWebsocketOrder(symbol: string, quantity: string) {
    if (this.wsMap.has(symbol)) return;

    const ws = new WebSocket(
      `wss://fstream.binance.com/stream?streams=btcusdt@markPrice`,
    );

    ws.on('open', () => {
      this.logger.log(`Websocket connect for: ${symbol}`);
    });

    ws.on('message', (data: ResponseDataWebsocket) => {
      const fundingRate = parseFloat(data.r);
      const fundingTime = data.T;
      const now = Date.now();
      const beforeFunding = fundingTime - now;

      const isPositive = fundingRate > 0;
      const oBefore = beforeFunding - 3000;
      const oAfter = beforeFunding + 3000;

      if (isPositive) {
        if (oBefore > 0) {
          setTimeout(
            () =>
              void this.placeOrder(
                symbol,
                Side.SELL,
                positionSide.SHORT,
                quantity,
              ),
            oBefore,
          );
          this.logger.log(`Order Created ${positionSide.SHORT}`);
        }
      } else {
        setTimeout(() => {
          void this.placeOrder(symbol, Side.BUY, positionSide.LONG, quantity);
          this.logger.log(`Order Created ${positionSide.LONG}`);
        }, oAfter);
      }
    });

    ws.on('close', () => {
      this.logger.log(`Websocket close for ${symbol}`);
      this.wsMap.delete(symbol);
    });

    ws.on('error', (err) => {
      this.logger.log(`Error en WebSocket para ${symbol}`, err.message);
    });

    this.wsMap.set(symbol, ws);
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
}
