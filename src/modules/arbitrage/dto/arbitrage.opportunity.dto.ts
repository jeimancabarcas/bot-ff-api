import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ArbitrageOpportunityDto {
  @ApiProperty()
  @IsString()
  asset: string;

  @ApiProperty()
  @IsString()
  fiat: string;

  @ApiProperty()
  @IsString()
  buyExchange: string;

  @ApiProperty()
  @IsString()
  sellExchange: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  buyPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  sellPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  profitPercentage: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  maxTradeAmount: number;

  @ApiProperty()
  @IsOptional()
  buyOrderDetails?: Record<string, any>;

  @ApiProperty()
  @IsOptional()
  sellOrderDetails?: Record<string, any>;
}

export class ArbitrageQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  asset?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fiat?: string;

  @ApiProperty({ required: false, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minProfitPercentage?: number;

  @ApiProperty({ required: false, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
