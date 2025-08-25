import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { ArbitrageController } from './arbitrage.controller';
import { ArbitrageService } from './arbitrage.service';
import { BinanceService } from '../exchanges/services/binance.service';
import { OrderbookModule } from '../orderbook/orderbook.module';
import { OrderbookService } from '../orderbook/orderbook.service';
import { OrderBooksExchangesService } from '../exchanges/services/interexchanges.arbitrage.service';
@Module({
  imports: [DatabaseModule, ExchangesModule, OrderbookModule],
  providers: [
    ArbitrageService,
    BinanceService,
    OrderbookService,
    OrderBooksExchangesService,
  ],
  controllers: [ArbitrageController],
  exports: [ArbitrageService],
})
export class ArbitrageModule {}
