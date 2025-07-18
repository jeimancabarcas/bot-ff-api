import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { EXCHANGES_CONFIG } from 'src/config/exchanges.config';
import * as crypto from 'crypto';
import {
  CombinedBalanceResponse,
  FuturesBinanceResponse,
  SpotBinanceBalance,
  SpotBinanceBalanceResponse,
  Wallet,
} from './interfaces/binance.types';
import { ExchangeConnectionException } from 'src/exceptions/exchange.exceptions';
import { RestClientV5, WalletBalanceV5 } from 'bybit-api';
import { RestClientV2 } from 'bitget-api';

@Injectable()
export class BalanceService {
  private readonly binanceSpot: AxiosInstance;
  private readonly binanceFutures: AxiosInstance;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('BINANCE_API_KEY');
    this.apiSecret =
      this.configService.getOrThrow<string>('BINANCE_API_SECRET');
    this.binanceSpot = axios.create({
      baseURL: EXCHANGES_CONFIG.binance.baseUrlBalanceSpot,
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
      },
    });
    this.binanceFutures = axios.create({
      baseURL: EXCHANGES_CONFIG.binance.baseUrlFapi,
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
      },
    });
  }
  private sign(query: string): string {
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(query)
      .digest('hex');
  }

  async getFuturesBalance(): Promise<FuturesBinanceResponse[]> {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = this.sign(queryString);

    try {
      const res = await this.binanceFutures.get<FuturesBinanceResponse[]>(
        EXCHANGES_CONFIG.binance.endPoints.balanceFuture,
        {
          params: {
            timestamp,
            signature,
          },
          headers: {
            'X-MBX-APIKEY': this.apiKey,
          },
        },
      );
      if (!res.data || res.data.length == 0) {
        throw new ExchangeConnectionException(
          'Binance Futures Balance: ',
          new Error('Response empty'),
        );
      }
      const { data } = res;
      const futures = data.map<FuturesBinanceResponse>((f) => ({
        asset: f.asset,
        walletBalance: f.walletBalance,
        unrealizedProfit: f.unrealizedProfit,
        marginBalance: f.marginBalance,
      }));

      return futures;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new HttpException(
          `Binance Futures Error balance: ${err.message}`,
          HttpStatus.BAD_GATEWAY,
        );
      } else {
        throw err;
      }
    }
  }

  async getSpotBalance(): Promise<SpotBinanceBalance[]> {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = this.sign(queryString);

    try {
      const res = await this.binanceSpot.get<SpotBinanceBalanceResponse>(
        EXCHANGES_CONFIG.binance.endPoints.balanceSpot,
        {
          params: {
            timestamp,
            signature,
          },
          headers: {
            'X-MBX-APIKEY': this.apiKey,
          },
        },
      );

      if (!res.data || res.data.balances.length === 0) {
        throw new ExchangeConnectionException(
          'Binance Spot Balance: ',
          new Error('Response empty'),
        );
      }
      const { balances } = res.data;

      const spot = balances
        .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
        .map((b) => ({
          asset: b.asset,
          free: b.free,
          locked: b.locked,
        }));

      return spot;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new HttpException(
          `Binance Spot Error balance: ${err?.message}`,
          HttpStatus.BAD_GATEWAY,
        );
      } else {
        throw err;
      }
    }
  }

  async getCombinedBalance(): Promise<CombinedBalanceResponse> {
    const [spot, futures] = await Promise.all([
      this.getSpotBalance(),
      this.getFuturesBalance(),
    ]);

    const allAssets = new Set([
      ...spot.map((b) => b.asset),
      ...futures.map((b) => b.asset),
    ]);

    const totalBalance = Array.from(allAssets).map((asset) => {
      const spotData = spot.find((b) => b.asset === asset);
      const futuresData = futures.find((b) => b.asset === asset);

      return {
        asset,
        spot: spotData
          ? {
              free: spotData.free,
              locked: spotData.locked,
            }
          : null,
        futures: futuresData
          ? {
              walletBalance: futuresData.walletBalance,
              unrealizedProfit: futuresData.unrealizedProfit,
              marginBalance: futuresData.marginBalance,
            }
          : null,
      };
    });

    return {
      totalBalance,
    };
  }

  async getQueryBalanceBinance(
    apiKey: string,
    apiSecret: string,
  ): Promise<Wallet[] | undefined> {
    const timestamp = Date.now();
    const query = `timestamp=${timestamp}`;
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(query)
      .digest('hex');

    const binance = axios.create({
      baseURL: 'https://api.binance.com',
      timeout: 10000, // Tiempo de espera de 10 segundos
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome',
        'Content-Type': 'application/json',
      },
    });

    try {
      const res = await binance.get<Wallet[]>('/sapi/v1/asset/wallet/balance', {
        params: {
          timestamp,
          signature,
        },
        headers: {
          'X-MBX-APIKEY': apiKey,
        },
      });

      if (!res.data) {
        throw new Error('Wallet is empty');
      }
      const walletData: Wallet[] = res.data;
      return walletData;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new HttpException(
          `Binance Spot Error balance: ${err?.message}`,
          HttpStatus.BAD_GATEWAY,
        );
      } else {
        throw err;
      }
    }
  }

  async getWalletBalanceBybit(
    apikey: string,
    secretKey: string,
    coin?: string[],
  ): Promise<WalletBalanceV5[]> {
    const client = new RestClientV5({
      testnet: false,
      key: apikey,
      secret: secretKey,
    });
    try {
      const response = await client.getWalletBalance({
        accountType: 'UNIFIED',
        coin: coin ? coin.join(',').toUpperCase() : '',
      });
      const { list } = response.result;
      if (!response.result || response.result.list.length === 0) {
        throw new HttpException(
          'No Data Response Bybit: ',
          HttpStatus.NO_CONTENT,
        );
      }
      const balanceWalletBybit = list.map((wallet) => ({
        accountIMRate: wallet.accountIMRate,
        totalMaintenanceMarginByMp: wallet.totalMaintenanceMargin,
        totalInitialMargin: wallet.totalInitialMargin,
        accountType: wallet.accountType,
        accountMMRate: wallet.accountMMRate,
        accountMMRateByMp: wallet.accountIMRateByMp,
        accountIMRateByMp: wallet.accountIMRateByMp,
        totalInitialMarginByMp: wallet.totalInitialMarginByMp,
        totalMaintenanceMargin: wallet.totalMaintenanceMargin,
        totalEquity: wallet.totalEquity,
        totalMarginBalance: wallet.totalMarginBalance,
        totalAvailableBalance: wallet.totalAvailableBalance,
        totalPerpUPL: wallet.totalPerpUPL,
        totalWalletBalance: wallet.totalWalletBalance,
        accountLTV: wallet.accountLTV,
        coin: wallet.coin,
      }));
      return balanceWalletBybit;
    } catch (error) {
      throw new HttpException(
        'Error Wallet-Bybit-Balance: ' + error,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getBalanceBitgetWallet(
    apiKey: string,
    apiSecret: string,
    apiPass: string,
  ) {
    const client = new RestClientV2({
      apiKey,
      apiSecret,
      apiPass: apiPass,
    });

    try {
      const res = await client.getBalances();
      if (!res.data || res.data.length === 0) {
        throw new HttpException(
          'Bitget balance-empty: ',
          HttpStatus.NO_CONTENT,
        );
      }
      return res.data.map((b) => ({
        accountType: b.accountType,
        usdtBalance: b.usdtBalance,
      }));
    } catch (error) {
      throw new HttpException(
        `Error: Balance bitget: ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
