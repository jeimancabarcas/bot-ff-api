import { Controller, Get, Query } from '@nestjs/common';
import { ProfitandlostService } from './profitandlost.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryBitgetDto, QueryBybitDto } from './dto/query.dto';
import { CTFuturesTraderProfitHistoryItemV2 } from 'bitget-api';
import { ClosedPnLV5 } from 'bybit-api';
@ApiTags('Profit and lost')
@Controller('profitandlost')
export class ProfitandlostController {
  constructor(private readonly profitandlostService: ProfitandlostService) {}

  @Get('bybit-profit-and-lost')
  @ApiOperation({ summary: 'Get Profit and lost Bybit' })
  @ApiResponse({
    status: 200,
    description: 'Status PNL Bybit Account',
  })
  async getProfitandLostBybit(
    @Query() query: QueryBybitDto,
  ): Promise<ClosedPnLV5[]> {
    const { key, secret, category } = query;
    return await this.profitandlostService.getProfitandLostBybit(
      key,
      secret,
      category,
    );
  }

  @Get('bitget-profit-and-lost')
  @ApiOperation({ summary: 'Get Profit and lost Bitget' })
  @ApiResponse({
    status: 200,
    description: 'Status PNL Bitget Account',
  })
  async getProfitandLostBitget(
    @Query() query: QueryBitgetDto,
  ): Promise<CTFuturesTraderProfitHistoryItemV2[] | undefined> {
    const { apikey, apiSecret, apiPass } = query;
    return await this.profitandlostService.getProfitandLostBitget(
      apikey,
      apiSecret,
      apiPass,
    );
  }
}
