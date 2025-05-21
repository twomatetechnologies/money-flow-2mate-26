import { StockHolding } from '@/types';

// The Alpha Vantage API key (free tier)
const ALPHA_VANTAGE_API_KEY = 'LR78N65XUDF2EZDB';

// Interface for batch stock price data
interface BatchPriceResult {
  [symbol: string]: number | null;
}

/**
 * Batch fetch stock prices using Alpha Vantage API
 * This function groups stock symbols and fetches them in batches to reduce API calls
 * 
 * @param symbols Array of stock symbols to fetch prices for
 * @returns Object with stock symbols as keys and prices as values
 */
export const fetchBatchStockPrices = async (symbols: string[]): Promise<BatchPriceResult> => {
  if (!symbols.length) return {};

  const result: BatchPriceResult = {};
  
  try {
    // Check if we can use the Batch Stock Quotes API (premium feature)
    // This would look like: https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=MSFT,AAPL,FB&apikey=demo
    // But for free tier, we have to make individual calls

    // Process in batches of 5 (Alpha Vantage free tier limit is 5 calls per minute)
    const batchSize = 5;
    
    for (let i = 0; i < symbols.length; i += batchSize) {
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(symbols.length/batchSize)}`);
      
      const batch = symbols.slice(i, i + batchSize);
      const batchPromises = batch.map(async (symbol) => {
        try {
          const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
          const response = await fetch(url);
          
          if (!response.ok) {
            console.error(`Error fetching stock price for ${symbol}: ${response.statusText}`);
            result[symbol] = null;
            return;
          }
          
          const data = await response.json();
          
          if (data['Global Quote'] && data['Global Quote']['05. price']) {
            result[symbol] = parseFloat(data['Global Quote']['05. price']);
          } else if (data['Information'] && data['Information'].includes('demo')) {
            console.log(`Using simulated data for ${symbol} due to API limitations/demo key`);
            result[symbol] = null;
          } else if (data['Note'] && data['Note'].includes('call frequency')) {
            console.log(`API rate limit reached for ${symbol}, will use simulation`);
            result[symbol] = null;
          } else {
            console.log(`No price data found for ${symbol}`, data);
            result[symbol] = null;
          }
        } catch (error) {
          console.error(`Failed to fetch price for ${symbol}:`, error);
          result[symbol] = null;
        }
      });
      
      // Process batch in parallel
      await Promise.all(batchPromises);
      
      // Add a delay between batches to respect API rate limits
      if (i + batchSize < symbols.length) {
        console.log("Waiting 15 seconds before processing next batch...");
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds delay between batches
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in fetchBatchStockPrices:', error);
    return symbols.reduce((acc, symbol) => {
      acc[symbol] = null;
      return acc;
    }, {} as BatchPriceResult);
  }
};

/**
 * Generate simulated prices for a batch of stocks
 * Used as a fallback when API data is not available
 * 
 * @param stocks Array of stocks to simulate prices for
 * @returns Object with stock symbols as keys and simulated prices as values
 */
export const simulateBatchStockPrices = (stocks: StockHolding[]): BatchPriceResult => {
  const result: BatchPriceResult = {};
  
  stocks.forEach(stock => {
    // Base volatility - will be different for each stock
    const baseVolatility = Math.random() * 0.8 + 0.2; // 0.2% to 1%
    
    // More volatility for cheaper stocks (common in real markets)
    const priceBasedVolatility = 10 / (stock.currentPrice || 1);
    
    // Calculate max percentage move - more expensive stocks move less in percentage terms
    const maxPercentageMove = baseVolatility * priceBasedVolatility;
    
    // Random price movement between -maxPercentageMove% and +maxPercentageMove%
    const percentageChange = (Math.random() * 2 - 1) * maxPercentageMove;
    
    // Calculate new price and round to 2 decimal places
    result[stock.symbol] = Math.round((stock.currentPrice * (1 + percentageChange / 100)) * 100) / 100;
  });
  
  return result;
};
