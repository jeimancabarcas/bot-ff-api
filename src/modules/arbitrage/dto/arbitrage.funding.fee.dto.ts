import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ArbitrageFundingFeeDto {
  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiProperty()
  @IsString()
  fundingTime: string;

  @ApiProperty()
  @IsString()
  fundingRate: string;
}
