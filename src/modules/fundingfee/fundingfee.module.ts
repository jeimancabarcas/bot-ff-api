import { Module } from '@nestjs/common';
import { FundingfeeService } from './fundingfee.service';
import { FundingfeeController } from './fundingfee.controller';

@Module({
  controllers: [FundingfeeController],
  providers: [FundingfeeService],
})
export class FundingfeeModule {}
