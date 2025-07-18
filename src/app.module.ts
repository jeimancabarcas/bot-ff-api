import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './modules/database/database.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';
import { ArbitrageModule } from './modules/arbitrage/arbitrage.module';
import { DatabaseConfig } from './config/database.config';
import { ArbitrageService } from './modules/arbitrage/arbitrage.service';

import { BalanceService } from './modules/balance/balance.service';

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
  ],
  providers: [ArbitrageService, BalanceService],
})
export class AppModule {}
