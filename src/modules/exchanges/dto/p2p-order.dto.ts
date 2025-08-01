import { IsString, IsNumber, IsArray, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class P2POrderDto {
  @ApiProperty()
  @IsString()
  advertId: string;

  @ApiProperty()
  @IsString()
  asset: string;

  @ApiProperty()
  @IsString()
  fiat: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  availableAmount: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  minLimit: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  maxLimit: number;

  @ApiProperty({ enum: ['BUY', 'SELL'] })
  tradeType: 'BUY' | 'SELL';

  @ApiProperty()
  @IsString()
  merchantName: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  paymentMethods: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
