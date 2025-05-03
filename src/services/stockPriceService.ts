
import { StockHolding } from '@/types';
import { toast } from '@/hooks/use-toast';
import { getStocks, updateStock } from './crudService';

// The Alpha Vantage API key (free tier)
const ALPHA_VANTAGE_API_KEY = 'demo'; // Replace with your API key for production use

// Fetch real stock data from Alpha Vantage API
const fetchStockPrice = async (symbol: string): Promise<number | null> => {
  try {
    // Using the Global Quote endpoint to get latest price
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Error fetching stock price for ${symbol}: ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    // Alpha Vantage returns price in the "Global Quote" object
    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      const price = parseFloat(data['Global Quote']['05. price']);
      return price;
    } else if (data['Information'] && data['Information'].includes('demo')) {
      // If using demo key, API might return info message instead of data
      console.log(`Using simulated data for ${symbol} due to API limitations`);
      return null; // Will use simulation fallback
    } else {
      console.error(`No price data found for ${symbol}`, data);
      return null;
    }
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return null;
  }
};

// Generate a simulated price based on current price with realistic market behavior
const simulateStockPrice = (stock: StockHolding): number => {
  // Base volatility - will be different for each stock
  const baseVolatility = Math.random() * 0.8 + 0.2; // 0.2% to 1%
  
  // More volatility for cheaper stocks (common in real markets)
  const priceBasedVolatility = 10 / stock.currentPrice;
  
  // Calculate max percentage move - more expensive stocks move less in percentage terms
  const maxPercentageMove = baseVolatility * priceBasedVolatility;
  
  // Random price movement between -maxPercentageMove% and +maxPercentageMove%
  const percentageChange = (Math.random() * 2 - 1) * maxPercentageMove;
  
  // Calculate new price and round to 2 decimal places
  return Math.round((stock.currentPrice * (1 + percentageChange / 100)) * 100) / 100;
};

// Start monitoring real-time stock prices
export const startStockPriceMonitoring = async (alertThreshold: number) => {
  const updateStockPrices = async () => {
    try {
      const stocks = await getStocks();
      
      for (const stock of stocks) {
        // Get the real price from the API
        const newPrice = await fetchStockPrice(stock.symbol);
        
        // If we couldn't get a real price, use simulation instead
        const finalPrice = newPrice !== null ? newPrice : simulateStockPrice(stock);
        
        const previousPrice = stock.currentPrice;
        
        // Calculate the price change as a percentage
        const changePercent = ((finalPrice - previousPrice) / previousPrice) * 100;
        const absoluteChange = Math.abs(changePercent);
        
        // Check if the change exceeds the alert threshold
        if (absoluteChange >= alertThreshold) {
          // Alert the user about the significant price change
          const direction = changePercent >= 0 ? 'increased' : 'decreased';
          toast({
            title: `${stock.symbol} Alert`,
            description: `${stock.name} has ${direction} by ${absoluteChange.toFixed(2)}% (₹${previousPrice.toFixed(2)} → ₹${finalPrice.toFixed(2)})`,
            variant: changePercent >= 0 ? 'default' : 'destructive',
          });
        }
        
        // Update the stock with the new price
        await updateStock(stock.id, {
          currentPrice: finalPrice,
          change: finalPrice - previousPrice,
          changePercent,
          value: finalPrice * stock.quantity,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error("Error updating stock prices:", error);
    }
  };

  // Initial update
  await updateStockPrices();
  
  // Set up periodic updates (every 60 seconds)
  // Alpha Vantage free tier has rate limits, so we don't want to call too frequently
  const intervalId = setInterval(updateStockPrices, 60000);
  
  // Return a function to stop monitoring - this is important for cleanup
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      console.log("Stock price monitoring stopped");
    }
  };
};

// This function is kept for backward compatibility
export const simulateStockPriceUpdates = async (alertThreshold: number) => {
  return startStockPriceMonitoring(alertThreshold);
};
