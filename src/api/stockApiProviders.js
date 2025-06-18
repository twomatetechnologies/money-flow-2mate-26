/**
 * JavaScript version of stockApiProviders
 * This file serves as a bridge between JavaScript and TypeScript modules
 */

// Interface for batch stock price data

// Alpha Vantage API Provider
export const alphaVantageProvider = {
  name: 'Alpha Vantage',
  apiKey: 'LR78N65XUDF2EZDB', // Default API key - consider moving to environment variable
  apiKeyEnvVar: 'ALPHA_VANTAGE_API_KEY',
  batchSize: 5,
  batchDelay: 15000, // 15 seconds between batches
  fetchPrices: async (symbols) => {
    const result = {};
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
export const yahooFinanceProvider = {
  name: 'Yahoo Finance',
  batchSize: 1, // Reduced batch size to avoid rate limits
  batchDelay: 60000, // Increased delay to 60 seconds between batches for rate limit avoidance
  fetchPrices: async (symbols) => {
    const result = {};
    
    for (const symbol of symbols) {
      try {
        // Add a small delay between individual symbol requests
        if (symbols.indexOf(symbol) > 0) {
          console.log(`[Yahoo Finance] Waiting 30 seconds between symbols to avoid rate limiting...`);
          await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay between symbols
        }
        
        // Using Yahoo Finance API
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
            'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
            'Referer': 'https://finance.yahoo.com/'
          },
          timeout: 15000 // 15 second timeout
        });
        
        if (response.status === 429) {
          console.log(`[Yahoo Finance] Rate limited for ${symbol}. Backing off for 120 seconds...`);
          // Wait 2 minutes on rate limit, then skip this symbol
          await new Promise(resolve => setTimeout(resolve, 120000));
          result[symbol] = null;
          continue;
        }
        
        if (!response.ok) {
          console.error(`Error fetching stock price for ${symbol} from Yahoo: ${response.status} ${response.statusText}`);
          result[symbol] = null;
          continue;
        }
        
        const data = await response.json();
        
        if (data.chart?.result?.[0]?.meta?.regularMarketPrice) {
          const price = data.chart.result[0].meta.regularMarketPrice;
          result[symbol] = price;
          
          // Additional logging to verify the data
          console.log(`Yahoo Finance data for ${symbol}:`, {
            price: price,
            currency: data.chart.result[0].meta.currency,
            exchangeName: data.chart.result[0].meta.exchangeName,
            symbol: data.chart.result[0].meta.symbol
          });
        } else {
          console.log(`No price data found for ${symbol} from Yahoo`, data?.chart?.error || 'Unknown structure');
          result[symbol] = null;
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${symbol} from Yahoo Finance:`, error.message);
        result[symbol] = null;
      }
    }
    
    return result;
  }
};

// Financial Modeling Prep API Provider (offers free tier)
export const fmpProvider = {
  name: 'Financial Modeling Prep',
  apiKeyEnvVar: 'FMP_API_KEY',
  apiKey: 'wBPziir7XFSKm4WIZpLGx6nyF5TmN4XC', // Default key from .env
  batchSize: 10,
  batchDelay: 5000, // 5 seconds between batches
  fetchPrices: async (symbols) => {
    const result = {};
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
export const availableProviders = [
  fmpProvider,  // First choice since we have an API key
  yahooFinanceProvider,
  alphaVantageProvider
];
