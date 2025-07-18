import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';

@Module({
  controllers: [],
  providers: [BalanceService],
  exports: [BalanceService],
})
export class BalanceModule {}
