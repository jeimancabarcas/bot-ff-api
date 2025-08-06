import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';

export class QueryP2PBinancePrice {
  @ApiProperty({
    name: 'asset',
    example: 'USDT',
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
    name: 'tradeType',
    example: 'BUY',
    required: true,
  })
  @IsString()
  tradeType: string;

  @ApiProperty({
    name: 'rows',
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  rows: number;
}
