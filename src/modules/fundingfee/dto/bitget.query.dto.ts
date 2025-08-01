import { ApiProperty } from '@nestjs/swagger';
import { FuturesProductTypeV2 } from 'bitget-api';
import { IsString } from 'class-validator';

export class QueryFundingBitgetDto {
  @ApiProperty()
  @IsString()
  apiKey: string;

  @ApiProperty()
  @IsString()
  apiSecret: string;

  @ApiProperty()
  @IsString()
  apiPass: string;

  @ApiProperty({ description: 'Pair of trading', example: 'BTCUSDT' })
  @IsString()
  symbol: string;

  @ApiProperty({
    enum: ['USDT-FUTURES', 'COIN-FUTURES', 'USDC-FUTURES'],
    description: 'Possible Values',
  })
  @IsString()
  productType: FuturesProductTypeV2;
}
