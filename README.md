# P2P Arbitrage Detector API

A professional NestJS application for detecting P2P arbitrage opportunities across Binance, Bybit, and Bitget exchanges.

## Features

- 🔄 Real-time P2P order fetching from multiple exchanges
- 📊 Automated arbitrage opportunity detection
- 🗄️ PostgreSQL database for data persistence
- ⏰ Scheduled scans and cleanup tasks
- 📈 Comprehensive statistics and reporting
- 🔒 Rate limiting and error handling
- 📚 Swagger API documentation
- 🐳 Docker support

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run database migrations: `npm run start:dev`
5. Access API at `http://localhost:3000`
6. View documentation at `http://localhost:3000/api`

### Docker Setup

```bash
docker-compose up -d
```

## API Endpoints

### Arbitrage Opportunities

- `GET /arbitrage/opportunities` - Get current opportunities
- `POST /arbitrage/detect/:asset/:fiat` - Detect new opportunities
- `GET /arbitrage/stats` - Get arbitrage statistics
- `GET /arbitrage/supported-assets` - Get supported assets

### Query Parameters

- `asset` - Crypto asset (USDT, USDC, BTC, ETH)
- `fiat` - Fiat currency (USD, EUR, ARS, COP, BRL, MXN)
- `minProfitPercentage` - Minimum profit threshold
- `limit` - Maximum results (default: 50)

## Supported Exchanges

- **Binance** - P2P marketplace
- **Bybit** - OTC trading
- **Bitget** - P2P trading

## Monitoring & Maintenance

- Automatic cleanup of old data (configurable)
- Scheduled opportunity scanning (every 5 minutes)
- Daily reporting and statistics
- Comprehensive logging

## License

MIT License
