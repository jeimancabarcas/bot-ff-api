import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class QueryArbitrageBinanceP2PFutures {
  @ApiProperty({
    name: 'asset',
    example: 'BTC',
    required: true,
  })
  @IsString()
  asset: string;

  @ApiProperty({
    name: 'fiat',
    example: 'COP',
    required: true,
  })
  @IsString()
  fiat: string;

  @ApiProperty({
    name: 'symbol',
    example: 'BTCUSDT',
    required: true,
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    name: 'tradeType',
    example: 'BUY | SELL',
    required: true,
  })
  @IsString()
  tradeType: string;
}
