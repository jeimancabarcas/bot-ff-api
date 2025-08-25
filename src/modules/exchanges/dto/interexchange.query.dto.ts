import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InterExchangeDto {
  @ApiProperty({
    name: 'symbol',
    example: 'BTCUSDT',
    required: true,
  })
  @IsString()
  symbol: string;
  @ApiProperty({
    name: 'asset',
    example: 'BTC',
    required: true,
  })
  @IsString()
  asset: string;
}
