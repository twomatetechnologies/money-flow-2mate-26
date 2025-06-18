# Stock Price Update System Documentation

## Overview

The Money Flow Guardian application includes a robust stock price update system that automatically fetches and updates prices for all stocks in the database. The system is designed to be resilient, with multiple fallback mechanisms, caching, and monitoring.

## Components

### 1. Stock API Providers

Located in `src/services/stockApiProviders.ts`, this module defines interfaces and implementations for different stock API providers:

- **Yahoo Finance**: Best for Indian stocks (using .NS suffix)
- **Alpha Vantage**: Good fallback for most stocks
- **Financial Modeling Prep (FMP)**: Works well for US stocks

Each provider has its own rate limits, batch sizes, and error handling.

### 2. Enhanced Stock Price Service

Located in `src/services/enhancedStockPriceService.js`, this service provides:

- Intelligent caching to reduce API calls
- Provider selection based on stock region
- Fallback mechanisms when providers fail
- Rate limit management
- Health check capabilities

### 3. Stock Price Monitor

Located in `src/services/stockPriceMonitor.js`, this service:

- Tracks update success/failure metrics
- Monitors API provider health
- Generates alerts for system issues
- Provides detailed reports on system performance

### 4. Stock Price Scheduler

Located in `src/services/stockPriceScheduler.js`, this service:

- Schedules regular updates based on market hours
- Manages batched updates to avoid API rate limits
- Handles update failures with retry mechanisms
- Provides manual trigger capabilities for immediate updates

## Update Schedule

The system runs updates at the following times:

1. **Market Open Updates**:
   - 9:30 AM IST for Indian markets (4:00 AM UTC)
   - 9:30 AM EST for US markets (2:30 PM UTC)

2. **Hourly Updates** during market hours:
   - Indian market hours (4-10 UTC)
   - US market hours (14-21 UTC)

3. **End of Day Updates**:
   - 6:00 PM IST for Indian markets (10:30 AM UTC)
   - 4:00 PM EST for US markets (9:00 PM UTC)

4. **Weekly Comprehensive Update**:
   - Saturday at 2:00 AM UTC

## API Endpoints

### Stock Price Refresh

- **POST /api/stocks/refresh-prices**
  - Manual refresh for specific stock symbols
  - Request body: `{ "symbols": ["AAPL", "MSFT", "HDFCBANK"] }`

### Scheduler Control

- **GET /api/stocks/scheduler/status**
  - Returns the current status of the scheduler, monitor, and service

- **POST /api/stocks/scheduler/force-update**
  - Forces an immediate update of all stocks
  - Optional request body: `{ "symbols": ["AAPL", "MSFT"] }` for specific symbols

## Indian Stock Handling

Indian stocks require special handling:

1. **Symbol Mapping**: Indian stock symbols are mapped to include the `.NS` suffix for NSE-listed stocks (e.g., `HDFCBANK` → `HDFCBANK.NS`)

2. **Provider Selection**: Yahoo Finance is prioritized for Indian stocks as it provides more reliable data

3. **Rate Limit Management**: The system handles the stricter rate limits imposed by providers for international stocks

## Monitoring and Alerting

The system includes comprehensive monitoring:

1. **Health Checks**: Regular checks on provider availability and API status

2. **Update Metrics**: Tracking of success rates, response times, and failures

3. **Alerting**: Notification system for critical issues like consecutive failures or extended periods without successful updates

## Troubleshooting

Common issues and solutions:

1. **API Rate Limiting**: The system automatically handles rate limiting by rotating providers and implementing backoff strategies

2. **Provider Failures**: Multiple fallback providers ensure resilience when one provider fails

3. **Zero Prices**: The system validates prices and rejects zero or unreasonable values

## Manual Intervention

For manual intervention:

1. Check the scheduler status: `GET /api/stocks/scheduler/status`
2. Force an update of all stocks: `POST /api/stocks/scheduler/force-update`
3. Update specific stocks: `POST /api/stocks/scheduler/force-update` with symbols in the request body
