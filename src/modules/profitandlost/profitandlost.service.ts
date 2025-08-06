import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CategoryV5, ClosedPnLV5, RestClientV5 } from 'bybit-api';
import { CTFuturesTraderProfitHistoryItemV2, RestClientV2 } from 'bitget-api';

@Injectable()
export class ProfitandlostService {
  async getProfitandLostBybit(
    key: string,
    secret: string,
    category: CategoryV5,
  ): Promise<ClosedPnLV5[]> {
    const client = new RestClientV5({
      testnet: false,
      key: key,
      secret: secret,
    });
    try {
      const res = await client.getClosedPnL({
        category: category,
        limit: 1,
      });
      if (!res.result || res.result.list.length === 0) {
        throw new Error(
          `Bybit Profit and lost empty: list -> ${res.result.list.length} []`,
        );
      }
      return res.result.list;
    } catch (error) {
      throw new HttpException(`${error}`, HttpStatus.BAD_GATEWAY);
    }
  }

  async getProfitandLostBitget(
    apiKey: string,
    apiSecret: string,
    apiPass: string,
  ): Promise<CTFuturesTraderProfitHistoryItemV2[] | undefined> {
    const client = new RestClientV2({
      apiKey,
      apiSecret,
      apiPass,
    });
    try {
      const res = await client.getFuturesTraderProfitHistory();
      if (!res.data || res.data.profitHistoryList.length === 0) {
        throw new Error(`Bitget Profit empty: []`);
      }
      return res.data.profitHistoryList.map((pnl) => pnl);
    } catch (error) {
      throw new HttpException(`${error}`, HttpStatus.BAD_GATEWAY);
    }
  }

  async getProfitandLostBinance() {}
}
