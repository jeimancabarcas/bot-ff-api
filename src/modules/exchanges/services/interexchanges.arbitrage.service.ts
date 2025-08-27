import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ccxt from 'ccxt';
import { EXCHANGES_CONFIG } from 'src/config/exchanges.config';

@Injectable()
export class InterExchangeArbitrage {
  private readonly binance: ccxt.Exchange;
  private readonly bybit: ccxt.Exchange;
  private readonly bitget: ccxt.Exchange;
  private readonly logger = new Logger(InterExchangeArbitrage.name);
  private readonly apiKeyBin: string;
  private readonly secretBin: string;
  private readonly apiKeyByb: string;
  private readonly secretByb: string;
  private readonly apiKeyBitg: string;
  private readonly secretBitg: string;
  private readonly passPhraseBitget: string;
  constructor(private readonly configService: ConfigService) {
    if (EXCHANGES_CONFIG.binance.tesnet == true) {
      this.apiKeyBin = this.configService.getOrThrow('BINANCE_API_KEY_TEST');
      this.secretBin = this.configService.getOrThrow('BINANCE_API_SECRET_TEST');
      this.apiKeyByb = this.configService.getOrThrow('BYBIT_TESTNET_API_KEY');
      this.secretByb = this.configService.getOrThrow('BYBIT_TESTNET_SECRET');
    } else {
      this.apiKeyBin = this.configService.getOrThrow('BINANCE_API_KEY');
      this.secretBin = this.configService.getOrThrow('BINANCE_API_SECRET');
      this.apiKeyByb = this.configService.getOrThrow('BYBIT_API_KEY');
      this.secretByb = this.configService.getOrThrow('BYBIT_API_SECRET');
    }
    this.binance = new ccxt.binance({
      apiKey: this.apiKeyBin,
      secret: this.secretBin,
      enableRateLimit: true,
      options: { defaultType: 'future' },
    });

    this.bybit = new ccxt.bybit({
      apiKey: this.configService.getOrThrow('BYBIT_TESTNET_API_KEY'),
      secret: this.configService.getOrThrow('BYBIT_TESTNET_SECRET'),
      enableRateLimit: true,
      options: { defaultType: 'future' },
    });

    if (EXCHANGES_CONFIG.binance.tesnet === true) {
      this.binance.setSandboxMode(true);
      this.bybit.setSandboxMode(true);
    }
  }

  // Función para verificar saldo en testnet
  async checkBalances(
    exchange: ccxt.Exchange,
    asset: string,
  ): Promise<{ exchange: string; asset: number }> {
    try {
      const balance = await exchange.fetchBalance();
      return {
        exchange: exchange.name as string,
        asset: balance.free[asset] as number,
      };
    } catch (error: any) {
      if (error instanceof ccxt.ExchangeError) {
        this.logger.log(
          `Error verificando saldo en ${exchange.name}:`,
          error.message,
        );
      }
      throw new Error(`Error: ${error ?? error}`);
    }
  }

  // Función para abrir órdenes con bajo slippage
  async fetchOrderBooksAndTrade(symbol: string, asset: string) {
    const maxSlippage = 10; // Tolerancia de slippage en USD
    const orderSize = 0.01; // Tamaño fijo de la orden (en BTC, reducido para testnet)
    try {
      // Verificar saldos en testnet
      this.logger.log('Verificando saldos en testnet...');
      const binanceBalance = await this.checkBalances(this.binance, asset);
      const bybitBalance = await this.checkBalances(this.bybit, asset);

      if (
        !binanceBalance ||
        !bybitBalance ||
        binanceBalance.asset < orderSize ||
        bybitBalance.asset < orderSize
      ) {
        console.error('Saldo insuficiente en uno o más exchanges.');
        return;
      }

      // Obtener libros de órdenes
      const [binanceOrderBook, bybitOrderBook] = await Promise.all([
        this.binance.fetchOrderBook(symbol, 10),
        this.bybit.fetchOrderBook(symbol, 10),
      ]);

      // Mostrar mejores precios
      const binanceBestAsk = binanceOrderBook.asks[0]; // [precio, cantidad]
      const bybitBestBid = bybitOrderBook.bids[0]; // [precio, cantidad]
      this.logger.log(
        `Binance Testnet Mejor Ask: $${binanceBestAsk[0]} (${binanceBestAsk[1]} BTC)`,
      );
      this.logger.log(
        `Bybit Testnet Mejor Bid: $${bybitBestBid[0]} (${bybitBestBid[1]} BTC)`,
      );

      // Encontrar la mejor oportunidad de arbitraje
      const bids = [
        { exchange: 'Bybit', price: bybitBestBid[0], amount: bybitBestBid[1] },
      ];
      //Obtener el valor maximo
      const bestBid = bids.reduce(
        (max, curr) => ((curr.price ?? 0 > (max.price ?? 0)) ? curr : max),
        bids[0],
      );
      if (bestBid.price === undefined || binanceBestAsk[0] === undefined)
        return;
      if (
        (bestBid.price > binanceBestAsk[0] + maxSlippage &&
          binanceBestAsk[1]) ??
        (0 >= orderSize && bestBid.amount) ??
        0 >= orderSize
      ) {
        this.logger.log(
          `Oportunidad de arbitraje detectada! Comprar en Binance, vender en ${bestBid.exchange}`,
        );

        // Precios para órdenes limitadas
        const buyPrice = binanceBestAsk[0]; // Comprar en Binance
        const sellPrice = bestBid.price; // Vender en el mejor bid

        // Colocar órdenes limitadas (mismo tamaño)
        this.logger.log(
          `Colocando orden de compra en Binance Testnet: ${orderSize} BTC a $${buyPrice}`,
        );
        const buyOrder = await this.binance.createLimitBuyOrder(
          symbol,
          orderSize,
          buyPrice,
        );
        this.logger.log('Orden de compra:', buyOrder);

        this.logger.log(
          `Colocando orden de venta en ${bestBid.exchange} Testnet: ${orderSize} BTC a $${sellPrice}`,
        );
        const sellOrder =
          bestBid.exchange === 'Bybit'
            ? await this.bybit.createLimitSellOrder(
                symbol,
                orderSize,
                sellPrice,
              )
            : await this.bitget.createLimitSellOrder(
                symbol,
                orderSize,
                sellPrice,
              );
        this.logger.log('Orden de venta:', sellOrder);

        this.logger.log(
          `Beneficio potencial: $${((sellPrice - buyPrice) * orderSize).toFixed(2)} (sin comisiones)`,
        );
      } else {
        this.logger.log(
          'No hay oportunidad de arbitraje (diferencia insuficiente, slippage alto o liquidez insuficiente).',
        );
      }

      // Mostrar niveles de órdenes iguales
      this.logger.log('\nNiveles de órdenes iguales (bids cercanos):');
      binanceOrderBook.bids.forEach(([price, amount]) => {
        const bybitSimilar = bybitOrderBook.bids.find(
          ([bPrice]) => Math.abs((bPrice ?? 0) - (price ?? 0)) < maxSlippage,
        );
        if (bybitSimilar && (amount ?? 0) > 0.005) {
          this.logger.log(
            `Pared de compra: Binance $${price} (${amount} BTC), Bybit $${bybitSimilar[0]} (${bybitSimilar[1]} BTC)`,
          );
        }
      });
    } catch (error) {
      if (error instanceof ccxt.ExchangeError) {
        this.logger.log('Error:', error.message);
      } else {
        throw new Error(`Error Unknow: ${error}`);
      }
    }
  }
}
