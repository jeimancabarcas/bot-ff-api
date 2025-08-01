import { Module } from '@nestjs/common';
import { FundingfeeService } from './fundingfee.service';
import { FundingfeeController } from './fundingfee.controller';

@Module({
  controllers: [FundingfeeController],
  providers: [FundingfeeService],
  exports: [FundingfeeService],
})
export class FundingfeeModule {}
