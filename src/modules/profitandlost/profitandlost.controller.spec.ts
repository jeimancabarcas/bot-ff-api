import { Test, TestingModule } from '@nestjs/testing';
import { ProfitandlostController } from './profitandlost.controller';
import { ProfitandlostService } from './profitandlost.service';

describe('ProfitandlostController', () => {
  let controller: ProfitandlostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfitandlostController],
      providers: [ProfitandlostService],
    }).compile();

    controller = module.get<ProfitandlostController>(ProfitandlostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
