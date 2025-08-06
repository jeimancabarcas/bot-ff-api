import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FundingfeeService } from '../fundingfee/fundingfee.service';
import { Side } from './interfaces/orders.request.interfaces';
import { PositionSide } from 'binance';
import * as crypto from 'crypto';
import { EXCHANGES_CONFIG } from 'src/config/exchanges.config';
import axios from 'axios';
@Injectable()
export class OrdersService {
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly fundingFeeService: FundingfeeService,
  ) {
    this.apiKey = configService.getOrThrow('BINANCE_API_KEY');
    this.apiSecret = configService.getOrThrow('BINANCE_API_SECRET');
  }
  async placeOrder(
    symbol: string,
    side: Side,
    positionSide: PositionSide,
    quantity: string,
  ): Promise<void> {
    const timestamp = Date.now();
    const query = timestamp.toString();

    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(query)
      .digest('hex');

    const params = {
      symbol,
      side,
      positionSide,
      type: 'MARKET',
      quantity,
      timestamp,
      signature,
    };

    try {
      await axios.post(
        `${EXCHANGES_CONFIG.binance.baseUrlFapi}${EXCHANGES_CONFIG.binance.endPoints.order}`,
        { params },
        {
          headers: {
            'X-MBX-APIKEY': this.apiKey,
          },
        },
      );
    } catch (error) {
      throw new HttpException(
        `Error Created Order: ${error}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
