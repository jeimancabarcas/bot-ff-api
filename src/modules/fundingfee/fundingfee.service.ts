import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FundingFeeTypes } from '../exchanges/interfaces/binance.types.interface';
import axios from 'axios';
import { ExchangeConnectionException } from 'src/exceptions/exchange.exceptions';
import { ResponseBybitfundingRate } from '../exchanges/interfaces/bybit.types.interface';
import { FuturesProductTypeV2, RestClientV2 } from 'bitget-api';

type ResponseRate = {
  symbol: string;
  fundingRate: string;
  nextFundingTime: string;
};

@Injectable()
export class FundingfeeService {
  constructor() {}
  async getFundingRateBinance(symbol: string): Promise<FundingFeeTypes> {
    symbol = symbol.toUpperCase();
    try {
      const response = await axios.get<FundingFeeTypes[]>(
        'https://fapi.binance.com/fapi/v1/fundingRate',
        {
          params: {
            symbol: symbol,
            limit: 1, // Última tasa de financiamiento
          },
        },
      );

      if (!response.data || response.data.length === 0) {
        throw new ExchangeConnectionException(
          `No funding rate data found for symbol: ${symbol}`,
          new Error('Empty response'),
        );
      }

      const data = response.data[0];

      const fundingFee: FundingFeeTypes = {
        symbol: data.symbol,
        fundingRate: (Number(data.fundingRate) * 100).toFixed(4) + '%',
        fundingTime: new Date(data.fundingTime).toLocaleString(),
      };

      return fundingFee;
    } catch (error) {
      if (error instanceof Error) {
        throw new ExchangeConnectionException(
          'Connection Failure Binance',
          error,
        );
      } else {
        throw new Error('Unknow Error');
      }
    }
  }
  async getFundingRateBybit(symbol: string): Promise<FundingFeeTypes> {
    try {
      symbol = symbol.toUpperCase();
      const response = await axios.get<ResponseBybitfundingRate>(
        'https://api.bybit.com/v5/market/funding/history',
        {
          params: {
            category: 'linear',
            limit: 1, // Última tasa de financiamiento
            symbol: symbol,
          },
        },
      );

      const info = response.data.result.list[0];

      if (!response.data.result || response.data.result.list.length === 0) {
        throw new ExchangeConnectionException(
          `No funding rate data found for symbol: ${symbol}`,
          new Error('Empty response'),
        );
      }
      const fundingFee: FundingFeeTypes = {
        symbol: info.symbol,
        fundingRate: (Number(info.fundingRate) * 100).toFixed(4) + '%',
        fundingTime: new Date(
          Number(info.fundingRateTimestamp),
        ).toLocaleString(),
      };
      return fundingFee;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ExchangeConnectionException(
          'Connection Failure Bybit',
          error,
        );
      } else {
        throw new Error('Unknown Error');
      }
    }
  }
  async getFundingRateBitget(
    apiKey: string,
    apiSecret: string,
    apiPass: string,
    symbol: string,
    productType: FuturesProductTypeV2,
  ): Promise<ResponseRate> {
    const client = new RestClientV2({
      apiKey,
      apiSecret,
      apiPass,
    });

    try {
      const [rateRes, timeRes] = await Promise.all([
        client.getFuturesCurrentFundingRate({
          symbol,
          productType,
        }),
        client.getFuturesNextFundingTime({
          symbol,
          productType,
        }),
      ]);

      if (
        !rateRes.data ||
        rateRes.data.length === 0 ||
        timeRes.data.length === 0
      ) {
        throw new HttpException(
          `Bitget funding rate empty ${rateRes.msg} ${timeRes.msg}`,
          HttpStatus.NO_CONTENT,
        );
      }
      //Convierte a objeto
      const fundingRate = rateRes.data.reduce((f) => ({
        symbol: f.symbol,
        fundingRate: f.fundingRate,
      }));
      //Array de solo time
      const fundingTime = timeRes.data.map((ft) => ft.nextFundingTime);
      //Retorna un objeto combinado
      return {
        fundingRate: `${parseFloat(fundingRate.fundingRate).toFixed(4)} %`,
        symbol: fundingRate.symbol,
        nextFundingTime: new Date(Number(fundingTime)).toLocaleString(),
      };
    } catch (error) {
      throw new HttpException(
        `Bitget funding-rate Error: ${error}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
