import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from './balance.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

jest.mock('bitget-api', () => {
  return {
    RestClientV2: jest.fn().mockImplementation(() => ({
      getBalances: jest.fn(() => {}),
    })),
  };
});
import { RestClientV2 } from 'bitget-api';

describe('BalanceService', () => {
  let service: BalanceService;
  const mockGetBalances = jest.fn();

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('fake-key'),
  };

  beforeEach(async () => {
    (RestClientV2 as jest.Mock).mockImplementation(() => ({
      getBalances: mockGetBalances,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
    mockGetBalances.mockReset();
  });

  it('debería retornar el balance en formato correcto si getBalances() devuelve datos', async () => {
    const fakeBalances = [
      { accountType: 'spot', usdtBalance: '1000' },
      { accountType: 'margin', usdtBalance: '500' },
    ];

    mockGetBalances.mockResolvedValue({ data: fakeBalances });

    const result = await service.getBalanceBitgetWallet(
      'key',
      'secret',
      'pass',
    );

    expect(result).toEqual(fakeBalances);
    expect(mockGetBalances).toHaveBeenCalled();
  });

  it('debería lanzar una excepción si no hay datos en la respuesta', async () => {
    mockGetBalances.mockResolvedValue({
      code: '00000',
      msg: 'success',
      requestTime: Date.now(),
      data: [],
    });

    await expect(
      service.getBalanceBitgetWallet('key', 'secret', 'pass'),
    ).rejects.toThrow('Bitget balance-empty');
  });

  it('debería lanzar una excepción si ocurre un error en el cliente', async () => {
    mockGetBalances.mockRejectedValue('Error de conexión');

    await expect(
      service.getBalanceBitgetWallet('key', 'secret', 'pass'),
    ).rejects.toThrow(
      new HttpException(
        'Error: Balance bitget: Error de conexión',
        HttpStatus.BAD_REQUEST,
      ),
    );
  });
});
