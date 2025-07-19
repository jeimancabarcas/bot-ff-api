import {
  Controller,
  Get,
  Query,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ArbitrageService } from './arbitrage.service';
import {
  ArbitrageOpportunityDto,
  ArbitrageQueryDto,
} from './dto/arbitrage.opportunity.dto';
import {
  SUPPORTED_CRYPTOS,
  SUPPORTED_FIATS,
} from '../../config/exchanges.config';
import { ArbitrageFundingFeeDto } from './dto/arbitrage.funding.fee.dto';
import {
  FundingFeeTypes,
  OrderBookDtoResponse,
} from '../exchanges/interfaces/binance.types.interface';
import {
  OrderBookDto,
  OrderBookQueryDto,
} from './dto/arbitrage.order.book.dto';
import { BalanceService } from '../balance/balance.service';
import { Wallet } from '../balance/interfaces/binance.types';
import {
  QueryDtoWalletBinance,
  QueryDtoWalletBitget,
  QueryDtoWalletBybit,
} from '../balance/dto/query.wallet.dto';
import { WalletBalanceV5 } from 'bybit-api';
import { QueryFundingBitgetDto } from './dto/query.bitget.dto';

@ApiTags('arbitrage')
@Controller('arbitrage')
export class ArbitrageController {
  constructor(
    private readonly arbitrageService: ArbitrageService,
    private readonly balanceService: BalanceService,
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

  @Post('detect/:asset/:fiat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Detect new arbitrage opportunities for specific asset/fiat pair',
  })
  @ApiResponse({
    status: 200,
    description: 'Newly detected arbitrage opportunities',
    type: [ArbitrageOpportunityDto],
  })
  @Get('stats')
  @ApiOperation({ summary: 'Get arbitrage statistics' })
  @ApiResponse({ status: 200, description: 'Arbitrage statistics' })
  @ApiQuery({
    name: 'asset',
    required: false,
    description: 'Filter by crypto asset',
  })
  @ApiQuery({
    name: 'fiat',
    required: false,
    description: 'Filter by fiat currency',
  })
  @Get('supported-assets')
  @ApiOperation({ summary: 'Get supported crypto assets and fiat currencies' })
  @ApiResponse({ status: 200, description: 'Supported assets and fiats' })
  getSupportedAssets() {
    return {
      cryptos: SUPPORTED_CRYPTOS,
      fiats: SUPPORTED_FIATS,
    };
  }

  @Get('funding-fee-binance')
  @ApiOperation({ summary: 'Get funding fees for a specific asset on Binance' })
  @ApiResponse({
    status: 200,
    description: 'Funding fees API Binance',
    type: [ArbitrageFundingFeeDto],
  })
  async getFundingFeesBinance(
    @Query('symbol') symbol: string,
  ): Promise<FundingFeeTypes> {
    return this.arbitrageService.getFundingRateBinance(symbol);
  }
  @Get('funding-fee-bybit')
  @ApiOperation({ summary: 'Get funding fees for a specific asset on Bybit' })
  @ApiResponse({
    status: 200,
    description: 'Funding fees API Bybit',
    type: [ArbitrageFundingFeeDto],
  })
  async getFundingFeesBybit(
    @Query('symbol') symbol: string,
  ): Promise<FundingFeeTypes> {
    return this.arbitrageService.getFundingRateBybit(symbol);
  }
  @Get('order-book-binance')
  @ApiOperation({ summary: 'Get order book for a specific asset on Binance' })
  @ApiResponse({
    status: 200,
    description: 'Order book API Binance',
    type: [OrderBookDto],
  })
  async getOrderBookBinance(
    @Query() query: OrderBookQueryDto,
  ): Promise<OrderBookDtoResponse> {
    const { symbol, limit = 10 } = query;
    const result: OrderBookDtoResponse =
      await this.arbitrageService.getOrderBookBinance(symbol, limit);
    return result;
  }
  @Get('Balance-Wallet-Account')
  @ApiOperation({ summary: 'Get Balance account Binance Wallet' })
  @ApiResponse({
    status: 200,
    description: 'Balance Spot - Futures- Binance',
  })
  @ApiQuery({
    name: 'apiKey',
    required: true,
    description: 'Binance API Key',
  })
  @ApiQuery({
    name: 'apiSecret',
    required: true,
    description: 'Binance API Secret',
  })
  async getQueryBalanceBinance(
    @Query() query: QueryDtoWalletBinance,
  ): Promise<Wallet[]> {
    const apiKey = query.apiKey;
    const apiSecret = query.apiSecret;
    return (
      (await this.balanceService.getQueryBalanceBinance(apiKey, apiSecret)) ??
      []
    );
  }

  @Get('Wallet-Balance-Bybit')
  @ApiOperation({ summary: 'Get Balance account Bybit Wallet' })
  @ApiResponse({
    status: 200,
    description: 'Balance wallet - Bybit',
  })
  @ApiQuery({
    name: 'apiKey',
    required: true,
    description: 'Bybit API Key',
  })
  @ApiQuery({
    name: 'apiSecret',
    required: true,
    description: 'Bybit API Secret',
  })
  @ApiQuery({
    name: 'coin',
    required: false,
    description: 'List of coins to filter',
    isArray: true,
    type: String,
  })
  async getWalletBalanceBybit(
    @Query() query: QueryDtoWalletBybit,
  ): Promise<WalletBalanceV5[]> {
    const apiKey = query.apiKey;
    const apiSecret = query.apiSecret;
    const coin = query.coin;
    return await this.balanceService.getWalletBalanceBybit(
      apiKey,
      apiSecret,
      coin,
    );
  }

  @Get('Wallet-Balance-Bitget')
  @ApiOperation({ summary: 'Get Balance account Bitget Wallet' })
  @ApiResponse({
    status: 200,
    description: 'Balance wallet - Bitget',
  })
  @ApiQuery({
    name: 'apiKey',
    required: true,
    description: 'Bitget API Key',
  })
  @ApiQuery({
    name: 'apiSecret',
    required: true,
    description: 'Bitget API Secret',
  })
  @ApiQuery({
    name: 'apiPass',
    required: true,
    description: 'Bitget API apiPass',
  })
  async getWalletBalanceBitget(
    @Query() query: QueryDtoWalletBitget,
  ): Promise<any> {
    const apiKey = query.apiKey;
    const apiSecret = query.apiSecret;
    const apiPass = query.apiPass;
    return await this.balanceService.getBalanceBitgetWallet(
      apiKey,
      apiSecret,
      apiPass,
    );
  }

  @Get('Funding-Rate-Bitget')
  @ApiOperation({ summary: 'Get Funding Rate Bitget' })
  @ApiResponse({
    status: 200,
    description: 'Funding Rate - Bitget',
  })
  @ApiQuery({
    name: 'apiKey',
    required: true,
    description: 'Bitget API Key',
  })
  @ApiQuery({
    name: 'apiSecret',
    required: true,
    description: 'Bitget API Secret',
  })
  @ApiQuery({
    name: 'apiPass',
    required: true,
    description: 'Bitget API apiPass',
  })
  @ApiQuery({
    name: 'symbol',
    required: true,
    description: 'Bitget API symbol',
  })
  @ApiQuery({
    name: 'productType',
    required: true,
    description: 'Bitget API productType',
  })
  async getFundingRateBitget(
    @Query() query: QueryFundingBitgetDto,
  ): Promise<any> {
    const apiKey = query.apiKey;
    const apiSecret = query.apiSecret;
    const apiPass = query.apiPass;
    const symbol = query.symbol;
    const productType = query.productType;
    return await this.arbitrageService.getFundingRateBitget(
      apiKey,
      apiSecret,
      apiPass,
      symbol,
      productType,
    );
  }
}
