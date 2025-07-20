import { Controller, Get, Query } from '@nestjs/common';
import { FundingfeeService } from './fundingfee.service';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { FundingFeeTypes } from '../exchanges/interfaces/binance.types.interface';
import { QueryFundingBitgetDto } from './dto/bitget.query.dto';

@Controller('fundingfee')
export class FundingfeeController {
  constructor(private readonly fundingfeeService: FundingfeeService) {}

  @Get('funding-fee-binance')
  @ApiOperation({ summary: 'Get funding fees for a specific asset on Binance' })
  @ApiResponse({
    status: 200,
    description: 'Funding fees API Binance',
  })
  async getFundingFeesBinance(
    @Query('symbol') symbol: string,
  ): Promise<FundingFeeTypes> {
    return this.fundingfeeService.getFundingRateBinance(symbol);
  }
  @Get('funding-fee-bybit')
  @ApiOperation({ summary: 'Get funding fees for a specific asset on Bybit' })
  @ApiResponse({
    status: 200,
    description: 'Funding fees API Bybit',
  })
  async getFundingFeesBybit(
    @Query('symbol') symbol: string,
  ): Promise<FundingFeeTypes> {
    return this.fundingfeeService.getFundingRateBybit(symbol);
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
    return await this.fundingfeeService.getFundingRateBitget(
      apiKey,
      apiSecret,
      apiPass,
      symbol,
      productType,
    );
  }
}
