import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, ValidateIf } from 'class-validator';
import {
  OrderType,
  TimeInForce,
} from '../interfaces/orders.request.interfaces';

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

  @ApiProperty({
    name: 'type',
    enum: OrderType,
    description: `Tipo de orden:
- MARKET: Ejecuta al precio de mercado inmediatamente.
- LIMIT: Coloca una orden a un precio específico.`,
  })
  @IsEnum(OrderType)
  type: OrderType;

  @ValidateIf((o: QueryOrderFutures) => o.type === OrderType.LIMIT)
  @ApiProperty({
    name: 'timeInForce',
    enum: TimeInForce,
    required: false,
    description: `Política de ejecución de la orden (solo para LIMIT):
- GTC (Good 'Til Canceled): Queda activa hasta que se ejecute o se cancele manualmente.
- IOC (Immediate Or Cancel): Ejecuta lo que pueda inmediatamente, el resto se cancela.
- FOK (Fill Or Kill): Solo se ejecuta si puede completarse totalmente de inmediato, si no, se cancela.`,
  })
  @IsEnum(TimeInForce)
  timeInForce: TimeInForce;
}
