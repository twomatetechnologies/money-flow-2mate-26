# Stock Price API Integration

This document explains how the Money Flow Guardian application fetches stock price data from external APIs.

## Stock Data Providers

The application uses multiple stock data providers with a fallback mechanism to ensure reliable data retrieval:

### 1. Alpha Vantage (Primary Provider)

- **API Documentation**: [Alpha Vantage API](https://www.alphavantage.co/documentation/)
- **Free Tier Limitations**: 5 API calls per minute, 500 calls per day
- **Batch Size**: 5 symbols per batch (individual calls)
- **Features**: Global stock data, forex, crypto, technical indicators

### 2. Yahoo Finance (Secondary Provider)

- **API**: Public Yahoo Finance API
- **Limitations**: Can be subject to CORS issues and rate limiting
- **Batch Size**: 10 symbols per batch
- **Features**: Real-time and historical stock data, market news

### 3. Financial Modeling Prep (Tertiary Provider)

- **API Documentation**: [Financial Modeling Prep API](https://financialmodelingprep.com/developer/docs/)
- **Free Tier Limitations**: 250-300 API calls per day
- **Batch Size**: Multiple symbols in a single request
- **Features**: Real-time stock data, financial statements, company profiles

## Fallback Mechanism

The application implements a smart fallback mechanism:

1. The system starts with the primary provider (Alpha Vantage)
2. If the primary provider fails (e.g., API limit reached), it automatically switches to the secondary provider
3. This process continues until a provider successfully returns data or all providers are exhausted
4. The system tracks provider failures to make intelligent decisions about which provider to use

## Notification System

The application provides notifications to users about the status of stock price fetching:

- **API Limit Reached**: When a provider's API limit is reached and the system is switching to an alternative source
- **Partial Updates**: When some stock prices could not be fetched but others were successful
- **Success**: When all stock prices are successfully fetched after previous failures
- **All Providers Failed**: When all available providers fail to fetch stock prices

## Adding a New Provider

To add a new stock data provider:

1. Create a new provider object in `src/services/stockApiProviders.ts` following the `StockApiProvider` interface
2. Add the new provider to the `availableProviders` array
3. Test the integration to ensure it works correctly

Example:

```typescript
// New provider implementation
export const newProvider: StockApiProvider = {
  name: 'New Provider Name',
  apiKey: 'YOUR_API_KEY', // or use an environment variable
  apiKeyEnvVar: 'NEW_PROVIDER_API_KEY',
  batchSize: 10,
  batchDelay: 5000,
  fetchPrices: async (symbols: string[]): Promise<BatchPriceResult> => {
    // Implementation details
    // ...
  }
};

// Add to available providers
export const availableProviders: StockApiProvider[] = [
  alphaVantageProvider,
  yahooFinanceProvider,
  fmpProvider,
  newProvider // Add the new provider here
];
```

## Error Handling

The system handles various error scenarios:

- Network connectivity issues
- API rate limiting
- Invalid responses
- Missing data for specific symbols
- Total API failures

Each error is logged, and appropriate notifications are shown to users.

## Notes for Production Environment

For a production environment, consider:

1. Moving API keys to environment variables or a secure vault
2. Implementing additional caching to reduce API calls
3. Setting up a proxy server to avoid CORS issues with Yahoo Finance
4. Adding more sophisticated error handling and logging
5. Implementing a retry mechanism with exponential backoff for temporary failures
