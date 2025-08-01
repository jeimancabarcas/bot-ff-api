import { Test, TestingModule } from '@nestjs/testing';
import { FundingfeeController } from './fundingfee.controller';
import { FundingfeeService } from './fundingfee.service';

describe('FundingfeeController', () => {
  let controller: FundingfeeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundingfeeController],
      providers: [FundingfeeService],
    }).compile();

    controller = module.get<FundingfeeController>(FundingfeeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
