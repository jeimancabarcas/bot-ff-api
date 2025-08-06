import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class QuerySpotBinancePrice {
  @ApiProperty({
    name: 'symbol',
    example: 'BTCUSDT',
    required: true,
  })
  @IsString()
  symbol: string;
}
