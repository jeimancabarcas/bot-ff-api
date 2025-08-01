import { ApiProperty } from '@nestjs/swagger';
import { CategoryV5 } from 'bybit-api';
import { IsString } from 'class-validator';

export class QueryBitgetDto {
  @ApiProperty({
    name: 'apikey',
    description: 'Api key Bitget',
    required: true,
  })
  @IsString()
  apikey: string;

  @ApiProperty({
    name: 'apiSecret',
    description: 'Api secret Bitge',
    required: true,
  })
  @IsString()
  apiSecret: string;

  @ApiProperty({
    name: 'apiPass',
    description: 'Api PASSPHRASE Bitget',
    required: true,
  })
  @IsString()
  apiPass: string;
}

export class QueryBybitDto {
  @ApiProperty({
    name: 'key',
    description: 'Api Key bybit',
    required: true,
  })
  @IsString()
  key: string;

  @ApiProperty({
    name: 'secret',
    description: 'Api secret Bybit',
    required: true,
  })
  @IsString()
  secret: string;

  @ApiProperty({
    name: 'category',
    description: 'Api Category Bybit',
    example: ['spot', 'linear', 'inverse'],
  })
  @IsString()
  category: CategoryV5;
}
