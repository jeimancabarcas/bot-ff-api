import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class QueryDtoWalletBinance {
  @ApiProperty()
  @IsString()
  apiKey: string;

  @ApiProperty()
  @IsString()
  apiSecret: string;
}

export class QueryDtoWalletBybit {
  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coin: string[];

  @ApiProperty()
  @IsString()
  apiKey: string;

  @ApiProperty()
  @IsString()
  apiSecret: string;
}

export class QueryDtoWalletBitget {
  @ApiProperty()
  @IsString()
  apiKey: string;

  @ApiProperty()
  @IsString()
  apiSecret: string;

  @ApiProperty()
  @IsString()
  apiPass: string;
}
