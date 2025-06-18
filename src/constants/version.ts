
// This file contains the application version information
// The version follows semantic versioning (MAJOR.MINOR.PATCH)

export const APP_VERSION = '0.1.2';

// Changelog entries - newest at the top
export const CHANGELOG = [
  {
    version: '0.1.2',
    date: '2025-06-18',
    changes: [
      'Added multiple stock data providers with automatic fallback mechanism',
      'Switched to Yahoo Finance as primary stock data provider to avoid API limits',
      'Improved stock price validation to ensure accurate data',
      'Added ProviderStatus component to show current data source',
      'Fixed issue with stock names being lost during price updates'
    ]
  },
  {
    version: '0.1.1',
    date: '2025-06-17',
    changes: [
      'Improved stock price updates by removing simulation fallback',
      'Added manual refresh button for stock prices',
      'Enhanced error handling for stock price API integration',
      'Added real-time price update notification system'
    ]
  },
  {
    version: '0.1.0',
    date: '2025-04-30',
    changes: [
      'Initial release',
      'Dashboard with financial overview',
      'Investments tracking for stocks, gold, and fixed deposits',
      'Financial goals tracking',
      'Two-factor authentication support',
      'Family members management'
    ]
  }
];
