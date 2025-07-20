import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { ArbitrageController } from './arbitrage.controller';
import { ArbitrageService } from './arbitrage.service';

@Module({
  imports: [DatabaseModule, ExchangesModule],
  providers: [ArbitrageService],
  controllers: [ArbitrageController],
  exports: [ArbitrageService],
})
export class ArbitrageModule {}
