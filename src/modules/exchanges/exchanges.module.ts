import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BinanceService } from './services/binance.service';

@Module({
  imports: [DatabaseModule],
  providers: [BinanceService],
  exports: [],
})
export class ExchangesModule {}
