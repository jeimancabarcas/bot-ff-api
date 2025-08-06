import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { FundingfeeService } from '../fundingfee/fundingfee.service';

@Module({
  imports: [FundingfeeService],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
