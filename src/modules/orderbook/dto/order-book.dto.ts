import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsArray,
  ArrayNotEmpty,
  IsIn,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryV5 } from 'bybit-api';

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

export class OrderBookQueryDtoBinance {
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

export class OrderBookQueryDtoBybit {
  @ApiProperty({
    description: 'Category',
    example: `spot | linear | inverse | option`,
  })
  @IsString()
  category: CategoryV5;

  @ApiProperty({ description: 'Pair of trading', example: 'BTCUSDT' })
  @IsString()
  symbol: string;

  @ApiProperty({ enum: [5, 10, 20], description: 'allowed limits ' })
  @Type(() => Number)
  @IsIn([5, 10, 20], {
    message: 'The value limit must be of: 5, 10, 20',
  })
  limit: number;
}

export class OrderBookQueryDtoBitget {
  @ApiProperty({
    description: 'Type',
    example: `spot | linear | inverse | option`,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ description: 'Pair of trading', example: 'BTCUSDT' })
  @IsString()
  symbol: string;

  @ApiProperty({ enum: [5, 10, 20], description: 'allowed limits ' })
  @IsOptional()
  @Type(() => String)
  @IsIn(['5', '10', '20'], {
    message: 'The value limit must be of: 5, 10, 20',
  })
  limit?: string;
}
