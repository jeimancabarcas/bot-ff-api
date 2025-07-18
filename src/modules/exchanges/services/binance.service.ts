import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  BinanceAdv,
  BinanceP2PResponse,
} from '../interfaces/binance.types.interface';

import {
  ExchangeConnectionException,
  InvalidOrderDataException,
  ExchangeException,
} from '../../../exceptions/exchange.exceptions';
import { EXCHANGES_CONFIG } from 'src/config/exchanges.config';

@Injectable()
export class BinanceService {
  private readonly logger = new Logger(BinanceService.name);
  private readonly binance: AxiosInstance;
  private lastRequestTime = 0;
  private readonly rateLimitDelay = 50; // 50ms between requests

  constructor() {
    this.binance = axios.create({
      baseURL: EXCHANGES_CONFIG.binance.baseUrlp2p,
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
      },
    });
  }

  async getP2POBinanceOffers(
    asset: string,
    rows: number,
    fiat: string,
  ): Promise<BinanceAdv[] | undefined> {
    try {
      await this.respectRateLimit();
      const tradeType = ['BUY', 'SELL'];
      const dataMark: BinanceAdv[] = [];
      for (let i = 0; i < tradeType.length; i++) {
        const response = await this.binance.post<BinanceP2PResponse>(
          'bapi/c2c/v2/friendly/c2c/adv/search',
          {
            page: 1,
            rows: rows,
            payTypes: [],
            asset,
            tradeType: tradeType[i],
            fiat,
            publisherType: null,
          },
        );
        const info = response.data;

        if (info.code !== '000000') {
          throw new ExchangeException(
            'Binance: not dates in the response',
            info.msg as string,
            info.code,
            response.status,
          );
        }

        if (!info.data || info.data.length === 0) {
          throw new InvalidOrderDataException(
            'Binance',
            'No se encontraron ofertas de P2P Binance',
          );
        }

        const { data } = info;
        for (let i = 0; i < data.length; i++) {
          const offers: BinanceAdv = {
            advNo: data[i].advNo,
            fiatUnit: data[i].fiatUnit,
            asset: data[i].asset,
            price: data[i].price,
            tradeType: data[i].tradeType,
            minSingleTransAmount: data[i].minSingleTransAmount,
            maxSingleTransAmount: data[i].maxSingleTransAmount,
            commissionRate: `${parseFloat(data[i].commissionRate).toFixed(4)}%`,
          };

          dataMark.push(offers);
        }
      }

      return dataMark;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new ExchangeConnectionException('Binance: ', error);
      }
    }
  }

  private async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest),
      );
    }

    this.lastRequestTime = Date.now();
  }
}
