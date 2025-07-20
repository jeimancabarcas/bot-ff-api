import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  IsIn,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderBookDto {
  @ApiProperty()
  @IsNumber()
  lastUpdateId: number;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  bids: [string, string][];

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  asks: [string, string][];
}

export class OrderBookQueryDto {
  @ApiProperty({ description: 'Pair of trading', example: 'BTCUSDT' })
  @IsString()
  symbol: string;

  @ApiProperty({ enum: [5, 10, 20], description: 'allowed limits ' })
  @Type(() => Number)
  @IsIn([5, 10, 20], {
    message: 'The value limit must be of: 5, 10, 20',
  })
  limit?: number;
}
