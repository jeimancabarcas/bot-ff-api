import { Controller, Get, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryOrderFutures } from './dto/query.order';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('webSocket/start')
  @ApiResponse({
    status: 200,
    description: 'Start WebSocket Binance, created order futures',
  })
  startWebSocketOrder(@Query() query: QueryOrderFutures) {
    const { symbol, quantity, type, timeInForce } = query;
    return this.ordersService.startWebsocketOrder(
      symbol,
      quantity,
      type,
      timeInForce,
    );
  }

  @Get('webSocket/stop')
  @ApiResponse({
    status: 200,
    description: 'Stop WebSocket Binance',
  })
  listActiveSockets(@Query('symbol') symbol: string) {
    return this.ordersService.stopWebSocketOrder(symbol);
  }

  @Get('activesockets/list')
  @ApiResponse({
    status: 200,
    description: 'list active sockets',
  })
  stoptWebSocket() {
    return this.ordersService.listActiveSockets();
  }
}
