import { Test, TestingModule } from '@nestjs/testing';
import { ProfitandlostService } from './profitandlost.service';

describe('ProfitandlostService', () => {
  let service: ProfitandlostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfitandlostService],
    }).compile();

    service = module.get<ProfitandlostService>(ProfitandlostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
