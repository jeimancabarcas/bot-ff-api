import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArbitrageOpportunity } from '../database/entities/arbitrage-opportunity.entity';
import { P2POrder } from '../database/entities/p2p-order.entity';
import {
  FundingFeeTypes,
  OrderBookDtoResponse,
  OrderBookResponseBinance,
  OrdersBookAsk,
  OrdersBookBids,
} from '../exchanges/interfaces/binance.types.interface';
import axios, { AxiosInstance } from 'axios';
import { ExchangeConnectionException } from 'src/exceptions/exchange.exceptions';
import { ResponseBybitfundingRate } from '../exchanges/interfaces/bybit.types.interface';
import { EXCHANGES_CONFIG } from 'src/config/exchanges.config';
import { ConfigService } from '@nestjs/config';

interface IArbitrageCalculation {
  asset: string;
  fiat: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profitPercentage: number;
  maxTradeAmount: number;
  buyOrder: P2POrder;
  sellOrder: P2POrder;
}

@Injectable()
export class ArbitrageService {
  [x: string]: any;
  private readonly logger = new Logger(ArbitrageService.name);
  private readonly MIN_PROFIT_THRESHOLD = 0.5; // 0.5% minimum profit
  private readonly binanceSpot: AxiosInstance;
  private readonly binanceFutures: AxiosInstance;

  constructor(
    @InjectRepository(ArbitrageOpportunity)
    private readonly arbitrageRepository: Repository<ArbitrageOpportunity>,
    @InjectRepository(P2POrder)
    private readonly p2pOrderRepository: Repository<P2POrder>,
    private readonly configService: ConfigService,
  ) {}

  private calculateArbitrageOpportunities(
    orders: P2POrder[],
    minProfitPercentage: number,
  ): IArbitrageCalculation[] {
    const opportunities: IArbitrageCalculation[] = [];

    // Group orders by exchange and trade type
    const buyOrders = orders.filter((order) => order.tradeType === 'Buy');
    const sellOrders = orders.filter((order) => order.tradeType === 'Sell');

    // Find arbitrage opportunities
    for (const buyOrder of buyOrders) {
      for (const sellOrder of sellOrders) {
        // Skip same exchange comparisons
        if (buyOrder.exchange === sellOrder.exchange) continue;

        // Skip if assets/fiats don't match
        if (
          buyOrder.asset !== sellOrder.asset ||
          buyOrder.fiat !== sellOrder.fiat
        )
          continue;

        // Calculate profit percentage
        const profitPercentage =
          ((sellOrder.price - buyOrder.price) / buyOrder.price) * 100;

        // Skip if profit is below threshold
        if (profitPercentage < minProfitPercentage) continue;

        // Calculate maximum tradeable amount
        const maxTradeAmount = Math.min(
          buyOrder.availableAmount,
          sellOrder.availableAmount,
          Math.min(buyOrder.maxLimit, sellOrder.maxLimit) / buyOrder.price,
        );

        // Skip if no meaningful amount can be traded
        if (maxTradeAmount < 10) continue; // Minimum $10 equivalent

        opportunities.push({
          asset: buyOrder.asset,
          fiat: buyOrder.fiat,
          buyExchange: buyOrder.exchange,
          sellExchange: sellOrder.exchange,
          buyPrice: buyOrder.price,
          sellPrice: sellOrder.price,
          profitPercentage: Math.round(profitPercentage * 100) / 100,
          maxTradeAmount: Math.round(maxTradeAmount * 100) / 100,
          buyOrder,
          sellOrder,
        });
      }
    }

    // Sort by profit percentage descending
    return opportunities.sort(
      (a, b) => b.profitPercentage - a.profitPercentage,
    );
  }

  private createArbitrageEntity(
    calculation: IArbitrageCalculation,
  ): ArbitrageOpportunity {
    const entity = new ArbitrageOpportunity();
    entity.asset = calculation.asset;
    entity.fiat = calculation.fiat;
    entity.buyExchange = calculation.buyExchange;
    entity.sellExchange = calculation.sellExchange;
    entity.buyPrice = calculation.buyPrice;
    entity.sellPrice = calculation.sellPrice;
    entity.profitPercentage = calculation.profitPercentage;
    entity.maxTradeAmount = calculation.maxTradeAmount;
    entity.buyOrderDetails = {
      advertId: calculation.buyOrder.advertId,
      merchantName: calculation.buyOrder.merchantName,
      availableAmount: calculation.buyOrder.availableAmount,
      minLimit: calculation.buyOrder.minLimit,
      maxLimit: calculation.buyOrder.maxLimit,
      paymentMethods: calculation.buyOrder.paymentMethods,
      metadata: calculation.buyOrder.metadata,
    };
    entity.sellOrderDetails = {
      advertId: calculation.sellOrder.advertId,
      merchantName: calculation.sellOrder.merchantName,
      availableAmount: calculation.sellOrder.availableAmount,
      minLimit: calculation.sellOrder.minLimit,
      maxLimit: calculation.sellOrder.maxLimit,
      paymentMethods: calculation.sellOrder.paymentMethods,
      metadata: calculation.sellOrder.metadata,
    };
    return entity;
  }

  async getArbitrageOpportunities(
    asset?: string,
    fiat?: string,
    minProfitPercentage?: number,
    limit: number = 50,
  ): Promise<ArbitrageOpportunity[]> {
    const queryBuilder =
      this.arbitrageRepository.createQueryBuilder('opportunity');

    queryBuilder.where('opportunity.isActive = :isActive', { isActive: true });

    // Filter by recent opportunities (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    queryBuilder.andWhere('opportunity.createdAt > :since', {
      since: thirtyMinutesAgo,
    });

    if (asset) {
      queryBuilder.andWhere('opportunity.asset = :asset', { asset });
    }

    if (fiat) {
      queryBuilder.andWhere('opportunity.fiat = :fiat', { fiat });
    }

    if (minProfitPercentage) {
      queryBuilder.andWhere('opportunity.profitPercentage >= :minProfit', {
        minProfit: minProfitPercentage,
      });
    }

    return queryBuilder
      .orderBy('opportunity.profitPercentage', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getFundingRateBinance(symbol: string): Promise<FundingFeeTypes> {
    symbol = symbol.toUpperCase();
    try {
      const response = await axios.get<FundingFeeTypes[]>(
        'https://fapi.binance.com/fapi/v1/fundingRate',
        {
          params: {
            symbol: symbol,
            limit: 1, // Última tasa de financiamiento
          },
        },
      );

      if (!response.data || response.data.length === 0) {
        throw new ExchangeConnectionException(
          `No funding rate data found for symbol: ${symbol}`,
          new Error('Empty response'),
        );
      }

      const data = response.data[0];

      const fundingFee: FundingFeeTypes = {
        symbol: data.symbol,
        fundingRate: (Number(data.fundingRate) * 100).toFixed(4) + '%',
        fundingTime: new Date(data.fundingTime).toLocaleString(),
      };

      return fundingFee;
    } catch (error) {
      if (error instanceof Error) {
        throw new ExchangeConnectionException(
          'Connection Failure Binance',
          error,
        );
      } else {
        throw new Error('Unknow Error');
      }
    }
  }
  async getFundingRateBybit(symbol: string): Promise<FundingFeeTypes> {
    try {
      symbol = symbol.toUpperCase();
      const response = await axios.get<ResponseBybitfundingRate>(
        'https://api.bybit.com/v5/market/funding/history',
        {
          params: {
            category: 'linear',
            limit: 1, // Última tasa de financiamiento
            symbol: symbol,
          },
        },
      );

      const info = response.data.result.list[0];

      if (!response.data.result || response.data.result.list.length === 0) {
        throw new ExchangeConnectionException(
          `No funding rate data found for symbol: ${symbol}`,
          new Error('Empty response'),
        );
      }
      const fundingFee: FundingFeeTypes = {
        symbol: info.symbol,
        fundingRate: (Number(info.fundingRate) * 100).toFixed(4) + '%',
        fundingTime: new Date(
          Number(info.fundingRateTimestamp),
        ).toLocaleString(),
      };
      return fundingFee;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ExchangeConnectionException(
          'Connection Failure Bybit',
          error,
        );
      } else {
        throw new Error('Unknown Error');
      }
    }
  }

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
