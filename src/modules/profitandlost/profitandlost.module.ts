import { Module } from '@nestjs/common';
import { ProfitandlostService } from './profitandlost.service';
import { ProfitandlostController } from './profitandlost.controller';

@Module({
  controllers: [ProfitandlostController],
  providers: [ProfitandlostService],
})
export class ProfitandlostModule {}
