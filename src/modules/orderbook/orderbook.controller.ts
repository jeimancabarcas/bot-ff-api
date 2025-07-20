import { Controller, Get, Query } from '@nestjs/common';
import { OrderbookService } from './orderbook.service';
import { OrderBookDtoResponse } from '../exchanges/interfaces/binance.types.interface';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderBookQueryDto } from './dto/order-book.dto';

@ApiTags('orderbook')
@Controller('orderbook')
export class OrderbookController {
  constructor(private readonly orderbookService: OrderbookService) {}
  @Get('order-book-binance')
  @ApiOperation({ summary: 'Get Order-Book Binance' })
  @ApiResponse({
    status: 200,
    description: 'List of ask and bids',
  })
  @ApiQuery({
    name: 'symbol',
    required: true,
    description: 'Crypto asset (e.g., USDT)',
  })
  @ApiQuery({
    name: 'limit',
    required: true,
  })
  async getOrderBookBinance(
    @Query() query: OrderBookQueryDto,
  ): Promise<OrderBookDtoResponse> {
    const { symbol, limit = 10 } = query;
    const result: OrderBookDtoResponse =
      await this.orderbookService.getOrderBookBinance(symbol, limit);
    return result;
  }
}
