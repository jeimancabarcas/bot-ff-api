import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class QueryOrderFutures {
  @ApiProperty({
    name: 'symbol',
    example: 'BTCUSDT',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    name: 'quantity',
  })
  @IsString()
  quantity: string;
}
