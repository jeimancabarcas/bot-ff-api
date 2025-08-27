import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BinanceService } from './services/binance.service';
import { InterExchangeArbitrage } from './services/interexchanges.arbitrage.service';

@Module({
  imports: [DatabaseModule],
  providers: [BinanceService, InterExchangeArbitrage],
  exports: [InterExchangeArbitrage],
})
export class ExchangesModule {}
