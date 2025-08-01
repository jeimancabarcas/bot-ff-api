import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './modules/database/database.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';
import { ArbitrageModule } from './modules/arbitrage/arbitrage.module';
import { DatabaseConfig } from './config/database.config';
import { BalanceModule } from './modules/balance/balance.module';
import { FundingfeeModule } from './modules/fundingfee/fundingfee.module';
import { OrderbookModule } from './modules/orderbook/orderbook.module';
import { ProfitandlostModule } from './modules/profitandlost/profitandlost.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    ExchangesModule,
    ArbitrageModule,
    BalanceModule,
    FundingfeeModule,
    OrderbookModule,
    ProfitandlostModule,
    OrdersModule,
  ],
  providers: [],
})
export class AppModule {}
