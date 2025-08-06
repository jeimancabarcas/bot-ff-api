import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArbitrageOpportunity } from '../database/entities/arbitrage-opportunity.entity';
import { P2POrder } from '../database/entities/p2p-order.entity';
import { ConfigService } from '@nestjs/config';
import { OrderbookService } from '../orderbook/orderbook.service';
import { BinanceService } from '../exchanges/services/binance.service';
import { TradeType } from '../exchanges/interfaces/binance.types.interface';

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

  constructor(
    @InjectRepository(ArbitrageOpportunity)
    private readonly arbitrageRepository: Repository<ArbitrageOpportunity>,
    @InjectRepository(P2POrder)
    private readonly p2pOrderRepository: Repository<P2POrder>,
    private readonly configService: ConfigService,
    private readonly orderBookService: OrderbookService,
    private readonly binanceService: BinanceService,
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

  async arbitrageOrderBookBybitVsSpotBinanceP2P(
    asset: string,
    symbol: string,
    fiat: string,
    tradeType: TradeType,
    rows: number,
  ) {
    const [book, p2pBuy, p2pSell] = await Promise.all([
      this.orderBookService.getOrderBookBybit('linear', symbol, 1),
      this.binanceService.getP2PBinancePrice(asset, fiat, tradeType.buy, rows),
      this.binanceService.getP2PBinancePrice(asset, fiat, tradeType.sell, rows),
    ]);

    const bestBid = book.bids[0][0];
    const bestAsk = book.ask[0][0];
    //const spotCopBid = Number(bestBid) * Number(p2pSell);
    //const spotCopAsk = Number(bestAsk) * Number(p2pBuy);
    return {
      spotBidUSD: bestBid,
      spotAskUSD: bestAsk,
      p2pBuyCop: p2pBuy,
      p2pSellCop: p2pSell,
    };
  }
}
