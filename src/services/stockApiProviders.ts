import { Stock } from '@/types';

// Interface for batch stock price data
export interface BatchPriceResult {
  [symbol: string]: number | null;
}

// Interface to define a stock API provider
export interface StockApiProvider {
  name: string;
  fetchPrices: (symbols: string[]) => Promise<BatchPriceResult>;
  batchSize: number;
  batchDelay: number; // in milliseconds
  apiKeyEnvVar?: string;
  apiKey?: string;
}

// Alpha Vantage API Provider
export const alphaVantageProvider: StockApiProvider = {
  name: 'Alpha Vantage',
  apiKey: 'LR78N65XUDF2EZDB', // Default API key - consider moving to environment variable
  apiKeyEnvVar: 'ALPHA_VANTAGE_API_KEY',
  batchSize: 5,
  batchDelay: 15000, // 15 seconds between batches
  fetchPrices: async (symbols: string[]): Promise<BatchPriceResult> => {
    const result: BatchPriceResult = {};
    const API_KEY = process.env[alphaVantageProvider.apiKeyEnvVar] || alphaVantageProvider.apiKey;
    
    if (!API_KEY) {
      console.error('Alpha Vantage API key not found');
      return symbols.reduce((acc, symbol) => ({ ...acc, [symbol]: null }), {});
    }
    
    for (const symbol of symbols) {
      try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Error fetching stock price for ${symbol}: ${response.statusText}`);
          result[symbol] = null;
          continue;
        }
        
        const data = await response.json();
        
        if (data['Global Quote'] && data['Global Quote']['05. price']) {
          result[symbol] = parseFloat(data['Global Quote']['05. price']);
        } else if (data['Information'] && data['Information'].includes('demo')) {
          console.log(`API limit reached for ${symbol} (demo key)`);
          result[symbol] = null;
        } else if (data['Note'] && data['Note'].includes('call frequency')) {
          console.log(`API rate limit reached for ${symbol}`);
          result[symbol] = null;
        } else {
          console.log(`No price data found for ${symbol}`, data);
          result[symbol] = null;
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${symbol} from Alpha Vantage:`, error);
        result[symbol] = null;
      }
    }
    
    return result;
  }
};

// Yahoo Finance API Provider (using a proxy service to avoid CORS issues)
export const yahooFinanceProvider: StockApiProvider = {
  name: 'Yahoo Finance',
  batchSize: 10,
  batchDelay: 5000, // 5 seconds between batches
  fetchPrices: async (symbols: string[]): Promise<BatchPriceResult> => {
    const result: BatchPriceResult = {};
    
    for (const symbol of symbols) {
      try {
        // Using Yahoo Finance API
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          console.error(`Error fetching stock price for ${symbol} from Yahoo: ${response.statusText}`);
          result[symbol] = null;
          continue;
        }
        
        const data = await response.json();
        
        if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
          result[symbol] = data.chart.result[0].meta.regularMarketPrice;
          
          // Additional logging to verify the data
          console.log(`Yahoo Finance data for ${symbol}:`, {
            price: data.chart.result[0].meta.regularMarketPrice,
            currency: data.chart.result[0].meta.currency,
            exchangeName: data.chart.result[0].meta.exchangeName,
            symbol: data.chart.result[0].meta.symbol
          });
        } else {
          console.log(`No price data found for ${symbol} from Yahoo`, data);
          result[symbol] = null;
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${symbol} from Yahoo Finance:`, error);
        result[symbol] = null;
      }
    }
    
    return result;
  }
};

// Financial Modeling Prep API Provider (offers free tier)
export const fmpProvider: StockApiProvider = {
  name: 'Financial Modeling Prep',
  apiKeyEnvVar: 'FMP_API_KEY',
  apiKey: '', // You'll need to sign up for a free API key at https://financialmodelingprep.com/developer/docs/
  batchSize: 10,
  batchDelay: 5000, // 5 seconds between batches
  fetchPrices: async (symbols: string[]): Promise<BatchPriceResult> => {
    const result: BatchPriceResult = {};
    const API_KEY = process.env[fmpProvider.apiKeyEnvVar] || fmpProvider.apiKey;
    
    if (!API_KEY) {
      console.error('Financial Modeling Prep API key not found');
      return symbols.reduce((acc, symbol) => ({ ...acc, [symbol]: null }), {});
    }
    
    try {
      // FMP allows batch requests
      const symbolsString = symbols.join(',');
      const url = `https://financialmodelingprep.com/api/v3/quote/${symbolsString}?apikey=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Error fetching batch prices from FMP: ${response.statusText}`);
        return symbols.reduce((acc, symbol) => ({ ...acc, [symbol]: null }), {});
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.symbol && item.price) {
            result[item.symbol] = item.price;
          } else {
            result[item.symbol] = null;
          }
        }
      }
      
      // Set null for any symbols not returned in the response
      for (const symbol of symbols) {
        if (result[symbol] === undefined) {
          result[symbol] = null;
        }
      }
    } catch (error) {
      console.error(`Failed to fetch prices from Financial Modeling Prep:`, error);
      return symbols.reduce((acc, symbol) => ({ ...acc, [symbol]: null }), {});
    }
    
    return result;
  }
};

// Define the list of available providers in order of preference
export const availableProviders: StockApiProvider[] = [
  yahooFinanceProvider,
  alphaVantageProvider,
  fmpProvider
];