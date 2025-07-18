export const EXCHANGES_CONFIG = {
  binance: {
    name: 'Binance',
    baseUrlp2p: 'https://p2p.binance.com/',
    baseUrlFapi: 'https://fapi.binance.com',
    baseUrlBalanceSpot: 'https://api.binance.com',
    rateLimit: 1200, // requests per minute
    endPoints: {
      P2PorderUrl: 'bapi/c2c/v2/friendly/c2c/adv/search',
      fundingRate: 'v2/public/funding-rate',
      orderBook: 'fapi/v1/depth',
      balanceFuture: '/fapi/v2/account',
      balanceSpot: '/api/v3/account',
    },
  },
  bybit: {
    name: 'Bybit',
    baseUrl: 'https://api2.bybit.com',
    rateLimit: 600,
    endPoints: {
      P2PorderUrl: 'fiat/otc/item/online',
      fundingRate: 'v2/public/funding/prev-funding-rate',
    },
  },
  bitget: {
    name: 'Bitget',
    baseUrl: 'https://www.bitget.com/v1/msg/push/public',
    rateLimit: 600,
  },
};

export const SUPPORTED_FIATS = ['USD', 'EUR', 'ARS', 'COP', 'BRL', 'MXN'];
export const SUPPORTED_CRYPTOS = ['USDT', 'USDC', 'BTC', 'ETH'];
