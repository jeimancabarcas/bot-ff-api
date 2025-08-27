import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ArbitrageService } from './arbitrage.service';
import {
  ArbitrageOpportunityDto,
  ArbitrageQueryDto,
} from './dto/arbitrage.opportunity.dto';
//import { QueryArbitrageBinanceP2PFutures } from '../exchanges/dto/arbitrage.query.dto.binance';
import { BinanceService } from '../exchanges/services/binance.service';
import { QueryP2PBinancePrice } from '../exchanges/dto/query.p2p.price';
import { QueryFuturesBinanceBidAsk } from '../exchanges/dto/query.futures.bidask';
import { QuerySpotBinancePrice } from '../exchanges/dto/query.spot.price';
import { InterExchangeArbitrage } from '../exchanges/services/interexchanges.arbitrage.service';
import { InterExchangeDto } from '../exchanges/dto/interexchange.query.dto';
//import { ResponseArbitrageBinance } from '../exchanges/interfaces/binance.types.interface';

@ApiTags('Arbitrage')
@Controller('arbitrage')
export class ArbitrageController {
  constructor(
    private readonly arbitrageService: ArbitrageService,
    private readonly binanceService: BinanceService,
    private readonly interExchangesService: InterExchangeArbitrage,
  ) {}

  @Get('opportunities')
  @ApiOperation({ summary: 'Get current arbitrage opportunities' })
  @ApiResponse({
    status: 200,
    description: 'List of arbitrage opportunities',
    type: [ArbitrageOpportunityDto],
  })
  @ApiQuery({
    name: 'asset',
    required: false,
    description: 'Crypto asset (e.g., USDT)',
  })
  @ApiQuery({
    name: 'fiat',
    required: false,
    description: 'Fiat currency (e.g., USD)',
  })
  @ApiQuery({
    name: 'minProfitPercentage',
    required: false,
    description: 'Minimum profit percentage',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of results',
  })
  async getOpportunities(@Query() query: ArbitrageQueryDto) {
    return this.arbitrageService.getArbitrageOpportunities(
      query.asset,
      query.fiat,
      query.minProfitPercentage,
      query.limit,
    );
  }

  @Get('ordersInterexchanges')
  @ApiOperation({
    summary: 'Create Orders interexchanges Binance - Bybit',
  })
  @ApiResponse({
    status: 200,
    description: 'Arbitrage Interexchanges',
  })
  async ordersInterExchanges(@Query() query: InterExchangeDto) {
    const { symbol, asset } = query;
    return await this.interExchangesService.fetchOrderBooksAndTrade(
      symbol,
      asset,
    );
  }

  @Get('p2pBinancePrice/tradetype')
  @ApiOperation({ summary: 'Get prices p2p BUY - SELL' })
  @ApiResponse({
    status: 200,
    description: 'List prices p2p BUY - SELL',
  })
  async getP2pPricesBinance(@Query() query: QueryP2PBinancePrice) {
    const { asset, fiat, tradeType, rows } = query;
    return await this.binanceService.getP2PBinancePrice(
      asset,
      fiat,
      tradeType,
      rows,
    );
  }
  @Get('futuresBinancePrice/bid-ask')
  @ApiOperation({ summary: 'Get prices futures Bid - Ask' })
  @ApiResponse({
    status: 200,
    description: 'List prices futures Bid - Ask',
  })
  async getFuturesPricesBinance(@Query() query: QueryFuturesBinanceBidAsk) {
    const symbol = query.symbol;
    return await this.binanceService.getFuturesBinancePrice(symbol);
  }

  @Get('spotBinancePrice')
  @ApiOperation({ summary: 'Get price Spot binance' })
  @ApiResponse({
    status: 200,
    description: 'Spot Price Binance',
  })
  async getSpotPricesBinance(@Query() query: QuerySpotBinancePrice) {
    const symbol = query.symbol;
    return await this.binanceService.getSpotBinancePrice(symbol);
  }
}
