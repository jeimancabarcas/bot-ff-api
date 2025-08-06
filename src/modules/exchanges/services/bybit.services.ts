import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RestClientV5 } from 'bybit-api';

@Injectable()
export class BybitService {
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = configService.getOrThrow('');
    this.apiSecret = configService.getOrThrow('');
  }
  async getOrdersP2PBybit(tokenId: string, page: number, size: number) {
    const client = new RestClientV5({
      testnet: false,
      key: this.apiKey,
      secret: this.apiSecret,
    });
    const side = [0, 1];
    // Example parameters
    const params = {
      tokenId: tokenId, // Optional: filter by token ID
      side: side, // Optional: filter by side (0: Buy, 1: Sell)
      page: page, // Required: page number
      size: size, // Required: rows per page
    };
    try {
      const res = await client.getP2POrders(params);
      return res.result.items.map((it) => ({ side: it.side, price: it.price }));
    } catch (error) {
      throw new HttpException(
        `Bybit orders error: ${error}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
