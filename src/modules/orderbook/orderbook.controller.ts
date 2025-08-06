import { Controller, Get, Query } from '@nestjs/common';
import { OrderbookService } from './orderbook.service';
import { OrderBookDtoResponse } from '../exchanges/interfaces/binance.types.interface';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  OrderBookQueryDtoBinance,
  OrderBookQueryDtoBitget,
  OrderBookQueryDtoBybit,
} from './dto/order-book.dto';
import { OrderBookResponse } from './interfaces/bybit.interfaces';
import { OrderBookResponsBitget } from './interfaces/bitget.interfaces';

@ApiTags('Orderbook')
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
    @Query() query: OrderBookQueryDtoBinance,
  ): Promise<OrderBookDtoResponse> {
    const { symbol, limit = 10 } = query;
    const result: OrderBookDtoResponse =
      await this.orderbookService.getOrderBookBinance(symbol, limit);
    return result;
  }

  @Get('order-book-bybit')
  @ApiOperation({ summary: 'Get Order-Book Bybit' })
  @ApiResponse({
    status: 200,
    description: 'List of ask and bids',
  })
  @ApiQuery({
    name: 'category',
    required: true,
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
  async getOrderBookBybit(
    @Query() query: OrderBookQueryDtoBybit,
  ): Promise<OrderBookResponse> {
    const { symbol, limit } = query;
    const category = query.category;
    const result: OrderBookResponse =
      await this.orderbookService.getOrderBookBybit(category, symbol, limit);
    return result;
  }

  @Get('order-book-bitget')
  @ApiOperation({ summary: 'Get Order-Book Bitget' })
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
    name: 'type',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  async getOrderBookBitget(
    @Query() query: OrderBookQueryDtoBitget,
  ): Promise<OrderBookResponsBitget> {
    const { symbol, limit } = query;
    const type = query.type;
    const result: OrderBookResponsBitget =
      await this.orderbookService.getOrderBookBitget(symbol, type, limit);
    return result;
  }
}
