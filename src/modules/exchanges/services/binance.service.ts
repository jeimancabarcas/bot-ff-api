import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  BinanceP2PResponsePrice,
  ResponseFuturesBinance,
  ResponseSpotBinancePrice,
  TradeType,
} from '../interfaces/binance.types.interface';

@Injectable()
export class BinanceService {
  async getP2PBinancePrice(
    asset: string,
    fiat: string,
    tradeType: string,
    rows: number,
  ) {
    try {
      const res = await axios.post<BinanceP2PResponsePrice>(
        'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
        {
          asset,
          fiat,
          tradeType,
          page: 1,
          rows: rows,
          payTypes: [],
          publisherType: null,
          merchantCheck: false,
        },
      );
      const offer = res.data.data;
      return offer.map((of) => ({
        asset: of.adv.asset,
        fiat: of.adv.fiatUnit,
        tradeType: of.adv.tradeType,
        price: of.adv.price,
        minSingleAmount: of.adv.minSingleTransAmount,
        maxSingleAmount: of.adv.maxSingleTransAmount,
        comisionRate: of.adv.commissionRate,
      }));
    } catch (error) {
      throw new HttpException(
        `Error BinanceP2Price Error: ${error}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
  async getFuturesBinancePrice(symbol: string) {
    try {
      const res = await axios.get<ResponseFuturesBinance>(
        `https://fapi.binance.com/fapi/v1/ticker/bookTicker?symbol=${symbol}`,
      );
      if (!res.data) {
        throw new Error('Binance Futures Empty Values');
      }
      return {
        ...res.data,
        time: new Date(res.data.time),
        lastUpdateId: new Date(res.data.lastUpdateId),
      };
    } catch (error) {
      throw new HttpException(`${error}`, HttpStatus.BAD_GATEWAY);
    }
  }

  async getSpotBinancePrice(symbol: string) {
    try {
      const { data } = await axios.get<ResponseSpotBinancePrice>(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`,
      );
      return {
        symbol: data.symbol,
        price: parseFloat(data.price).toFixed(2),
      };
    } catch (error) {
      throw new HttpException(
        `Error BinanceSpot ${error}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getBinanceArbitrage(
    asset: string,
    fiat: string,
    symbol: string,
    rows: number,
  ) {
    const tradeType: TradeType = {
      buy: 'BUY',
      sell: 'SELL',
    };
    const [p2pBuy, p2pSell, spot] = await Promise.all([
      this.getP2PBinancePrice(asset, fiat, tradeType.buy, rows),
      this.getP2PBinancePrice(asset, fiat, tradeType.sell, rows),
      this.getSpotBinancePrice(symbol),
    ]);
    const spreadP = (Number(p2pSell) - Number(p2pBuy)) / Number(p2pBuy);
    return {
      p2pBuy: p2pBuy, // Precio al que alguien te VENDE BTC (tú compras)
      p2pSell: p2pSell, // Precio al que alguien te COMPRA BTC (tú vendes)
      spotPrice: spot, // En USDT
      spreadPercent: `${parseFloat(String(spreadP * 100)).toFixed(2)} %`,
    };
  }
}
