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

@ApiTags('arbitrage')
@Controller('arbitrage')
export class ArbitrageController {
  constructor(private readonly arbitrageService: ArbitrageService) {}

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
}
