import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class QueryFuturesBinanceBidAsk {
  @ApiProperty({
    name: 'symbol',
    example: 'BTCUSDT',
    required: true,
  })
  @IsString()
  symbol: string;
}
