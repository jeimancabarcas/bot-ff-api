import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BalanceService } from './balance.service';
import { WalletBalanceV5 } from 'bybit-api';
import {
  QueryDtoWalletBinance,
  QueryDtoWalletBybit,
  QueryDtoWalletBitget,
} from './dto/query.wallet.dto';
import { Wallet } from './interfaces/binance.types';

@ApiTags('Balances')
@Controller('balances')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}
  @Get('Balance-Wallet-Binance')
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
}
