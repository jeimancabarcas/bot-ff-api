import { Test, TestingModule } from '@nestjs/testing';
import { FundingfeeService } from './fundingfee.service';

describe('FundingfeeService', () => {
  let service: FundingfeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FundingfeeService],
    }).compile();

    service = module.get<FundingfeeService>(FundingfeeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
